import React from 'react';

export default function ScoreRing({ score, size = 80, strokeWidth = 6, className = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score >= 70) return 'var(--green)';
    if (score >= 50) return 'var(--amber)';
    return 'var(--red)';
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="score-ring-animated"
          style={{ '--final-offset': offset }}
        />
      </svg>
      <span className="absolute font-mono font-bold text-[var(--text-primary)]" style={{ fontSize: size * 0.22 }}>
        {Math.round(score)}
      </span>
    </div>
  );
}
