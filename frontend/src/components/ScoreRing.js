import React, { useEffect, useState } from 'react';

export function ScoreRing({ score, size = 120, strokeWidth = 8, label, className = '' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 70) return 'var(--success)';
    if (s >= 40) return 'var(--warning)';
    return 'var(--danger)';
  };

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}
         style={{ width: size, height: size }}
         aria-label={`Score ${score} out of 100`}
         data-testid="score-ring">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={getColor(score)} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold" style={{ color: getColor(score) }}>
          {animatedScore}
        </span>
        {label && <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</span>}
      </div>
    </div>
  );
}

export default ScoreRing;
