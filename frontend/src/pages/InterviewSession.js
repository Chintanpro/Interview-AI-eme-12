import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Clock, Loader2, Mic, MicOff, Volume2, VolumeX, Keyboard, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { FeedbackPanel } from '../components/FeedbackPanel';
import { interviewAPI } from '../lib/api';
import { useInterviewStore, useAuthStore } from '../lib/store';
import { useVoice } from '../hooks/useVoice';
import { toast } from 'sonner';

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    currentSession, currentQuestion, questionNumber,
    evaluation, setSession, setQuestion,
    setEvaluation, addAnswer, reset
  } = useInterviewStore();
  const user = useAuthStore((s) => s.user);

  const [answer, setAnswer] = useState('');
  const [messages, setMessages] = useState([]);
  const [timer, setTimer] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSideFeedback, setShowSideFeedback] = useState(false);
  const [mode, setMode] = useState('TEXT');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const chatRef = useRef(null);
  const timerRef = useRef(null);
  const lastQuestionRef = useRef(null);

  const {
    isListening, transcript, interimTranscript, isSpeaking,
    isSupported: voiceSupported, error: voiceError,
    startListening, stopListening, getFinalTranscript,
    setTranscript, speak, stopSpeaking
  } = useVoice();

  // Initialize session
  useEffect(() => {
    if (!currentSession && sessionId) {
      interviewAPI.getSession(sessionId).then(res => {
        setSession(res.data.session);
        const sessionMode = res.data.session?.mode || 'TEXT';
        setMode(sessionMode);
        const history = res.data.session.conversation_history || [];
        if (history.length > 0) {
          const lastInterviewer = [...history].reverse().find(h => h.role === 'interviewer');
          if (lastInterviewer) setQuestion(lastInterviewer.text, res.data.session.total_questions || 1);
        }
      }).catch(() => { toast.error('Session not found'); navigate('/dashboard/interview'); });
    } else if (currentSession) {
      setMode(currentSession.mode || 'TEXT');
    }
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Add question to messages + auto-speak
  useEffect(() => {
    if (currentQuestion && currentQuestion !== lastQuestionRef.current) {
      lastQuestionRef.current = currentQuestion;
      setMessages(prev => [...prev, { role: 'interviewer', text: currentQuestion }]);

      // Auto-speak in voice mode
      if (mode === 'VOICE' && autoSpeak && voiceSupported) {
        // Small delay to let TTS initialize
        setTimeout(() => speak(currentQuestion), 300);
      }
    }
  }, [currentQuestion, mode, autoSpeak, voiceSupported, speak]);

  // Sync voice transcript → answer field in VOICE mode
  useEffect(() => {
    if (mode === 'VOICE') {
      const full = [transcript, interimTranscript].filter(Boolean).join(' ').trim();
      if (full) setAnswer(full);
    }
  }, [transcript, interimTranscript, mode]);

  // Auto scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, submitting]);

  // Show voice errors as toasts
  useEffect(() => {
    if (voiceError) toast.error(voiceError);
  }, [voiceError]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSubmit = async () => {
    let answerText = answer.trim();

    // In voice mode, finalize the transcript
    if (mode === 'VOICE') {
      if (isListening) {
        answerText = getFinalTranscript();
        stopListening();
      }
    }

    if (!answerText || submitting) return;

    // Clear input state
    setAnswer('');
    setTranscript('');
    setSubmitting(true);
    if (isSpeaking) stopSpeaking();

    // Add candidate message
    setMessages(prev => [...prev, { role: 'candidate', text: answerText }]);

    try {
      const evalRes = await interviewAPI.submitAnswer(sessionId, { answer_text: answerText });
      const evalData = evalRes.data.evaluation;
      setEvaluation(evalData);
      setShowSideFeedback(true);
      addAnswer({ question: currentQuestion, answer: answerText, evaluation: evalData });

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
    if (isListening) stopListening();
    if (isSpeaking) stopSpeaking();
    try {
      await interviewAPI.complete(sessionId);
      navigate(`/dashboard/interview/session/${sessionId}/complete`);
    } catch (err) {
      toast.error('Failed to end interview');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
  };

  const toggleVoiceListening = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) stopSpeaking();
      startListening();
    }
  };

  const toggleMode = () => {
    if (mode === 'VOICE') {
      if (isListening) stopListening();
      if (isSpeaking) stopSpeaking();
      // Transfer any voice transcript to the text field
      const voiceText = getFinalTranscript();
      if (voiceText) setAnswer(voiceText);
      setMode('TEXT');
    } else {
      if (!voiceSupported) {
        toast.error('Voice not supported in this browser. Try Chrome or Edge.');
        return;
      }
      setMode('VOICE');
      toast.info('Voice mode active. Tap the mic to start speaking.', { duration: 3000 });
    }
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
            <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>{currentSession?.company} — {currentSession?.role}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <button onClick={toggleMode} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: mode === 'VOICE' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                color: mode === 'VOICE' ? 'var(--primary-indigo)' : 'var(--text-muted)',
                border: `1px solid ${mode === 'VOICE' ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`
              }}
              data-testid="toggle-voice-mode">
              {mode === 'VOICE' ? <Mic className="w-3 h-3" /> : <Keyboard className="w-3 h-3" />}
              {mode === 'VOICE' ? 'Voice' : 'Text'}
            </button>
            {/* Auto-speak toggle */}
            {mode === 'VOICE' && (
              <button onClick={() => { setAutoSpeak(!autoSpeak); toast.info(autoSpeak ? 'Auto-speak OFF' : 'Auto-speak ON', { duration: 1500 }); }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: autoSpeak ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.05)' }}
                title={autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF'}
                data-testid="toggle-auto-speak">
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-cyan)' }} /> : <VolumeX className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
              </button>
            )}
            <span className="font-mono text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
              <Clock className="w-3 h-3 inline mr-1" />{formatTime(timer)}
            </span>
            <span className="font-mono text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>Q{questionNumber}</span>
            <Button variant="ghost" size="sm" onClick={handleEndInterview} className="text-xs rounded-xl" style={{ color: 'var(--danger)' }} data-testid="end-interview-button">
              End
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%]">
                {msg.role === 'interviewer' && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${personaColors[persona]}15`, color: personaColors[persona] }}>
                      {personaNames[persona]?.charAt(0)}
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{personaNames[persona]}</span>
                    {isSpeaking && i === messages.length - 1 && msg.role === 'interviewer' && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,211,238,0.1)', color: 'var(--accent-cyan)' }}>
                        <Volume2 className="w-3 h-3" /> Speaking...
                      </span>
                    )}
                  </div>
                )}
                <div className="p-4 rounded-2xl" style={
                  msg.role === 'candidate'
                    ? { background: 'linear-gradient(135deg, var(--primary-indigo), #8B5CF6)', color: 'white', borderBottomRightRadius: '6px' }
                    : { backgroundColor: 'var(--bg-surface)', borderLeft: `3px solid ${personaColors[persona]}`, borderBottomLeftRadius: '6px', color: 'var(--text-primary)' }
                }>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                {/* Replay button for interviewer messages in voice mode */}
                {msg.role === 'interviewer' && mode === 'VOICE' && (
                  <button onClick={() => { if (isSpeaking) stopSpeaking(); else speak(msg.text); }}
                    className="mt-1 flex items-center gap-1 text-[10px] hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>
                    {isSpeaking && i === messages.length - 1 ? <><VolumeX className="w-3 h-3" /> Stop</> : <><Volume2 className="w-3 h-3" /> Replay</>}
                  </button>
                )}
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
          {mode === 'VOICE' ? (
            /* ==================== VOICE MODE ==================== */
            <div className="space-y-3">
              {/* Voice error banner */}
              {voiceError && (
                <div className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--danger)' }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{voiceError}</span>
                </div>
              )}

              {/* Live transcript display */}
              <div className="min-h-[70px] p-3 rounded-xl transition-all" style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isListening ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)'}`,
                boxShadow: isListening ? '0 0 12px rgba(99,102,241,0.08)' : 'none',
              }}>
                {(transcript || interimTranscript) ? (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {transcript}
                    {interimTranscript && (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{transcript ? ' ' : ''}{interimTranscript}</span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {isListening
                      ? 'Listening... speak your answer clearly'
                      : 'Tap the microphone button below to start speaking your answer'}
                  </p>
                )}
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-4">
                {/* Big mic button */}
                <button onClick={toggleVoiceListening} disabled={submitting}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isListening ? '' : ''}`}
                  style={{
                    backgroundColor: isListening ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
                    border: `2px solid ${isListening ? 'var(--danger)' : 'var(--primary-indigo)'}`,
                    boxShadow: isListening ? '0 0 16px rgba(239,68,68,0.15)' : 'none',
                  }}
                  data-testid="voice-mic-button">
                  {isListening
                    ? <MicOff className="w-6 h-6" style={{ color: 'var(--danger)' }} />
                    : <Mic className="w-6 h-6" style={{ color: 'var(--primary-indigo)' }} />
                  }
                </button>

                {/* Status area */}
                <div className="flex-1 min-w-0">
                  {isListening ? (
                    <div className="flex items-center gap-3">
                      {/* Audio wave bars */}
                      <div className="flex gap-0.5 items-end h-5">
                        {[0, 1, 2, 3, 4].map(i => (
                          <motion.div key={i}
                            animate={{ height: [3, 14 + Math.random() * 6, 3] }}
                            transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, repeatType: 'reverse', delay: i * 0.08 }}
                            className="w-[3px] rounded-full" style={{ backgroundColor: 'var(--primary-indigo)' }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--primary-indigo)' }}>Recording...</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Tap mic to stop</span>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {answer ? `${answer.split(' ').length} words captured` : 'Ready to record'}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <Button onClick={handleSubmit} disabled={(!answer.trim() && !isListening) || submitting}
                  className="h-11 px-5 rounded-xl text-white flex-shrink-0 font-medium" style={{ backgroundColor: 'var(--primary-indigo)' }}
                  data-testid="active-interview-send-message-button">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Submit</>}
                </Button>
              </div>
            </div>
          ) : (
            /* ==================== TEXT MODE ==================== */
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Type your answer... (Ctrl+Enter to send)" disabled={submitting}
                  className="min-h-[60px] max-h-[150px] rounded-xl resize-none" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  data-testid="interview-answer-input" />
              </div>
              <Button onClick={handleSubmit} disabled={!answer.trim() || submitting} className="h-11 w-11 rounded-xl p-0 flex-shrink-0 text-white" style={{ backgroundColor: 'var(--primary-indigo)' }}
                data-testid="active-interview-send-message-button">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Side Feedback Panel (desktop) */}
      <div className="hidden lg:block w-[360px] flex-shrink-0" style={{ borderLeft: '1px solid var(--border-subtle)' }}>
        <FeedbackPanel evaluation={evaluation} visible={showSideFeedback} onClose={() => setShowSideFeedback(false)} />
        {!showSideFeedback && (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <BarChartIcon className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Answer a question to see your scoring feedback here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BarChartIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
