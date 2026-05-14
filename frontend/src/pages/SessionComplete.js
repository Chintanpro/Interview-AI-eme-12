import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Target, ChevronDown, ChevronUp, Mic2, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { interviewAPI } from '../lib/api';
import ScoreRing from '../components/ScoreRing';
import { useInterviewStore } from '../lib/store';

const dimensions = [
  { key: 'clarity', label: 'Clarity', color: 'var(--blue)' },
  { key: 'confidence', label: 'Confidence', color: 'var(--green)' },
  { key: 'structure', label: 'Structure', color: 'var(--amber)' },
  { key: 'depth', label: 'Depth', color: 'var(--purple)' },
  { key: 'relevance', label: 'Relevance', color: 'var(--blue)' },
  { key: 'completeness', label: 'Completeness', color: 'var(--green)' },
];

export default function SessionComplete() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState(null);
  const reset = useInterviewStore((s) => s.reset);

  useEffect(() => {
    reset();
    interviewAPI.getSession(sessionId).then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-2 border-[var(--blue)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-[var(--text-secondary)]">Session not found</div>;
  }

  const { session, answers } = data;
  const score = session.overall_score || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
          <ScoreRing score={score} size={120} strokeWidth={8} className="mx-auto mb-4" />
        </motion.div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Interview Complete</h1>
        <p className="text-[var(--text-secondary)]">
          {session.company} — {session.role} · {session.persona} · {session.round}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Performance Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {dimensions.map((dim, i) => {
            const val = session[`${dim.key}_score`] || 0;
            return (
              <motion.div
                key={dim.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-center p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <p className="font-mono text-2xl font-bold mb-1" style={{ color: dim.color }}>{Math.round(val)}</p>
                <p className="text-xs text-[var(--text-muted)]">{dim.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <p className="font-mono text-xl font-bold text-[var(--text-primary)]">{answers?.length || 0}</p>
          <p className="text-xs text-[var(--text-muted)]">Questions Answered</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-mono text-xl font-bold text-[var(--text-primary)]">{session.total_questions || 0}</p>
          <p className="text-xs text-[var(--text-muted)]">Total Questions</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-mono text-xl font-bold text-[var(--text-primary)]">{session.mode}</p>
          <p className="text-xs text-[var(--text-muted)]">Mode</p>
        </div>
      </div>

      {/* Answer Review */}
      {answers && answers.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Answer Review</h2>
          </div>
          <div>
            {answers.map((a, i) => (
              <div key={a.id} className="border-b last:border-b-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  onClick={() => setExpandedAnswer(expandedAnswer === i ? null : i)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02]"
                >
                  <span className="font-mono text-xs text-[var(--text-muted)] w-6">Q{i + 1}</span>
                  <span className="flex-1 text-sm text-[var(--text-primary)] truncate">{a.question_text}</span>
                  <span className={`font-mono text-sm font-semibold px-2 py-0.5 rounded-md ${
                    (a.score || 0) >= 70 ? 'bg-[rgba(0,214,143,0.12)] text-[var(--green)]' :
                    (a.score || 0) >= 50 ? 'bg-[rgba(245,166,35,0.12)] text-[var(--amber)]' :
                    'bg-[rgba(255,77,106,0.12)] text-[var(--red)]'
                  }`}>
                    {Math.round(a.score || 0)}
                  </span>
                  {expandedAnswer === i ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                </button>
                {expandedAnswer === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4 space-y-3"
                  >
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-1">Your Answer</p>
                      <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{a.answer_text}</p>
                    </div>
                    {a.improved_answer && (
                      <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(79,142,247,0.06)' }}>
                        <p className="text-xs font-medium text-[var(--blue)] mb-1">Improved Version</p>
                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{a.improved_answer}</p>
                      </div>
                    )}
                    {a.what_worked && (
                      <p className="text-xs text-[var(--green)]">What worked: {a.what_worked}</p>
                    )}
                    {a.missing_points && (
                      <p className="text-xs text-[var(--amber)]">Missing: {a.missing_points}</p>
                    )}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pb-8">
        <Link to="/dashboard/interview" className="flex-1">
          <Button className="w-full h-12 bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl font-semibold btn-glow" data-testid="session-complete-new-interview">
            <Mic2 className="w-4 h-4 mr-2" /> Start New Interview
          </Button>
        </Link>
        <Link to="/dashboard/progress" className="flex-1">
          <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 text-[var(--text-primary)]">
            <BarChart3 className="w-4 h-4 mr-2" /> View Progress
          </Button>
        </Link>
      </div>
    </div>
  );
}
