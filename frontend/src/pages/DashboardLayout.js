import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Mic, Sparkles, FileText, TrendingUp, DollarSign,
  Settings, LogOut, Menu, X, ChevronLeft, Lock, Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../lib/store';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard', plan: null },
  { label: 'Practice', icon: Mic, path: '/dashboard/interview', plan: null },
  { label: 'Predict', icon: Sparkles, path: '/dashboard/company-prep', plan: null },
  { label: 'Resume', icon: FileText, path: '/dashboard/resume', plan: 'PRO' },
  { label: 'Progress', icon: TrendingUp, path: '/dashboard/progress', plan: 'PRO' },
  { label: 'Salary Coach', icon: DollarSign, path: '/dashboard/salary', plan: 'PREMIUM' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings', plan: null },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const userPlan = user?.plan || 'FREE';
  const planOrder = { FREE: 0, PRO: 1, PREMIUM: 2 };

  const canAccess = (requiredPlan) => {
    if (!requiredPlan) return true;
    return planOrder[userPlan] >= planOrder[requiredPlan];
  };

  const handleNavClick = (item) => {
    if (!canAccess(item.plan)) {
      toast.error(`${item.label} requires ${item.plan} plan. Upgrade to access.`);
      return;
    }
    navigate(item.path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.includes('interview/session') && path.includes('complete')) return 'Session Report';
    if (path.includes('interview/session')) return 'Interview';
    if (path.includes('interview')) return 'Practice Interview';
    if (path.includes('company-prep')) return 'Company Prediction';
    if (path.includes('resume')) return 'Resume Analysis';
    if (path.includes('progress')) return 'Progress';
    if (path.includes('salary')) return 'Salary Coach';
    if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : ''}`} style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary-indigo)' }}>
          <span className="text-white font-bold text-sm">IQ</span>
        </div>
        {(!collapsed || mobile) && <span className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>InterviewIQ</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const locked = !canAccess(item.plan);

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? '' : 'hover:bg-white/[0.04]'
              }`}
              style={{
                backgroundColor: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: isActive ? 'var(--primary-indigo)' : locked ? 'var(--text-muted)' : 'var(--text-secondary)',
                borderLeft: isActive ? '3px solid var(--primary-indigo)' : '3px solid transparent',
              }}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
              {(!collapsed || mobile) && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {locked && <Lock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--primary-indigo)' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>{userPlan}</span>
            </div>
          </div>
        )}
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 rounded-xl text-sm" style={{ color: 'var(--text-muted)' }} data-testid="logout-button">
          <LogOut className="w-4 h-4" /> {(!collapsed || mobile) && 'Sign out'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Desktop Sidebar */}
      <div className={`hidden md:block flex-shrink-0 transition-all duration-200 ${collapsed ? 'w-16' : 'w-[260px]'}`}
           style={{ borderRight: '1px solid var(--border-subtle)' }}>
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }} className="relative w-[280px] z-10">
              <Sidebar mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-base)' }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setMobileOpen(true)} data-testid="mobile-nav-toggle">
              <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </button>
            <button className="hidden md:block" onClick={() => setCollapsed(!collapsed)} data-testid="sidebar-collapse">
              <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
            </button>
            <h1 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>{userPlan} Plan</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer" style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--primary-indigo)' }}
                 onClick={() => navigate('/dashboard/settings')}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
