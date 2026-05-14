"""
Core AI POC - Test InterviewIQ's Claude integration in isolation.
Tests: question generation, answer evaluation (strict JSON), session summary.
"""
import asyncio
import json
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

from ai_service import generate_question, evaluate_answer, generate_session_summary, generate_company_prep

PASS = 0
FAIL = 0

def report(name, success, detail=""):
    global PASS, FAIL
    if success:
        PASS += 1
        print(f"  [PASS] {name}")
    else:
        FAIL += 1
        print(f"  [FAIL] {name} — {detail}")


async def test_question_generation():
    """Test 1: Generate an interview question"""
    print("\n=== Test 1: Question Generation ===")
    try:
        q = await generate_question(
            "test-session-1", "RECRUITER", "Google", "Software Engineer",
            "mid", "BEHAVIORAL"
        )
        report("Returns non-empty string", bool(q and len(q) > 10), f"Got: {q[:50] if q else 'None'}")
        report("Contains question mark", "?" in q, "No question mark found")
        return q
    except Exception as e:
        report("No exception", False, str(e))
        return None


async def test_answer_evaluation():
    """Test 2: Evaluate an answer with 6-dimension scoring"""
    print("\n=== Test 2: Answer Evaluation ===")
    question = "Tell me about a time you dealt with a difficult team member."
    answer = """At my previous company, I had a colleague who consistently missed deadlines 
    which affected our sprint deliverables. I scheduled a private one-on-one to understand 
    their situation. They were dealing with unclear requirements. I proposed a daily 15-minute 
    sync and created a shared task board. Within 2 sprints, their delivery rate improved 40% 
    and team velocity increased by 15%."""
    
    try:
        result = await evaluate_answer(question, answer, "RECRUITER")
        
        # Check structure
        report("Returns dict", isinstance(result, dict), f"Type: {type(result)}")
        report("Has overallScore", "overallScore" in result, f"Keys: {list(result.keys())}")
        report("Has scores dict", "scores" in result and isinstance(result.get("scores"), dict))
        
        # Check score ranges
        score = result.get("overallScore", -1)
        report("overallScore 0-100", 0 <= score <= 100, f"Got: {score}")
        
        dims = result.get("scores", {})
        all_dims = ["clarity", "confidence", "relevance", "structure", "completeness", "depth"]
        for d in all_dims:
            val = dims.get(d, -1)
            report(f"  {d} 0-100", 0 <= val <= 100, f"Got: {val}")
        
        # Check feedback fields
        report("Has whatWorked", bool(result.get("whatWorked")))
        report("Has rewrittenAnswer", bool(result.get("rewrittenAnswer")))
        report("Has howToImprove", isinstance(result.get("howToImprove"), list))
        
        return result
    except Exception as e:
        report("No exception", False, str(e))
        return None


async def test_session_summary():
    """Test 3: Generate session summary from answers"""
    print("\n=== Test 3: Session Summary ===")
    mock_answers = [
        {"question_text": "Tell me about yourself.", "answer_text": "I'm a software engineer with 5 years of experience at startups.", "score": 65},
        {"question_text": "Describe a challenging project.", "answer_text": "I led a migration from monolith to microservices. We reduced deploy time by 70%.", "score": 78},
    ]
    
    try:
        summary = await generate_session_summary(mock_answers)
        report("Returns dict", isinstance(summary, dict), f"Type: {type(summary)}")
        report("Has strengths", isinstance(summary.get("strengths"), list))
        report("Has improvements", isinstance(summary.get("improvements"), list))
        report("Has overallFeedback", bool(summary.get("overallFeedback")))
        return summary
    except Exception as e:
        report("No exception", False, str(e))
        return None


async def test_company_prep():
    """Test 4: Generate company prep questions"""
    print("\n=== Test 4: Company Prep ===")
    try:
        result = await generate_company_prep("Google", "Software Engineer", "mid")
        report("Returns dict", isinstance(result, dict), f"Type: {type(result)}")
        report("Has questions", "questions" in result)
        report("Has companyInsights", "companyInsights" in result)
        
        questions = result.get("questions", {})
        report("Has question categories", len(questions) > 0, f"Categories: {list(questions.keys())}")
        return result
    except Exception as e:
        report("No exception", False, str(e))
        return None


async def main():
    print("=" * 60)
    print("InterviewIQ Core AI POC Test")
    print("=" * 60)
    
    await test_question_generation()
    await test_answer_evaluation()
    await test_session_summary()
    await test_company_prep()
    
    print("\n" + "=" * 60)
    print(f"Results: {PASS} passed, {FAIL} failed out of {PASS + FAIL}")
    print("=" * 60)
    
    if FAIL > 0:
        print("\nPOC FAILED - Fix issues before proceeding to app development")
        sys.exit(1)
    else:
        print("\nPOC PASSED - Core AI integration is working. Proceed to app development.")
        sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
