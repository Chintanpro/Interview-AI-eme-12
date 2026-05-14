import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Lightbulb, FileText } from 'lucide-react';
import { Button } from './ui/button';
import ScoreRing from './ScoreRing';

export function FeedbackPanel({ evaluation, onClose, visible }) {
  if (!evaluation || !visible) return null;

  const scores = evaluation.scores || {};
  const dims = [
    { key: 'clarity', label: 'Clarity', color: 'var(--info)' },
    { key: 'confidence', label: 'Confidence', color: 'var(--accent-cyan)' },
    { key: 'relevance', label: 'Relevance', color: 'var(--primary-indigo)' },
    { key: 'structure', label: 'Structure', color: 'var(--success)' },
    { key: 'completeness', label: 'Completeness', color: 'var(--warning)' },
    { key: 'depth', label: 'Depth', color: '#A78BFA' },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-5 h-full overflow-y-auto"
          data-testid="feedback-panel"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Answer Feedback</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0" data-testid="feedback-close-button">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-center mb-6">
            <ScoreRing score={evaluation.overallScore || 0} size={100} label="Overall" />
          </div>

          <div className="space-y-3 mb-6">
            {dims.map(d => {
              const val = scores[d.key] || 0;
              return (
                <div key={d.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>{d.label}</span>
                    <span className="font-mono font-semibold" style={{ color: d.color }}>{val}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {evaluation.whatWorked && (
            <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>What Worked</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{evaluation.whatWorked}</p>
            </div>
          )}

          {evaluation.whatWasMissing && (
            <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>What Was Missing</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{evaluation.whatWasMissing}</p>
            </div>
          )}

          {evaluation.howToImprove && evaluation.howToImprove.length > 0 && (
            <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4" style={{ color: 'var(--primary-indigo)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--primary-indigo)' }}>Tips to Improve</span>
              </div>
              <ul className="space-y-1">
                {evaluation.howToImprove.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.rewrittenAnswer && (
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)' }}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--accent-cyan)' }}>Improved Answer (STAR)</span>
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>{evaluation.rewrittenAnswer}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FeedbackPanel;
