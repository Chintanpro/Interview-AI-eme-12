from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
from enum import Enum


def gen_id():
    return str(uuid.uuid4())

def now_utc():
    return datetime.now(timezone.utc)

# Enums
class Plan(str, Enum):
    FREE = "FREE"
    PRO = "PRO"
    PREMIUM = "PREMIUM"

class InterviewMode(str, Enum):
    TEXT = "TEXT"
    VOICE = "VOICE"
    RAPID_FIRE = "RAPID_FIRE"

class Persona(str, Enum):
    RECRUITER = "RECRUITER"
    MANAGER = "MANAGER"
    TECHNICAL = "TECHNICAL"
    PANEL = "PANEL"

class Round(str, Enum):
    HR = "HR"
    BEHAVIORAL = "BEHAVIORAL"
    TECHNICAL = "TECHNICAL"
    CASE_STUDY = "CASE_STUDY"
    MANAGERIAL = "MANAGERIAL"
    FINAL = "FINAL"

class SessionStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"

# User Models
class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    email: str
    name: str
    plan: Plan = Plan.FREE
    streak_days: int = 0
    last_active_date: Optional[str] = None
    milestones: List[str] = []
    total_sessions: int = 0
    created_at: str = Field(default_factory=lambda: now_utc().isoformat())

class UserUpdate(BaseModel):
    name: Optional[str] = None
    plan: Optional[Plan] = None

# Interview Session Models
class InterviewSessionCreate(BaseModel):
    company: Optional[str] = "General"
    role: Optional[str] = "Software Engineer"
    experience_level: str = "mid"
    mode: InterviewMode = InterviewMode.TEXT
    persona: Persona = Persona.RECRUITER
    round: Round = Round.BEHAVIORAL

class InterviewSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    user_id: str
    company: Optional[str] = "General"
    role: Optional[str] = "Software Engineer"
    experience_level: str = "mid"
    mode: str = "TEXT"
    persona: str = "RECRUITER"
    round: str = "BEHAVIORAL"
    status: str = "IN_PROGRESS"
    overall_score: Optional[float] = None
    clarity_score: Optional[float] = None
    confidence_score: Optional[float] = None
    structure_score: Optional[float] = None
    depth_score: Optional[float] = None
    relevance_score: Optional[float] = None
    completeness_score: Optional[float] = None
    total_questions: int = 0
    duration: Optional[int] = None
    created_at: str = Field(default_factory=lambda: now_utc().isoformat())
    completed_at: Optional[str] = None

# Answer Models
class AnswerSubmit(BaseModel):
    answer_text: str

class Answer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    session_id: str
    question_text: str
    question_type: str = "behavioral"
    answer_text: Optional[str] = None
    duration: Optional[int] = None
    score: Optional[float] = None
    clarity_score: Optional[float] = None
    confidence_score: Optional[float] = None
    structure_score: Optional[float] = None
    depth_score: Optional[float] = None
    relevance_score: Optional[float] = None
    completeness_score: Optional[float] = None
    feedback: Optional[str] = None
    improved_answer: Optional[str] = None
    missing_points: Optional[str] = None
    what_worked: Optional[str] = None
    detected_framework: Optional[str] = None
    filler_words_detected: bool = False
    had_specific_numbers: bool = False
    created_at: str = Field(default_factory=lambda: now_utc().isoformat())

# Resume Models
class Resume(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    user_id: str
    file_name: str
    parsed_text: Optional[str] = None
    skills: List[str] = []
    red_flags: List[str] = []
    keywords_to_mention: List[str] = []
    experience: Optional[Dict] = None
    education: Optional[Dict] = None
    gaps: List[str] = []
    analysis_result: Optional[Dict] = None
    created_at: str = Field(default_factory=lambda: now_utc().isoformat())

# Company Prep Models
class CompanyPrepRequest(BaseModel):
    company_name: str
    role: Optional[str] = "Software Engineer"
    experience_level: str = "mid"

class CompanyPrep(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    company_name: str
    role: Optional[str] = None
    questions: Dict = {}
    insights: Optional[Dict] = None
    talking_points: Optional[Dict] = None
    things_to_avoid: Optional[List[str]] = None
    cached_at: str = Field(default_factory=lambda: now_utc().isoformat())

# Salary Negotiation Models
class SalarySetup(BaseModel):
    role: str
    company: str
    current_salary: Optional[str] = None
    target_salary: Optional[str] = None
    location: str = "US"
    experience_years: int = 3

class SalaryMessage(BaseModel):
    message: str

# Auth Response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict
