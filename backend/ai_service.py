import json
import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Ensure .env is loaded
load_dotenv(Path(__file__).parent / '.env')

logger = logging.getLogger(__name__)

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# Persona system prompts
PERSONA_PROMPTS = {
    "RECRUITER": """You are Alex, a senior recruiter at a top tech company.
You are warm but professional. You ask one question at a time about culture fit,
motivation, communication, and career narrative. When answers are vague, ask exactly
one targeted follow-up. Never accept non-answers. After 12 questions, ask
\"Do you have any questions for us?\" Keep responses conversational and under 3 sentences
unless asking a question.""",
    
    "MANAGER": """You are Rachel, a direct hiring manager with 12 years of experience.
You are professional but demanding. You ask hard follow-up questions about specific
metrics, failures, accountability, and decision-making. You push back on vague or
inflated claims. One question at a time. No lecturing.""",
    
    "TECHNICAL": """You are Dev, a senior staff engineer.
You are precise and analytical. You probe depth of knowledge not surface familiarity.
When a candidate uses a technical term, ask them to explain it precisely.
Ask system design, trade-offs, and debugging questions.
Follow up on every technical claim with \"Why?\" or \"What are the trade-offs?\"""",
    
    "PANEL": """You moderate a panel with SAM (Recruiter), RACHEL (Hiring Manager), DEV (Tech Lead), PRIYA (Product Manager), and MARCUS (Skeptic).
Rotate questions. Label each question with interviewer name in brackets like [SAM], [RACHEL], [DEV], [PRIYA], [MARCUS].
Marcus always challenges bold claims. Priya asks about user impact and cross-functional thinking.
Sam focuses on culture fit. Rachel on delivery metrics. Dev on technical depth.
Ask one question at a time from one panelist."""
}

PERSONA_NAMES = {
    "RECRUITER": "Alex",
    "MANAGER": "Rachel",
    "TECHNICAL": "Dev",
    "PANEL": "Panel"
}

EVALUATOR_PROMPT = """You are an expert interview answer evaluator. You MUST respond with ONLY valid JSON, no other text whatsoever. No markdown code blocks. Just raw JSON.

Evaluate the candidate's answer to the interview question. Score each dimension from 0-100.

Return this EXACT JSON structure:
{
  "overallScore": <number 0-100>,
  "scores": {
    "clarity": <number 0-100>,
    "confidence": <number 0-100>,
    "relevance": <number 0-100>,
    "structure": <number 0-100>,
    "completeness": <number 0-100>,
    "depth": <number 0-100>
  },
  "whatWorked": "<1-2 specific sentences>",
  "whatWasMissing": "<1-2 specific sentences>",
  "howToImprove": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "rewrittenAnswer": "<STAR-formatted improved version preserving candidate's original facts>",
  "detectedFramework": "<STAR|CAR|PAR|NONE>",
  "fillerWordsDetected": <true|false>,
  "hadSpecificNumbers": <true|false>
}"""

COMPANY_PREP_PROMPT = """You are an expert interview coach. Generate interview questions for the specified company and role.
You MUST respond with ONLY valid JSON, no other text. No markdown code blocks. Just raw JSON.

Return this EXACT JSON structure:
{
  "companyInsights": {
    "description": "<one-line company description>",
    "interviewDifficulty": "<Easy|Medium|Hard|Very Hard>",
    "interviewStyle": ["<style tag 1>", "<style tag 2>"],
    "cultureValues": ["<value 1>", "<value 2>", "<value 3>"]
  },
  "questions": {
    "HR": [
      {"question": "<text>", "difficulty": "<easy|medium|hard>", "whyAsked": "<reason>", "whatItTests": "<competency>", "howToAnswer": ["<tip1>", "<tip2>", "<tip3>"]}
    ],
    "BEHAVIORAL": [
      {"question": "<text>", "difficulty": "<easy|medium|hard>", "whyAsked": "<reason>", "whatItTests": "<competency>", "howToAnswer": ["<tip1>", "<tip2>", "<tip3>"]}
    ],
    "TECHNICAL": [
      {"question": "<text>", "difficulty": "<easy|medium|hard>", "whyAsked": "<reason>", "whatItTests": "<competency>", "howToAnswer": ["<tip1>", "<tip2>", "<tip3>"]}
    ],
    "CASE_STUDY": [
      {"question": "<text>", "difficulty": "<easy|medium|hard>", "whyAsked": "<reason>", "whatItTests": "<competency>", "howToAnswer": ["<tip1>", "<tip2>", "<tip3>"]}
    ],
    "MANAGERIAL": [
      {"question": "<text>", "difficulty": "<easy|medium|hard>", "whyAsked": "<reason>", "whatItTests": "<competency>", "howToAnswer": ["<tip1>", "<tip2>", "<tip3>"]}
    ],
    "FINAL": [
      {"question": "<text>", "difficulty": "<easy|medium|hard>", "whyAsked": "<reason>", "whatItTests": "<competency>", "howToAnswer": ["<tip1>", "<tip2>", "<tip3>"]}
    ]
  },
  "talkingPoints": {
    "doMention": ["<point 1>", "<point 2>", "<point 3>"],
    "beReadyFor": ["<point 1>", "<point 2>", "<point 3>"],
    "avoidSaying": ["<point 1>", "<point 2>", "<point 3>"]
  }
}"""

