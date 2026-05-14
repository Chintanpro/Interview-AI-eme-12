import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Target, Award, Calendar } from 'lucide-react';
import { dashboardAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import ScoreRing from '../components/ScoreRing';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell } from 'recharts';

const milestoneData = [
  { id: 'first_interview', name: 'First Steps', emoji: '\ud83c\udfaf', req: '1 session' },
  { id: 'sessions_10', name: 'Dedicated', emoji: '\ud83d\udcaa', req: '10 sessions' },
  { id: 'sessions_25', name: 'Committed', emoji: '\ud83d\ude80', req: '25 sessions' },
  { id: 'score_70', name: 'Proficient', emoji: '\u2b50', req: 'Score 70+' },
  { id: 'score_80', name: 'Strong', emoji: '\ud83c\udf1f', req: 'Score 80+' },
  { id: 'score_90', name: 'Elite', emoji: '\ud83d\udc8e', req: 'Score 90+' },
];

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    dashboardAPI.progress().then(res => { setData(res.data); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1,2,3].map(i => <div key={i} className="glass-card p-6"><div className="skeleton-shimmer h-32 rounded-xl" /></div>)}
      </div>
    );
  }

  const scoreTrend = data?.score_trend || [];
  const dimData = data?.dimension_data || [];
  const weaknesses = data?.weakness_frequency || {};
  const milestones = data?.milestones || [];

  const lastDimEntry = dimData[dimData.length - 1] || {};
  const radarData = ['clarity', 'confidence', 'relevance', 'structure', 'completeness', 'depth'].map(d => ({
    dimension: d.charAt(0).toUpperCase() + d.slice(1),
    score: lastDimEntry[d] || 0,
  }));

  const weaknessArr = Object.entries(weaknesses).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const customTooltip = ({ payload, label }) => {
    if (!payload?.length) return null;
    return (
      <div className="glass-card p-3 text-xs" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <p style={{ color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {Math.round(p.value)}</p>)}
      </div>
    );
  };

  if (!data?.total_sessions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Target className="w-14 h-14 mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
        <h3 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>No data yet</h3>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Complete your first interview to see your progress analytics.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Score Trend */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4" style={{ color: 'var(--primary-indigo)' }} />
          <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Score Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={scoreTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <Tooltip content={customTooltip} />
            <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 3 }} name="Score" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Skills Radar */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
            <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Skills Radar</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="#6366F1" fill="rgba(99,102,241,0.22)" strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Weakness Frequency */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--warning)' }} />
            <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Common Weaknesses</h3>
          </div>
          {weaknessArr.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No weakness data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weaknessArr.map(([name, count]) => ({ name, count }))} layout="vertical">
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={120} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Occurrences">
                  {weaknessArr.map(([, count], i) => (
                    <Cell key={i} fill={count > 5 ? 'var(--danger)' : count > 3 ? 'var(--warning)' : 'var(--text-muted)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Award className="w-4 h-4" style={{ color: 'var(--warning)' }} />
          <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Achievements</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {milestoneData.map(m => {
            const earned = milestones.includes(m.id);
            return (
              <div key={m.id} className={`text-center p-3 rounded-xl ${earned ? '' : 'opacity-40'}`} style={{ backgroundColor: earned ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)' }}>
                <span className="text-2xl">{m.emoji}</span>
                <p className="text-[10px] font-medium mt-1" style={{ color: earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>{m.name}</p>
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{m.req}</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
