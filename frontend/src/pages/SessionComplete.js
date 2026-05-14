import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Share2, RotateCcw, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, FileText, Lightbulb, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import ScoreRing from '../components/ScoreRing';
import { interviewAPI } from '../lib/api';
import { useInterviewStore } from '../lib/store';
import { toast } from 'sonner';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

export default function SessionComplete() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { reset } = useInterviewStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await interviewAPI.getSession(sessionId);
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
    return () => reset();
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-t-[var(--primary-indigo)] border-white/10 rounded-full animate-spin mb-4" />
        <p className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Generating your report...</p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Analyzing your performance across 6 dimensions</p>
      </div>
    );
  }

  if (!data) return null;

  const session = data.session || {};
  const answers = data.answers || [];
  const summary = data.summary || {};

  const dims = [
    { key: 'clarity_score', label: 'Clarity', color: '#60A5FA' },
    { key: 'confidence_score', label: 'Confidence', color: '#22D3EE' },
    { key: 'relevance_score', label: 'Relevance', color: '#6366F1' },
    { key: 'structure_score', label: 'Structure', color: '#10B981' },
    { key: 'completeness_score', label: 'Completeness', color: '#F59E0B' },
    { key: 'depth_score', label: 'Depth', color: '#A78BFA' },
  ];

  const radarData = dims.map(d => ({
    dimension: d.label,
    score: session[d.key] || 0,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="rounded-xl text-xs" style={{ color: 'var(--text-secondary)' }} data-testid="share-report-button">
            <Share2 className="w-3.5 h-3.5 mr-1" /> Share
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { reset(); navigate('/dashboard/interview'); }} className="rounded-xl text-xs" style={{ color: 'var(--primary-indigo)' }} data-testid="practice-again-button">
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Practice Again
          </Button>
        </div>
      </div>

      {/* Report Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{session.company} — {session.role}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>{session.round}</span>
              <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{session.persona}</span>
              <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>Complete</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{answers.length} questions</span>
            </div>
          </div>
          <ScoreRing score={Math.round(session.overall_score || 0)} size={110} label="Overall" />
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="glass-card p-6">
          <h3 className="font-display text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Performance Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="#6366F1" fill="rgba(99,102,241,0.22)" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Dimension Breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-display text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Dimension Scores</h3>
          <div className="space-y-4">
            {dims.map((d, i) => {
              const val = Math.round(session[d.key] || 0);
              return (
                <div key={d.key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
                    <span className="font-mono font-semibold" style={{ color: d.color }}>{val}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8, delay: i * 0.08 }}
                      className="h-full rounded-full" style={{ backgroundColor: d.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Coach Summary */}
      {summary?.overallFeedback && (
        <div className="glass-card p-6" style={{ borderLeft: '3px solid var(--primary-indigo)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--primary-indigo)' }} />
            <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>AI Coach Summary</h3>
          </div>
          <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>"{summary.overallFeedback}"</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {summary.strengths && summary.strengths.length > 0 && (
              <div>
                <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>Strengths</span>
                <ul className="mt-1 space-y-1">
                  {summary.strengths.map((s, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {summary.improvements && summary.improvements.length > 0 && (
              <div>
                <span className="text-xs font-medium" style={{ color: 'var(--warning)' }}>Areas to Improve</span>
                <ul className="mt-1 space-y-1">
                  {summary.improvements.map((s, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--warning)' }} /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Review */}
      <div className="glass-card p-6">
        <h3 className="font-display text-base font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Question Review ({answers.length})</h3>
        <div className="space-y-3">
          {answers.map((a, i) => (
            <div key={a.id || i} className="rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
              <button onClick={() => setExpandedAnswer(expandedAnswer === i ? null : i)} className="w-full flex items-center gap-3 p-4 text-left">
                <span className="font-mono text-xs px-2 py-1 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>Q{i + 1}</span>
                <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-primary)' }}>{a.question_text}</span>
                <span className="font-mono text-sm font-semibold flex-shrink-0" style={{ color: (a.score || 0) >= 70 ? 'var(--success)' : (a.score || 0) >= 40 ? 'var(--warning)' : 'var(--danger)' }}>{Math.round(a.score || 0)}</span>
                {expandedAnswer === i ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
              </button>
              {expandedAnswer === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.2 }} className="px-4 pb-4 space-y-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Your Answer</span>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a.answer_text}</p>
                  </div>
                  {a.improved_answer && (
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.1)' }}>
                      <span className="text-xs font-medium block mb-1" style={{ color: 'var(--accent-cyan)' }}>Improved Version</span>
                      <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>{a.improved_answer}</p>
                    </div>
                  )}
                  {a.what_worked && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 mt-0.5" style={{ color: 'var(--success)' }} />
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.what_worked}</p>
                    </div>
                  )}
                  {a.missing_points && (
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 mt-0.5" style={{ color: 'var(--warning)' }} />
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{a.missing_points}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => { reset(); navigate('/dashboard/interview'); }} className="flex-1 h-11 rounded-xl font-semibold btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="practice-again-full-button">
          Practice Again (Same Setup)
        </Button>
        <Button variant="outline" onClick={() => { reset(); navigate('/dashboard/interview'); }} className="flex-1 h-11 rounded-xl" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}>
          New Interview
        </Button>
      </div>
    </motion.div>
  );
}
