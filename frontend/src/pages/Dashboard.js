import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic, TrendingUp, Flame, Target, ArrowRight, Clock,
  Building2, BarChart3, Sparkles, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import ScoreRing from '../components/ScoreRing';
import { dashboardAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';

const stagger = { container: { animate: { transition: { staggerChildren: 0.06 } } }, item: { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45 } } } };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.stats();
        setStats(res.data);
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const SkeletonCard = () => (
    <div className="glass-card p-5">
      <div className="skeleton-shimmer h-4 w-24 rounded mb-3" />
      <div className="skeleton-shimmer h-8 w-16 rounded" />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 glass-card p-6"><div className="skeleton-shimmer h-48 rounded-xl" /></div>
          <div className="lg:col-span-2 glass-card p-6"><div className="skeleton-shimmer h-48 rounded-xl" /></div>
        </div>
      </div>
    );
  }

  const recentSessions = stats?.recent_sessions || [];
  const dimAvgs = stats?.dimension_averages || {};

  return (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={stagger.item}>
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back, {user?.name?.split(' ')[0] || 'there'}</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Here's your interview preparation overview</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger.item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5" data-testid="dashboard-kpi-overall-score">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4" style={{ color: 'var(--primary-indigo)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Avg Score</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.avg_score || 0}</span>
            <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>/100</span>
          </div>
        </div>
        <div className="glass-card p-5" data-testid="dashboard-kpi-total-sessions">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total Sessions</span>
          </div>
          <span className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.total_sessions || 0}</span>
        </div>
        <div className="glass-card p-5" data-testid="dashboard-kpi-this-month">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--success)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>This Month</span>
          </div>
          <span className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.this_month_sessions || 0}</span>
        </div>
        <div className="glass-card p-5" data-testid="dashboard-kpi-streak">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4" style={{ color: 'var(--warning)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Streak</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.streak_days || 0}</span>
            <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>days</span>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Sessions */}
        <motion.div variants={stagger.item} className="lg:col-span-3">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Recent Sessions</h3>
              {recentSessions.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/progress')} className="text-xs rounded-xl" style={{ color: 'var(--primary-indigo)' }} data-testid="view-all-sessions">
                  View all <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
            {recentSessions.length === 0 ? (
              <div className="text-center py-12">
                <Mic className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No sessions yet</h4>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Your first interview takes about 15 minutes. Give it a try.</p>
                <Button onClick={() => navigate('/dashboard/interview')} className="rounded-xl btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="start-first-interview">
                  <Mic className="w-4 h-4 mr-2" /> Start Interview
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session, i) => (
                  <div key={session.id || i}
                    className="flex items-center gap-4 p-3 rounded-xl cursor-pointer" style={{ backgroundColor: 'rgba(255,255,255,0.02)', transition: 'background-color 0.15s' }}
                    onClick={() => session.status === 'COMPLETED' ? navigate(`/dashboard/interview/session/${session.id}/complete`) : null}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>
                      {(session.company || 'G').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{session.company || 'General'} — {session.role || 'Engineer'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{session.round || 'Behavioral'} • {session.total_questions || 0} questions</p>
                    </div>
                    <div className="text-right">
                      {session.overall_score ? (
                        <span className="font-mono text-sm font-semibold" style={{ color: session.overall_score >= 70 ? 'var(--success)' : session.overall_score >= 40 ? 'var(--warning)' : 'var(--danger)' }}>{Math.round(session.overall_score)}/100</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>In Progress</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Focus Areas */}
        <motion.div variants={stagger.item} className="lg:col-span-2">
          <div className="glass-card p-6">
            <h3 className="font-display text-base font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Focus Areas</h3>
            {stats?.total_sessions === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Complete your first interview to see your focus areas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.top_weakness && stats.top_weakness !== 'N/A' && (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--warning)' }}>Top Weakness</span>
                    <p className="text-sm font-semibold mt-1 capitalize" style={{ color: 'var(--text-primary)' }}>{stats.top_weakness}</p>
                  </div>
                )}
                {stats?.top_strength && stats.top_strength !== 'N/A' && (
                  <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>Top Strength</span>
                    <p className="text-sm font-semibold mt-1 capitalize" style={{ color: 'var(--text-primary)' }}>{stats.top_strength}</p>
                  </div>
                )}
                <div className="space-y-2 mt-4">
                  {Object.entries(dimAvgs).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>{key}</span>
                        <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{Math.round(val || 0)}</span>
                      </div>
                      <div className="h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{ width: `${val || 0}%`, backgroundColor: val >= 70 ? 'var(--success)' : val >= 40 ? 'var(--warning)' : 'var(--danger)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Start */}
      <motion.div variants={stagger.item}>
        <div className="glass-card p-6" style={{ borderLeft: '3px solid var(--primary-indigo)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Ready for your next practice?</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Start a new mock interview and improve your skills.</p>
            </div>
            <Button onClick={() => navigate('/dashboard/interview')} className="rounded-xl btn-glow text-white flex-shrink-0" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="quick-start-button">
              <Mic className="w-4 h-4 mr-2" /> Start Interview <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
