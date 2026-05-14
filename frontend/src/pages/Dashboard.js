import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic2, Building2, FileSearch, TrendingUp, Target,
  BarChart3, Clock, ArrowRight, Trophy, Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../lib/store';
import { dashboardAPI } from '../lib/api';
import ScoreRing from '../components/ScoreRing';

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.stats().then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const kpis = stats ? [
    { label: 'Sessions This Month', value: stats.this_month_sessions || 0, icon: BarChart3, color: 'var(--blue)' },
    { label: 'Avg Score', value: stats.avg_score || 0, icon: Target, color: 'var(--green)', suffix: '/100' },
    { label: 'Total Sessions', value: stats.total_sessions || 0, icon: Clock, color: 'var(--amber)' },
    { label: 'Top Weakness', value: stats.top_weakness || 'N/A', icon: TrendingUp, color: 'var(--red)', isText: true },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden">
        <div className="gradient-overlay-blue absolute inset-0" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">
                {greeting()}, {user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-[var(--text-secondary)]">
                {stats?.total_sessions > 0 
                  ? `You've completed ${stats.total_sessions} interview${stats.total_sessions !== 1 ? 's' : ''}. Keep going!` 
                  : 'Ready to start your interview preparation journey?'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard/interview">
                <Button className="bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl btn-glow" data-testid="dashboard-start-interview-button">
                  <Mic2 className="w-4 h-4 mr-2" /> Start Mock Interview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-5 h-28 shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5"
              data-testid={`dashboard-kpi-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">{kpi.label}</p>
                  {kpi.isText ? (
                    <p className="text-lg font-semibold text-[var(--text-primary)] capitalize">{kpi.value}</p>
                  ) : (
                    <p className="font-mono text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
                      {kpi.value}{kpi.suffix || ''}
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions + Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-3 glass-card">
          <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Recent Sessions</h2>
              <Link to="/dashboard/progress" className="text-xs text-[var(--blue)] hover:underline">View all</Link>
            </div>
          </div>
          <div className="p-5">
            {stats?.recent_sessions?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_sessions.map((session, i) => (
                  <Link
                    key={session.id}
                    to={session.status === 'COMPLETED' ? `/dashboard/interview/session/${session.id}/complete` : `/dashboard/interview/session/${session.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(79,142,247,0.1)' }}>
                      <Mic2 className="w-4 h-4 text-[var(--blue)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {session.company || 'General'} — {session.role || 'Interview'}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {session.persona} · {session.round} · {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {session.overall_score && (
                      <span className={`font-mono text-sm font-semibold px-2 py-0.5 rounded-md ${
                        session.overall_score >= 70 ? 'bg-[rgba(0,214,143,0.12)] text-[var(--green)]' :
                        session.overall_score >= 50 ? 'bg-[rgba(245,166,35,0.12)] text-[var(--amber)]' :
                        'bg-[rgba(255,77,106,0.12)] text-[var(--red)]'
                      }`}>
                        {Math.round(session.overall_score)}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-md ${
                      session.status === 'COMPLETED' ? 'bg-[rgba(0,214,143,0.12)] text-[var(--green)]' :
                      session.status === 'IN_PROGRESS' ? 'bg-[rgba(245,166,35,0.12)] text-[var(--amber)]' :
                      'bg-[rgba(255,77,106,0.12)] text-[var(--red)]'
                    }`}>
                      {session.status === 'IN_PROGRESS' ? 'In Progress' : session.status === 'COMPLETED' ? 'Done' : 'Abandoned'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mic2 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)] mb-2">No interview sessions yet</p>
                <p className="text-sm text-[var(--text-muted)] mb-4">Start your first mock interview to see results here</p>
                <Link to="/dashboard/interview">
                  <Button className="bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl" size="sm">
                    Start Interview
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { icon: Mic2, label: 'Mock Interview', desc: 'Practice with AI interviewer', path: '/dashboard/interview', color: 'var(--blue)' },
                { icon: Building2, label: 'Company Prep', desc: 'Predict interview questions', path: '/dashboard/company-prep', color: 'var(--purple)' },
                { icon: FileSearch, label: 'Resume Analysis', desc: 'Match resume to job', path: '/dashboard/resume', color: 'var(--green)' },
                { icon: Zap, label: 'Rapid Fire', desc: '60-second answers', path: '/dashboard/interview?mode=rapid_fire', color: 'var(--amber)' },
              ].map((action, i) => (
                <Link
                  key={i}
                  to={action.path}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                    <action.icon className="w-4 h-4" style={{ color: action.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{action.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Milestones Preview */}
          {stats?.milestones?.length > 0 && (
            <div className="glass-card p-5">
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Achievements</h2>
              <div className="flex flex-wrap gap-2">
                {stats.milestones.map((m, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ backgroundColor: 'rgba(245,166,35,0.1)', color: 'var(--amber)' }}>
                    <Trophy className="w-3 h-3" /> {m.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
