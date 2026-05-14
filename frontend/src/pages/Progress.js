import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Trophy, Target, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar } from 'recharts';
import { dashboardAPI, interviewAPI } from '../lib/api';

const milestoneLabels = {
  first_interview: 'First Interview', streak_3: '3-Day Streak', streak_7: '7-Day Streak',
  score_70: 'Score 70+', score_80: 'Score 80+', score_90: 'Score 90+',
  sessions_10: '10 Sessions', sessions_25: '25 Sessions', voice_interview: 'Voice Interview',
  panel_interview: 'Panel Interview', company_prep: 'Company Prep', resume_analyzed: 'Resume Analyzed'
};

const allMilestones = Object.keys(milestoneLabels);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 !bg-[rgba(14,18,32,0.95)]" style={{ border: '1px solid var(--border-subtle)' }}>
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-mono font-semibold" style={{ color: p.color }}>{p.name}: {Math.round(p.value)}</p>
      ))}
    </div>
  );
};

export default function Progress() {
  const [data, setData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardAPI.progress(),
      interviewAPI.list({ limit: 50 })
    ]).then(([prog, sess]) => {
      setData(prog.data);
      setSessions(sess.data.sessions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[var(--blue)]" /></div>;
  }

  const scoreTrend = data?.score_trend || [];
  const dimensionData = data?.dimension_data || [];
  const weaknessFreq = data?.weakness_frequency || {};
  const milestones = data?.milestones || [];

  // Radar data from latest session
  const latestDim = dimensionData.length > 0 ? dimensionData[dimensionData.length - 1] : null;
  const radarData = latestDim ? [
    { dim: 'Clarity', value: latestDim.clarity || 0 },
    { dim: 'Confidence', value: latestDim.confidence || 0 },
    { dim: 'Structure', value: latestDim.structure || 0 },
    { dim: 'Depth', value: latestDim.depth || 0 },
    { dim: 'Relevance', value: latestDim.relevance || 0 },
    { dim: 'Complete', value: latestDim.completeness || 0 },
  ] : [];

  const weaknessData = Object.entries(weaknessFreq).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Progress & Analytics</h1>
        <p className="text-[var(--text-secondary)]">{data?.total_sessions || 0} sessions · {data?.total_answers || 0} answers analyzed</p>
      </div>

      {scoreTrend.length > 0 ? (
        <>
          {/* Score Trend */}
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--blue)]" /> Score Trend
            </h2>
            <div className="h-[250px]">
              <ResponsiveContainer>
                <AreaChart data={scoreTrend}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: '#8B9DC3', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#8B9DC3', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#4F8EF7" fill="url(#scoreGrad)" strokeWidth={2} name="Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar + Weakness */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {radarData.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Skill Radar</h2>
                <div className="h-[250px]">
                  <ResponsiveContainer>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="dim" tick={{ fill: '#8B9DC3', fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} />
                      <Radar name="Score" dataKey="value" stroke="#4F8EF7" fill="#4F8EF7" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {weaknessData.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Weakness Frequency</h2>
                <div className="h-[250px]">
                  <ResponsiveContainer>
                    <BarChart data={weaknessData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" tick={{ fill: '#8B9DC3', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#8B9DC3', fontSize: 11 }} width={110} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#FF4D6A" radius={[0, 4, 4, 0]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="glass-card p-12 text-center">
          <BarChart3 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] mb-2">No progress data yet</p>
          <p className="text-sm text-[var(--text-muted)]">Complete some interview sessions to see your progress here</p>
        </div>
      )}

      {/* Session History */}
      {sessions.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Session History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Date', 'Company', 'Role', 'Round', 'Mode', 'Score', 'Status'].map(h => (
                    <th key={h} className="p-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="p-3 text-sm text-[var(--text-secondary)] font-mono">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-sm text-[var(--text-primary)]">{s.company || '-'}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{s.role || '-'}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{s.round}</td>
                    <td className="p-3 text-sm text-[var(--text-secondary)]">{s.mode}</td>
                    <td className="p-3"><span className={`font-mono text-sm font-semibold ${
                      (s.overall_score || 0) >= 70 ? 'text-[var(--green)]' : (s.overall_score || 0) >= 50 ? 'text-[var(--amber)]' : 'text-[var(--red)]'
                    }`}>{s.overall_score ? Math.round(s.overall_score) : '-'}</span></td>
                    <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded ${
                      s.status === 'COMPLETED' ? 'bg-[rgba(0,214,143,0.12)] text-[var(--green)]' : 'bg-[rgba(245,166,35,0.12)] text-[var(--amber)]'
                    }`}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[var(--amber)]" /> Achievements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allMilestones.map((m) => {
            const earned = milestones.includes(m);
            return (
              <div key={m} className={`p-3 rounded-xl text-center transition-colors ${
                earned ? 'bg-[rgba(245,166,35,0.08)] border border-[rgba(245,166,35,0.2)]' : 'bg-white/[0.03] border border-[var(--border-subtle)] opacity-40'
              }`}>
                <Trophy className={`w-6 h-6 mx-auto mb-2 ${earned ? 'text-[var(--amber)]' : 'text-[var(--text-muted)]'}`} />
                <p className={`text-xs font-medium ${earned ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                  {milestoneLabels[m]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
