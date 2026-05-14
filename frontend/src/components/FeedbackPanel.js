import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, RotateCcw, Square, Check, X, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import ScoreRing from './ScoreRing';

const dimensions = [
  { key: 'clarity', label: 'Clarity', color: 'var(--blue)' },
  { key: 'confidence', label: 'Confidence', color: 'var(--green)' },
  { key: 'structure', label: 'Structure', color: 'var(--amber)' },
  { key: 'depth', label: 'Depth', color: 'var(--purple)' },
  { key: 'relevance', label: 'Relevance', color: 'var(--blue)' },
  { key: 'completeness', label: 'Completeness', color: 'var(--green)' },
];

export default function FeedbackPanel({ evaluation, onNext, onRedo, onEnd, isLoading, questionNumber }) {
  if (!evaluation) return null;

  const scores = evaluation.scores || {};

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 overflow-y-auto space-y-4"
    >
      {/* Score Ring + Overall */}
      <div className="glass-card p-6 flex items-center gap-6">
        <ScoreRing score={evaluation.overallScore || 0} size={90} strokeWidth={7} />
        <div>
          <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">Answer Score</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {evaluation.overallScore >= 70 ? 'Great answer!' : evaluation.overallScore >= 50 ? 'Good effort, room for improvement.' : 'Needs significant improvement.'}
          </p>
          {evaluation.detectedFramework && evaluation.detectedFramework !== 'NONE' && (
            <span className="inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded-md bg-[rgba(0,214,143,0.12)] text-[var(--green)]">
              <Check className="w-3 h-3" /> {evaluation.detectedFramework} Framework Detected
            </span>
          )}
        </div>
      </div>

      {/* Dimension Bars */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Score Breakdown</h3>
        <div className="space-y-3">
          {dimensions.map((dim, i) => (
            <div key={dim.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--text-secondary)]">{dim.label}</span>
                <span className="font-mono text-xs font-semibold" style={{ color: dim.color }}>
                  {scores[dim.key] || 0}
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scores[dim.key] || 0}%` }}
                  transition={{ delay: i * 0.08, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: dim.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What Worked + What Was Missing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--green)] mb-2 flex items-center gap-2">
            <Check className="w-4 h-4" /> What Worked
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{evaluation.whatWorked}</p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--amber)] mb-2 flex items-center gap-2">
            <X className="w-4 h-4" /> What Was Missing
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{evaluation.whatWasMissing}</p>
        </div>
      </div>

      {/* How to Improve */}
      {evaluation.howToImprove && evaluation.howToImprove.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--blue)] mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> How to Improve
          </h3>
          <ul className="space-y-2">
            {evaluation.howToImprove.map((tip, i) => (
              <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5" style={{ backgroundColor: 'rgba(79,142,247,0.15)', color: 'var(--blue)' }}>{i + 1}</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved Answer */}
      {evaluation.rewrittenAnswer && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-[var(--purple)] mb-3">Stronger Version (STAR Format)</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{evaluation.rewrittenAnswer}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pb-4">
        <Button
          onClick={onNext}
          disabled={isLoading}
          className="flex-1 h-11 bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl font-semibold btn-glow"
          data-testid="feedback-next-question-button"
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ChevronRight className="w-4 h-4 mr-1" /> Next Question</>}
        </Button>
        <Button
          onClick={onRedo}
          variant="outline"
          className="h-11 rounded-xl border-white/10 text-[var(--text-primary)]"
        >
          <RotateCcw className="w-4 h-4 mr-1" /> Redo
        </Button>
        <Button
          onClick={onEnd}
          variant="ghost"
          className="h-11 rounded-xl text-[var(--text-secondary)] hover:text-[var(--red)]"
          data-testid="feedback-end-session-button"
        >
          <Square className="w-4 h-4 mr-1" /> End
        </Button>
      </div>
    </motion.div>
  );
}
