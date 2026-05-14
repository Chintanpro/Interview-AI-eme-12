import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Clock, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { interviewAPI } from '../lib/api';
import { useInterviewStore, useAuthStore } from '../lib/store';
import { toast } from 'sonner';

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { currentSession, currentQuestion, questionNumber, isLoading, evaluation, showFeedback, setSession, setQuestion, setLoading, setEvaluation, hideFeedback, addAnswer, reset } = useInterviewStore();
  const user = useAuthStore((s) => s.user);

  const [answer, setAnswer] = useState('');
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSideFeedback, setShowSideFeedback] = useState(false);
  const chatRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize session
  useEffect(() => {
    if (!currentSession && sessionId) {
      interviewAPI.getSession(sessionId).then(res => {
        setSession(res.data.session);
        const history = res.data.session.conversation_history || [];
        if (history.length > 0) {
          const lastInterviewer = [...history].reverse().find(h => h.role === 'interviewer');
          if (lastInterviewer) setQuestion(lastInterviewer.text, res.data.session.total_questions || 1);
        }
      }).catch(() => { toast.error('Session not found'); navigate('/dashboard/interview'); });
    }
    // Start timer
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Add question to messages when it changes
  useEffect(() => {
    if (currentQuestion && (!messages.length || messages[messages.length - 1]?.text !== currentQuestion)) {
      setMessages(prev => [...prev, { role: 'interviewer', text: currentQuestion }]);
    }
  }, [currentQuestion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;
    const answerText = answer.trim();
    setAnswer('');
    setSubmitting(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'candidate', text: answerText }]);

    try {
      // Submit answer for evaluation
      const evalRes = await interviewAPI.submitAnswer(sessionId, { answer_text: answerText });
      const evalData = evalRes.data.evaluation;
      setEvaluation(evalData);
      setShowSideFeedback(true);
      addAnswer({ question: currentQuestion, answer: answerText, evaluation: evalData });

      // Get next question
      const nextRes = await interviewAPI.nextQuestion(sessionId);
      if (nextRes.data.is_complete || !nextRes.data.question) {
        toast.success('Interview complete! Generating your report...');
        await interviewAPI.complete(sessionId);
        navigate(`/dashboard/interview/session/${sessionId}/complete`);
      } else {
        setQuestion(nextRes.data.question, nextRes.data.question_number);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to process answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndInterview = async () => {
    try {
      await interviewAPI.complete(sessionId);
      navigate(`/dashboard/interview/session/${sessionId}/complete`);
    } catch (err) {
      toast.error('Failed to end interview');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { handleSubmit(); }
  };

  const persona = currentSession?.persona || 'RECRUITER';
  const personaNames = { RECRUITER: 'Sarah', MANAGER: 'Marcus', TECHNICAL: 'Priya', PANEL: 'David' };
  const personaColors = { RECRUITER: '#10B981', MANAGER: '#6366F1', TECHNICAL: '#8B5CF6', PANEL: '#F59E0B' };

  return (
    <div className="flex h-[calc(100vh-64px)] -m-4 md:-m-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Session Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard/interview')} data-testid="back-to-setup">
              <ArrowLeft className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--success)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Live Interview</span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentSession?.company} — {currentSession?.role}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
              <Clock className="w-3 h-3 inline mr-1" />{formatTime(timer)}
            </span>
            <span className="font-mono text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>Q{questionNumber}</span>
            <Button variant="ghost" size="sm" onClick={handleEndInterview} className="text-xs rounded-xl" style={{ color: 'var(--danger)' }} data-testid="end-interview-button">
              End Interview
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'candidate' ? '' : ''}`}>
                {msg.role === 'interviewer' && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${personaColors[persona]}15`, color: personaColors[persona] }}>
                      {personaNames[persona]?.charAt(0)}
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{personaNames[persona]}</span>
                  </div>
                )}
                <div className="p-4 rounded-2xl" style={
                  msg.role === 'candidate'
                    ? { background: 'linear-gradient(135deg, var(--primary-indigo), #8B5CF6)', color: 'white', borderBottomRightRadius: '6px' }
                    : { backgroundColor: 'var(--bg-surface)', borderLeft: `3px solid ${personaColors[persona]}`, borderBottomLeftRadius: '6px', color: 'var(--text-primary)' }
                }>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {submitting && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Evaluating & generating next question...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 md:px-6 py-4" style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-base)' }}>
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Type your answer... (Ctrl+Enter to send)" disabled={submitting}
                className="min-h-[60px] max-h-[150px] rounded-xl resize-none" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                data-testid="interview-answer-input" />
            </div>
            <Button onClick={handleSubmit} disabled={!answer.trim() || submitting} className="h-11 w-11 rounded-xl p-0 flex-shrink-0 text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="active-interview-send-message-button">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Side Feedback Panel (desktop) */}
      <div className="hidden lg:block w-[360px] flex-shrink-0" style={{ borderLeft: '1px solid var(--border-subtle)' }}>
        <FeedbackPanel evaluation={evaluation} visible={showSideFeedback} onClose={() => setShowSideFeedback(false)} />
        {!showSideFeedback && (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <BarChart className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Answer a question to see your scoring feedback here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BarChart(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