RESUME_ANALYSIS_PROMPT = """You are an expert resume analyzer and career coach. Analyze the resume against the job description.
You MUST respond with ONLY valid JSON, no other text. No markdown code blocks. Just raw JSON.

Return this EXACT JSON structure:
{
  "matchScore": <number 0-100>,
  "matchedSkills": ["<skill 1>", "<skill 2>"],
  "missingSkills": ["<skill 1>", "<skill 2>"],
  "extraSkills": ["<skill 1>", "<skill 2>"],
  "redFlags": [
    {"flag": "<description>", "severity": "<High|Medium|Low>", "howToAddress": "<guidance>"}
  ],
  "tailoredQuestions": [
    {"question": "<text>", "priority": "<High|Medium|Low>", "type": "<Technical|Behavioral>", "basedOn": "<what from resume/JD triggered this>"}
  ],
  "keywordsToMention": ["<keyword 1>", "<keyword 2>"],
  "summary": "<2-3 sentence overall assessment>"
}"""

SALARY_NEGOTIATION_PROMPT = """You are a professional HR manager conducting a salary negotiation.
You made an initial offer. Your goal is to hire the candidate but stay within budget.
Push back professionally on counteroffers. Show realistic resistance.
After 8 exchanges, show conditional flexibility. Be professional, not a pushover.
Keep responses to 2-3 sentences max.

Context:
- Role: {role}
- Company: {company}
- Location: {location}
- Candidate experience: {experience_years} years
- Initial offer: Based on market rate for this role and location

Start by presenting an initial offer with salary, equity/RSU, signing bonus, and benefits overview."""


def parse_json_response(response_text):
    """Parse JSON from AI response, handling markdown code blocks"""
    clean = response_text.strip()
    if clean.startswith("```json"):
        clean = clean[7:]
    if clean.startswith("```"):
        clean = clean[3:]
    if clean.endswith("```"):
        clean = clean[:-3]
    clean = clean.strip()
    return json.loads(clean)


async def generate_question(session_id, persona, company, role, experience_level, round_type, conversation_history=None):
    """Generate the next interview question"""
    system = PERSONA_PROMPTS.get(persona, PERSONA_PROMPTS["RECRUITER"])
    system += f"\n\nYou are interviewing a candidate for a {role} role at {company} with {experience_level} experience. This is the {round_type} round."
    
    if not conversation_history:
        system += "\nAsk your first interview question. Do NOT introduce yourself with a long preamble. Just greet briefly and ask the question."
    
    chat = LlmChat(
        api_key=EMERGENT_KEY,
        session_id=f"interview-{session_id}",
        system_message=system
    )
    chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
    
    if conversation_history:
        # Build conversation context
        context = "Previous conversation:\n"
        for entry in conversation_history:
            if entry.get("role") == "interviewer":
                context += f"Interviewer: {entry['text']}\n"
            else:
                context += f"Candidate: {entry['text']}\n"
        context += "\nBased on the conversation so far, ask the next interview question. Be natural and reference their previous answer if relevant."
        msg = UserMessage(text=context)
    else:
        msg = UserMessage(text="I'm ready for the interview. Please ask me your first question.")
    
    response = await chat.send_message(msg)
    return response


async def evaluate_answer(question, answer, persona="RECRUITER"):
    """Evaluate a candidate's answer with structured scoring"""
    chat = LlmChat(
        api_key=EMERGENT_KEY,
        session_id=f"eval-{id(answer)}",
        system_message=EVALUATOR_PROMPT
    )
    chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
    
    msg = UserMessage(
        text=f"QUESTION: {question}\n\nCANDIDATE'S ANSWER: {answer}"
    )
    
    response = await chat.send_message(msg)
    
    try:
        result = parse_json_response(response)
        return result
    except json.JSONDecodeError:
        logger.error(f"Failed to parse evaluation JSON: {response[:200]}")
        return {
            "overallScore": 50,
            "scores": {"clarity": 50, "confidence": 50, "relevance": 50, "structure": 50, "completeness": 50, "depth": 50},
            "whatWorked": "Unable to parse detailed feedback.",
            "whatWasMissing": "Please try again.",
            "howToImprove": ["Try providing more specific examples."],
            "rewrittenAnswer": answer,
            "detectedFramework": "NONE",
            "fillerWordsDetected": False,
            "hadSpecificNumbers": False
        }


