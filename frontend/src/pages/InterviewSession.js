import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Clock, ChevronRight, RotateCcw, Square, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { useInterviewStore } from '../lib/store';
import { interviewAPI } from '../lib/api';
import { toast } from 'sonner';
import ScoreRing from '../components/ScoreRing';
import FeedbackPanel from '../components/FeedbackPanel';

const personaStyles = {
  RECRUITER: { name: 'Alex', title: 'Senior Recruiter', color: 'var(--green)', initial: 'A' },
  MANAGER: { name: 'Rachel', title: 'Hiring Manager', color: 'var(--red)', initial: 'R' },
  TECHNICAL: { name: 'Dev', title: 'Staff Engineer', color: 'var(--blue)', initial: 'D' },
  PANEL: { name: 'Panel', title: '5 Interviewers', color: 'var(--purple)', initial: 'P' },
};

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    currentSession, currentQuestion, questionNumber,
    isLoading, evaluation, showFeedback,
    setSession, setQuestion, setLoading, setEvaluation, hideFeedback, addAnswer, setComplete, reset
  } = useInterviewStore();
  
  const [answer, setAnswer] = useState('');
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [rapidFireTimer, setRapidFireTimer] = useState(60);
  const textareaRef = useRef(null);
  const timerRef = useRef(null);
  const rapidRef = useRef(null);

  const persona = personaStyles[currentSession?.persona] || personaStyles.RECRUITER;
  const isRapidFire = currentSession?.mode === 'RAPID_FIRE';

  // Load session if needed
  useEffect(() => {
    if (!currentSession && sessionId) {
      interviewAPI.getSession(sessionId).then(res => {
        setSession(res.data.session);
        const history = res.data.session.conversation_history || [];
        const lastQ = [...history].reverse().find(h => h.role === 'interviewer');
        if (lastQ) {
          setQuestion(lastQ.text, res.data.session.total_questions || 1);
        }
      }).catch(() => {
        toast.error('Session not found');
        navigate('/dashboard/interview');
      });
    }
  }, [sessionId]);

  // Typing animation for question
  useEffect(() => {
    if (!currentQuestion) return;
    setIsTyping(true);
    setTypedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < currentQuestion.length) {
        setTypedText(currentQuestion.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [currentQuestion]);

  // Session timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Rapid fire timer
  useEffect(() => {
    if (!isRapidFire || showFeedback) return;
    setRapidFireTimer(60);
    rapidRef.current = setInterval(() => {
      setRapidFireTimer(t => {
        if (t <= 1) {
          clearInterval(rapidRef.current);
          if (answer.trim()) handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(rapidRef.current);
  }, [questionNumber, showFeedback, isRapidFire]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    if (!answer.trim() || isLoading) return;
    setLoading(true);
    clearInterval(rapidRef.current);
    try {
      const res = await interviewAPI.submitAnswer(sessionId, { answer_text: answer });
      setEvaluation(res.data.evaluation);
      addAnswer({ question: currentQuestion, answer: answer, evaluation: res.data.evaluation });
      setAnswer('');
    } catch (err) {
      toast.error('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    hideFeedback();
    setLoading(true);
    try {
      const res = await interviewAPI.nextQuestion(sessionId);
      if (res.data.is_complete || !res.data.question) {
        handleEndSession();
      } else {
        setQuestion(res.data.question, res.data.question_number);
      }
    } catch (err) {
      toast.error('Failed to get next question');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    setLoading(true);
    try {
      await interviewAPI.complete(sessionId);
      navigate(`/dashboard/interview/session/${sessionId}/complete`);
    } catch (err) {
      toast.error('Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--blue)]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4">
      {/* Left Panel - AI Interviewer */}
      <div className="lg:w-[40%] flex flex-col glass-card overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold animate-pulse-glow"
            style={{ backgroundColor: `${persona.color}20`, color: persona.color }}>
            {persona.initial}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{persona.name} — {persona.title}</p>
            <p className="text-xs text-[var(--text-muted)]">{currentSession.company}, {currentSession.round} Round</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">Q{questionNumber} of ~12</p>
            <p className="font-mono text-xs text-[var(--text-muted)]">{formatTime(elapsedTime)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
          <div className="h-full transition-all duration-500" style={{ width: `${(questionNumber / 12) * 100}%`, backgroundColor: 'var(--blue)' }} />
        </div>

        {/* Question area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center">
          {isTyping || typedText ? (
            <div>
              <p className="text-lg md:text-xl text-[var(--text-primary)] leading-relaxed">
                {typedText}
                {isTyping && <span className="typing-cursor" />}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="shimmer h-4 w-3/4 rounded" />
            </div>
          )}
        </div>

        {/* Session controls */}
        <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <Button
            variant="ghost"
            onClick={handleEndSession}
            disabled={isLoading}
            className="text-[var(--text-secondary)] hover:text-[var(--red)] rounded-xl text-sm"
            data-testid="interview-session-end-button"
          >
            <Square className="w-4 h-4 mr-1" /> End Session
          </Button>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="font-mono text-sm text-[var(--text-secondary)]">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Answer Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Rapid fire timer */}
        {isRapidFire && !showFeedback && (
          <div className="glass-card p-3 mb-4 flex items-center justify-center gap-3">
            <Loader2 className={`w-5 h-5 ${rapidFireTimer <= 10 ? 'text-[var(--red)] animate-spin' : 'text-[var(--amber)]'}`} />
            <span className={`font-mono text-2xl font-bold ${rapidFireTimer <= 10 ? 'text-[var(--red)]' : 'text-[var(--text-primary)]'}`}>
              {formatTime(rapidFireTimer)}
            </span>
          </div>
        )}

        {/* Answer textarea */}
        {!showFeedback ? (
          <div className="flex-1 flex flex-col glass-card overflow-hidden">
            <div className="flex-1 p-4">
              <Textarea
                ref={textareaRef}
                data-testid="interview-session-answer-textarea"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Use the STAR method for behavioral questions."
                className="w-full h-full min-h-[200px] resize-none bg-transparent border-0 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-base leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
            </div>
            <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <span className={`text-xs font-mono ${
                wordCount > 600 ? 'text-[var(--red)]' : wordCount > 400 ? 'text-[var(--amber)]' : 'text-[var(--text-muted)]'
              }`}>
                {wordCount} words
              </span>
              <Button
                data-testid="interview-session-submit-answer-button"
                onClick={handleSubmit}
                disabled={!answer.trim() || isLoading}
                className="bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl px-6 btn-glow"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Submit Answer</span>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Feedback Panel */
          <AnimatePresence>
            <FeedbackPanel
              evaluation={evaluation}
              onNext={handleNextQuestion}
              onRedo={() => { hideFeedback(); setAnswer(''); }}
              onEnd={handleEndSession}
              isLoading={isLoading}
              questionNumber={questionNumber}
            />
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
