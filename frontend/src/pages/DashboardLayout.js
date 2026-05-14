import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Mic2, Building2, FileSearch, BarChart3,
  Zap, Users2, DollarSign, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../lib/store';
import { ScrollArea } from '../components/ui/scroll-area';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', end: true },
  { icon: Mic2, label: 'Mock Interview', path: '/dashboard/interview', badge: 'Start' },
  { icon: Building2, label: 'Company Prep', path: '/dashboard/company-prep' },
  { icon: FileSearch, label: 'Resume Analysis', path: '/dashboard/resume' },
  { icon: BarChart3, label: 'Progress', path: '/dashboard/progress' },
  { divider: true },
  { icon: Zap, label: 'Rapid Fire', path: '/dashboard/interview?mode=rapid_fire', badge: 'Pro' },
  { icon: Users2, label: 'Panel Sim', path: '/dashboard/interview?mode=panel', badge: 'Premium' },
  { icon: DollarSign, label: 'Salary Coach', path: '/dashboard/salary', badge: 'Premium' },
  { divider: true },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] fixed inset-y-0 left-0 z-30" style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}>
        <div className="p-6 pb-4">
          <NavLink to="/dashboard" className="font-display text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--blue)' }}>
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            InterviewIQ
          </NavLink>
        </div>
        
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            {navItems.map((item, i) => {
              if (item.divider) return <div key={i} className="my-3 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />;
              const Icon = item.icon;
              const active = isActive(item.path, item.end);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'text-[var(--text-primary)] bg-white/[0.07] border border-white/[0.10]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                      item.badge === 'Start' ? 'bg-[var(--blue)]/20 text-[var(--blue)]' :
                      item.badge === 'Pro' ? 'bg-[var(--amber)]/20 text-[var(--amber)]' :
                      'bg-[var(--purple)]/20 text-[var(--purple)]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: 'var(--blue)', color: 'white' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{user?.plan || 'FREE'} plan</p>
            </div>
          </div>
          <Button
            data-testid="sidebar-logout-button"
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-[var(--text-secondary)] hover:text-[var(--red)] hover:bg-white/[0.04] rounded-xl"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4" style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={() => setSidebarOpen(true)} className="text-[var(--text-primary)]">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-display font-bold text-[var(--text-primary)]">InterviewIQ</span>
        <div className="w-6" />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[240px] z-50 lg:hidden flex flex-col"
              style={{ backgroundColor: 'var(--bg-sidebar)' }}
            >
              <div className="p-4 flex items-center justify-between">
                <span className="font-display text-lg font-bold text-[var(--text-primary)]">InterviewIQ</span>
                <button onClick={() => setSidebarOpen(false)} className="text-[var(--text-secondary)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item, i) => {
                  if (item.divider) return <div key={i} className="my-3 h-px bg-white/[0.06]" />;
                  const Icon = item.icon;
                  const active = isActive(item.path, item.end);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                        active ? 'text-[var(--text-primary)] bg-white/[0.07]' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.08] text-[var(--text-muted)]">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[240px] mt-14 lg:mt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1280px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