async def generate_company_prep(company_name, role, experience_level):
    """Generate company-specific interview questions"""
    for attempt in range(2):
        try:
            chat = LlmChat(
                api_key=EMERGENT_KEY,
                session_id=f"company-{company_name}-{role}-{attempt}",
                system_message=COMPANY_PREP_PROMPT
            )
            chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
            
            msg = UserMessage(
                text=f"Generate interview questions for a {role} role at {company_name} for someone with {experience_level} experience. Generate 2-3 questions per round. Keep responses concise."
            )
            
            response = await chat.send_message(msg)
            return parse_json_response(response)
        except Exception as e:
            logger.error(f"Company prep attempt {attempt+1} failed: {e}")
            if attempt == 1:
                raise


async def analyze_resume(resume_text, job_description):
    """Analyze resume against job description"""
    for attempt in range(2):
        try:
            chat = LlmChat(
                api_key=EMERGENT_KEY,
                session_id=f"resume-{id(resume_text)}-{attempt}",
                system_message=RESUME_ANALYSIS_PROMPT
            )
            chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
            
            # Truncate inputs if too long
            resume_truncated = resume_text[:3000]
            jd_truncated = job_description[:2000]
            
            msg = UserMessage(
                text=f"RESUME:\n{resume_truncated}\n\nJOB DESCRIPTION:\n{jd_truncated}"
            )
            
            response = await chat.send_message(msg)
            return parse_json_response(response)
        except Exception as e:
            logger.error(f"Resume analysis attempt {attempt+1} failed: {e}")
            if attempt == 1:
                raise
    
    response = await chat.send_message(msg)
    return parse_json_response(response)


async def salary_negotiation_turn(session_id, setup, message, history=None):
    """Handle a salary negotiation turn"""
    system = SALARY_NEGOTIATION_PROMPT.format(
        role=setup.get("role", "Software Engineer"),
        company=setup.get("company", "Tech Company"),
        location=setup.get("location", "US"),
        experience_years=setup.get("experience_years", 3)
    )
    
    chat = LlmChat(
        api_key=EMERGENT_KEY,
        session_id=f"salary-{session_id}",
        system_message=system
    )
    chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
    
    if history:
        context = "Previous negotiation:\n"
        for entry in history:
            if entry.get("role") == "hr":
                context += f"HR Manager: {entry['text']}\n"
            else:
                context += f"Candidate: {entry['text']}\n"
        context += f"\nCandidate's latest response: {message}\n\nRespond as the HR manager."
        msg = UserMessage(text=context)
    else:
        msg = UserMessage(text=f"Start the negotiation. The candidate says: {message}")
    
    response = await chat.send_message(msg)
    return response


async def generate_session_summary(answers):
    """Generate AI summary of interview session"""
    if not answers:
        return {"strengths": [], "improvements": [], "overallFeedback": "No answers to analyze."}
    
    chat = LlmChat(
        api_key=EMERGENT_KEY,
        session_id=f"summary-{id(answers)}",
        system_message="""You are an expert interview coach. Analyze the candidate's overall performance across all answers.
You MUST respond with ONLY valid JSON, no other text. No markdown code blocks.

Return this EXACT JSON structure:
{
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "overallFeedback": "<2-3 sentence overall assessment>",
  "topWeakness": "<single most important area to improve>",
  "readinessLevel": "<Not Ready|Getting There|Almost Ready|Interview Ready>"
}"""
    )
    chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
    
    answers_text = "\n\n".join([
        f"Q: {a.get('question_text', '')}\nA: {a.get('answer_text', '')}\nScore: {a.get('score', 'N/A')}"
        for a in answers
    ])
    
    msg = UserMessage(text=f"Analyze these interview answers:\n\n{answers_text}")
    response = await chat.send_message(msg)
    
    try:
        return parse_json_response(response)
    except json.JSONDecodeError:
        return {"strengths": ["Good effort"], "improvements": ["Practice more"], "overallFeedback": "Keep practicing!", "topWeakness": "Specificity", "readinessLevel": "Getting There"}
