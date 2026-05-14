from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import json
import bcrypt
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import pdfplumber
import io

from models import (
    UserCreate, UserLogin, UserProfile, UserUpdate, TokenResponse,
    InterviewSessionCreate, InterviewSession, AnswerSubmit, Answer,
    CompanyPrepRequest, CompanyPrep, Resume,
    SalarySetup, SalaryMessage,
    Plan, InterviewMode, Persona, Round, SessionStatus,
    gen_id, now_utc
)
from ai_service import (
    generate_question, evaluate_answer, generate_company_prep,
    analyze_resume, salary_negotiation_turn, generate_session_summary,
    PERSONA_NAMES
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'interviewiq')]

# JWT Config
SECRET_KEY = os.environ.get('JWT_SECRET', 'interviewiq-secret-key-2024-very-secure')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE = 24  # hours

# Security
security = HTTPBearer(auto_error=False)

app = FastAPI(title="InterviewIQ API")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# ==================== HELPERS ====================

def serialize_doc(doc):
    """Serialize MongoDB document for JSON response"""
    if doc is None:
        return None
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == '_id':
                continue
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, list):
                result[key] = [serialize_doc(item) if isinstance(item, dict) else item for item in value]
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            else:
                result[key] = value
        return result
    return doc

def create_token(user_id: str, email: str):
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return serialize_doc(user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id:
            user = await db.users.find_one({"id": user_id}, {"_id": 0})
            return serialize_doc(user) if user else None
    except JWTError:
        pass
    return None

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user_id = gen_id()
    user = {
        "id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hashed,
        "plan": "FREE",
        "streak_days": 0,
        "last_active_date": None,
        "milestones": [],
        "total_sessions": 0,
        "created_at": now_utc().isoformat()
    }
    await db.users.insert_one(user)
    
    token = create_token(user_id, data.email)
    user_response = {k: v for k, v in user.items() if k not in ['password_hash', '_id']}
    return {"access_token": token, "token_type": "bearer", "user": user_response}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not bcrypt.checkpw(data.password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_token(user['id'], user['email'])
    user_response = serialize_doc({k: v for k, v in user.items() if k not in ['password_hash', '_id']})
    return {"access_token": token, "token_type": "bearer", "user": user_response}

@api_router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return {"user": user}

@api_router.put("/auth/profile")
async def update_profile(data: UserUpdate, user=Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return {"user": serialize_doc(updated)}

# ==================== INTERVIEW ROUTES ====================

@api_router.post("/interviews/start")
async def start_interview(data: InterviewSessionCreate, user=Depends(get_current_user)):
    # Check plan limits for free users
    if user.get('plan', 'FREE') == 'FREE':
        month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        count = await db.interview_sessions.count_documents({
            "user_id": user["id"],
            "created_at": {"$gte": month_start.isoformat()}
        })
        if count >= 3:
            raise HTTPException(status_code=403, detail="Free plan limited to 3 interviews per month. Upgrade to Pro for unlimited.")
    
    if data.mode == InterviewMode.VOICE and user.get('plan', 'FREE') == 'FREE':
        raise HTTPException(status_code=403, detail="Voice interviews require Pro plan or higher.")
    
    session_id = gen_id()
    session = {
        "id": session_id,
        "user_id": user["id"],
        "company": data.company,
        "role": data.role,
        "experience_level": data.experience_level,
        "mode": data.mode.value,
        "persona": data.persona.value,
        "round": data.round.value,
        "status": "IN_PROGRESS",
        "overall_score": None,
        "total_questions": 0,
        "created_at": now_utc().isoformat(),
        "conversation_history": []
    }
    await db.interview_sessions.insert_one(session)
    
    # Generate first question
    try:
        question = await generate_question(
            session_id, data.persona.value, data.company, data.role,
            data.experience_level, data.round.value
        )
    except Exception as e:
        logger.error(f"Failed to generate question: {e}")
        # Clean up the session
        await db.interview_sessions.delete_one({"id": session_id})
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
    
    # Store the question
    session['conversation_history'].append({"role": "interviewer", "text": question})
    await db.interview_sessions.update_one(
        {"id": session_id},
        {"$set": {"conversation_history": session['conversation_history'], "total_questions": 1}}
    )
    
    return {
        "session": serialize_doc({k: v for k, v in session.items() if k != '_id'}),
        "question": question,
        "question_number": 1
    }

@api_router.post("/interviews/{session_id}/answer")
async def submit_answer(session_id: str, data: AnswerSubmit, user=Depends(get_current_user)):
    session = await db.interview_sessions.find_one({"id": session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.get('status') == 'COMPLETED':
        raise HTTPException(status_code=400, detail="Session already completed")
    
    # Get the last question from conversation history
    history = session.get('conversation_history', [])
    last_question = ""
    for entry in reversed(history):
        if entry.get('role') == 'interviewer':
            last_question = entry['text']
            break
    
    # Add user answer to conversation
    history.append({"role": "candidate", "text": data.answer_text})
    
    # Evaluate the answer
    evaluation = await evaluate_answer(last_question, data.answer_text, session.get('persona', 'RECRUITER'))
    
    # Store answer in DB
    answer_doc = {
        "id": gen_id(),
        "session_id": session_id,
        "question_text": last_question,
        "answer_text": data.answer_text,
        "score": evaluation.get('overallScore', 0),
        "clarity_score": evaluation.get('scores', {}).get('clarity', 0),
        "confidence_score": evaluation.get('scores', {}).get('confidence', 0),
        "structure_score": evaluation.get('scores', {}).get('structure', 0),
        "depth_score": evaluation.get('scores', {}).get('depth', 0),
        "relevance_score": evaluation.get('scores', {}).get('relevance', 0),
        "completeness_score": evaluation.get('scores', {}).get('completeness', 0),
        "feedback": evaluation.get('whatWorked', '') + ' ' + evaluation.get('whatWasMissing', ''),
        "improved_answer": evaluation.get('rewrittenAnswer', ''),
        "what_worked": evaluation.get('whatWorked', ''),
        "missing_points": evaluation.get('whatWasMissing', ''),
        "detected_framework": evaluation.get('detectedFramework', 'NONE'),
        "filler_words_detected": evaluation.get('fillerWordsDetected', False),
        "had_specific_numbers": evaluation.get('hadSpecificNumbers', False),
        "created_at": now_utc().isoformat()
    }
    await db.answers.insert_one(answer_doc)
    
    # Update session conversation history
    await db.interview_sessions.update_one(
        {"id": session_id},
        {"$set": {"conversation_history": history}}
    )
    
    return {
        "evaluation": evaluation,
        "answer_id": answer_doc["id"]
    }

@api_router.post("/interviews/{session_id}/next-question")
async def next_question(session_id: str, user=Depends(get_current_user)):
    session = await db.interview_sessions.find_one({"id": session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    history = session.get('conversation_history', [])
    q_count = session.get('total_questions', 0) + 1
    
    if q_count > 12:
        return {"question": None, "is_complete": True, "question_number": q_count}
    
    question = await generate_question(
        session_id, session.get('persona', 'RECRUITER'),
        session.get('company', 'General'), session.get('role', 'Software Engineer'),
        session.get('experience_level', 'mid'), session.get('round', 'BEHAVIORAL'),
        history
    )
    
    history.append({"role": "interviewer", "text": question})
    await db.interview_sessions.update_one(
        {"id": session_id},
        {"$set": {"conversation_history": history, "total_questions": q_count}}
    )
    
    return {"question": question, "is_complete": False, "question_number": q_count}

@api_router.post("/interviews/{session_id}/complete")
async def complete_interview(session_id: str, user=Depends(get_current_user)):
    session = await db.interview_sessions.find_one({"id": session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    answers = await db.answers.find({"session_id": session_id}, {"_id": 0}).to_list(100)
    
    # Calculate averages
    if answers:
        scores = [a.get('score', 0) for a in answers if a.get('score') is not None]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        dims = ['clarity_score', 'confidence_score', 'structure_score', 'depth_score', 'relevance_score', 'completeness_score']
        dim_avgs = {}
        for d in dims:
            vals = [a.get(d, 0) for a in answers if a.get(d) is not None]
            dim_avgs[d] = sum(vals) / len(vals) if vals else 0
        
        # Get AI summary
        summary = await generate_session_summary(answers)
    else:
        avg_score = 0
        dim_avgs = {d: 0 for d in ['clarity_score', 'confidence_score', 'structure_score', 'depth_score', 'relevance_score', 'completeness_score']}
        summary = {"strengths": [], "improvements": [], "overallFeedback": "No answers submitted."}
    
    # Update session
    update_data = {
        "status": "COMPLETED",
        "overall_score": round(avg_score, 1),
        "completed_at": now_utc().isoformat(),
        **{k: round(v, 1) for k, v in dim_avgs.items()}
    }
    await db.interview_sessions.update_one({"id": session_id}, {"$set": update_data})
    
    # Update user stats
    await db.users.update_one(
        {"id": user["id"]},
        {"$inc": {"total_sessions": 1}}
    )
    
    # Check milestones
    total = (user.get('total_sessions', 0) or 0) + 1
    milestones = user.get('milestones', []) or []
    new_milestones = []
    if total == 1 and 'first_interview' not in milestones:
        new_milestones.append('first_interview')
    if total >= 10 and 'sessions_10' not in milestones:
        new_milestones.append('sessions_10')
    if total >= 25 and 'sessions_25' not in milestones:
        new_milestones.append('sessions_25')
    if avg_score >= 70 and 'score_70' not in milestones:
        new_milestones.append('score_70')
    if avg_score >= 80 and 'score_80' not in milestones:
        new_milestones.append('score_80')
    if avg_score >= 90 and 'score_90' not in milestones:
        new_milestones.append('score_90')
    
    if new_milestones:
        await db.users.update_one(
            {"id": user["id"]},
            {"$push": {"milestones": {"$each": new_milestones}}}
        )
    
    updated_session = await db.interview_sessions.find_one({"id": session_id}, {"_id": 0})
    
    return {
        "session": serialize_doc(updated_session),
        "answers": [serialize_doc(a) for a in answers],
        "summary": summary,
        "new_milestones": new_milestones
    }

@api_router.get("/interviews/{session_id}")
async def get_session(session_id: str, user=Depends(get_current_user)):
    session = await db.interview_sessions.find_one({"id": session_id, "user_id": user["id"]}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    answers = await db.answers.find({"session_id": session_id}, {"_id": 0}).to_list(100)
    return {"session": serialize_doc(session), "answers": [serialize_doc(a) for a in answers]}

@api_router.get("/interviews")
async def list_sessions(user=Depends(get_current_user), limit: int = 20, skip: int = 0):
    sessions = await db.interview_sessions.find(
        {"user_id": user["id"]}, {"_id": 0, "conversation_history": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.interview_sessions.count_documents({"user_id": user["id"]})
    return {"sessions": [serialize_doc(s) for s in sessions], "total": total}

# ==================== COMPANY PREP ROUTES ====================

@api_router.post("/company-prep")
async def create_company_prep(data: CompanyPrepRequest, user=Depends(get_current_user)):
    # Check cache first
    cached = await db.company_preps.find_one({
        "company_name": data.company_name.lower(),
        "role": data.role
    }, {"_id": 0})
    
    if cached:
        # Check if cache is fresh (24h)
        cached_at = cached.get('cached_at', '')
        if cached_at:
            try:
                cache_time = datetime.fromisoformat(cached_at.replace('Z', '+00:00'))
                if datetime.now(timezone.utc) - cache_time < timedelta(hours=24):
                    return {"prep": serialize_doc(cached), "from_cache": True}
            except (ValueError, TypeError):
                pass
    
    # Generate fresh
    result = await generate_company_prep(data.company_name, data.role, data.experience_level)
    
    prep_doc = {
        "id": gen_id(),
        "company_name": data.company_name.lower(),
        "role": data.role,
        "questions": result.get('questions', {}),
        "insights": result.get('companyInsights', {}),
        "talking_points": result.get('talkingPoints', {}),
        "cached_at": now_utc().isoformat()
    }
    
    # Upsert
    await db.company_preps.update_one(
        {"company_name": data.company_name.lower(), "role": data.role},
        {"$set": prep_doc},
        upsert=True
    )
    
    return {"prep": serialize_doc(prep_doc), "from_cache": False}

# ==================== RESUME ROUTES ====================

@api_router.post("/resume/analyze")
async def analyze_resume_endpoint(
    job_description: str = Form(...),
    file: UploadFile = File(None),
    resume_text: str = Form(None),
    user=Depends(get_current_user)
):
    # Check plan limits
    if user.get('plan', 'FREE') == 'FREE':
        count = await db.resumes.count_documents({"user_id": user["id"]})
        if count >= 1:
            raise HTTPException(status_code=403, detail="Free plan limited to 1 resume analysis. Upgrade to Pro for unlimited.")
    
    parsed_text = resume_text or ""
    file_name = "pasted_text"
    
    if file:
        file_name = file.filename or "upload.pdf"
        content = await file.read()
        
        if file_name.lower().endswith('.pdf'):
            try:
                pdf = pdfplumber.open(io.BytesIO(content))
                parsed_text = "\n".join([page.extract_text() or "" for page in pdf.pages])
                pdf.close()
            except Exception as e:
                logger.error(f"PDF parse error: {e}")
                raise HTTPException(status_code=400, detail="Failed to parse PDF file")
        else:
            try:
                parsed_text = content.decode('utf-8')
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF or text file.")
    
    if not parsed_text.strip():
        raise HTTPException(status_code=400, detail="No resume text provided")
    
    # Analyze with AI
    analysis = await analyze_resume(parsed_text, job_description)
    
    # Store in DB
    resume_doc = {
        "id": gen_id(),
        "user_id": user["id"],
        "file_name": file_name,
        "parsed_text": parsed_text[:5000],
        "skills": analysis.get('matchedSkills', []),
        "red_flags": [r.get('flag', '') for r in analysis.get('redFlags', [])],
        "keywords_to_mention": analysis.get('keywordsToMention', []),
        "analysis_result": analysis,
        "created_at": now_utc().isoformat()
    }
    await db.resumes.insert_one(resume_doc)
    
    return {"analysis": analysis, "resume_id": resume_doc["id"]}

@api_router.get("/resume/history")
async def resume_history(user=Depends(get_current_user)):
    resumes = await db.resumes.find({"user_id": user["id"]}, {"_id": 0, "parsed_text": 0}).sort("created_at", -1).to_list(20)
    return {"resumes": [serialize_doc(r) for r in resumes]}

# ==================== SALARY NEGOTIATION ROUTES ====================

@api_router.post("/salary/start")
async def start_salary_session(data: SalarySetup, user=Depends(get_current_user)):
    if user.get('plan', 'FREE') != 'PREMIUM':
        raise HTTPException(status_code=403, detail="Salary negotiation coach requires Premium plan.")
    
    session_id = gen_id()
    session = {
        "id": session_id,
        "user_id": user["id"],
        "setup": data.model_dump(),
        "messages": [],
        "created_at": now_utc().isoformat()
    }
    await db.salary_sessions.insert_one(session)
    
    # Generate initial offer
    response = await salary_negotiation_turn(
        session_id, data.model_dump(),
        f"I'm interested in the {data.role} position at {data.company}. I have {data.experience_years} years of experience."
    )
    
    session['messages'].append({"role": "hr", "text": response})
    await db.salary_sessions.update_one(
        {"id": session_id},
        {"$set": {"messages": session['messages']}}
    )
    
    return {"session_id": session_id, "message": response}

@api_router.post("/salary/{session_id}/message")
async def salary_message(session_id: str, data: SalaryMessage, user=Depends(get_current_user)):
    session = await db.salary_sessions.find_one({"id": session_id, "user_id": user["id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = session.get('messages', [])
    messages.append({"role": "candidate", "text": data.message})
    
    response = await salary_negotiation_turn(
        session_id, session.get('setup', {}),
        data.message, messages[:-1]
    )
    
    messages.append({"role": "hr", "text": response})
    await db.salary_sessions.update_one(
        {"id": session_id},
        {"$set": {"messages": messages}}
    )
    
    return {"message": response, "turn": len([m for m in messages if m['role'] == 'candidate'])}

# ==================== DASHBOARD / STATS ROUTES ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user=Depends(get_current_user)):
    user_id = user["id"]
    
    # Total sessions
    total = await db.interview_sessions.count_documents({"user_id": user_id})
    
    # This month sessions
    month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    this_month = await db.interview_sessions.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": month_start.isoformat()}
    })
    
    # Average score
    completed = await db.interview_sessions.find(
        {"user_id": user_id, "status": "COMPLETED", "overall_score": {"$ne": None}},
        {"_id": 0}
    ).to_list(1000)
    
    avg_score = 0
    if completed:
        scores = [s.get('overall_score', 0) for s in completed if s.get('overall_score')]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0
    
    # Top weakness
    dims = ['clarity_score', 'confidence_score', 'structure_score', 'depth_score', 'relevance_score', 'completeness_score']
    dim_avgs = {}
    for d in dims:
        vals = [s.get(d, 0) for s in completed if s.get(d) is not None]
        dim_avgs[d.replace('_score', '')] = round(sum(vals) / len(vals), 1) if vals else 0
    
    top_weakness = min(dim_avgs, key=dim_avgs.get) if dim_avgs and any(dim_avgs.values()) else "N/A"
    top_strength = max(dim_avgs, key=dim_avgs.get) if dim_avgs and any(dim_avgs.values()) else "N/A"
    
    # Recent sessions
    recent = await db.interview_sessions.find(
        {"user_id": user_id}, {"_id": 0, "conversation_history": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "total_sessions": total,
        "this_month_sessions": this_month,
        "avg_score": avg_score,
        "top_weakness": top_weakness,
        "top_strength": top_strength,
        "dimension_averages": dim_avgs,
        "recent_sessions": [serialize_doc(s) for s in recent],
        "milestones": user.get('milestones', []),
        "streak_days": user.get('streak_days', 0),
        "plan": user.get('plan', 'FREE')
    }

@api_router.get("/dashboard/progress")
async def get_progress(user=Depends(get_current_user)):
    user_id = user["id"]
    
    # All completed sessions for trends
    sessions = await db.interview_sessions.find(
        {"user_id": user_id, "status": "COMPLETED"},
        {"_id": 0, "conversation_history": 0}
    ).sort("created_at", 1).to_list(100)
    
    # Score trend data
    score_trend = []
    for s in sessions:
        score_trend.append({
            "date": s.get('created_at', '')[:10],
            "score": s.get('overall_score', 0),
            "company": s.get('company', ''),
            "role": s.get('role', '')
        })
    
    # Dimension progress
    dims = ['clarity', 'confidence', 'structure', 'depth', 'relevance', 'completeness']
    dimension_data = []
    for s in sessions:
        entry = {"date": s.get('created_at', '')[:10]}
        for d in dims:
            entry[d] = s.get(f"{d}_score", 0) or 0
        dimension_data.append(entry)
    
    # All answers for weakness frequency
    all_answers = await db.answers.find({"session_id": {"$in": [s['id'] for s in sessions]}}, {"_id": 0}).to_list(1000)
    
    weakness_freq = {}
    for a in all_answers:
        framework = a.get('detected_framework', 'NONE')
        if framework == 'NONE':
            weakness_freq['No Framework'] = weakness_freq.get('No Framework', 0) + 1
        if a.get('filler_words_detected'):
            weakness_freq['Filler Words'] = weakness_freq.get('Filler Words', 0) + 1
        if not a.get('had_specific_numbers'):
            weakness_freq['Lacks Specifics'] = weakness_freq.get('Lacks Specifics', 0) + 1
        score = a.get('score', 100)
        if score and score < 50:
            weakness_freq['Low Score Answer'] = weakness_freq.get('Low Score Answer', 0) + 1
    
    return {
        "score_trend": score_trend,
        "dimension_data": dimension_data,
        "weakness_frequency": weakness_freq,
        "total_sessions": len(sessions),
        "total_answers": len(all_answers),
        "milestones": user.get('milestones', [])
    }

# ==================== PLAN / UPGRADE ROUTES ====================

@api_router.post("/plan/upgrade")
async def upgrade_plan(data: dict, user=Depends(get_current_user)):
    """Mock upgrade - in production this would go through Stripe"""
    new_plan = data.get('plan', 'PRO')
    if new_plan not in ['FREE', 'PRO', 'PREMIUM']:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"plan": new_plan}}
    )
    return {"message": f"Plan updated to {new_plan}", "plan": new_plan}

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "InterviewIQ API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.interview_sessions.create_index("id", unique=True)
    await db.interview_sessions.create_index([("user_id", 1), ("created_at", -1)])
    await db.answers.create_index("session_id")
    await db.company_preps.create_index([("company_name", 1), ("role", 1)])
    await db.resumes.create_index("user_id")
    logger.info("InterviewIQ API started successfully")

@app.on_event("shutdown")
async def shutdown():
    client.close()
