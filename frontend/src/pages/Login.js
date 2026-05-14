import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../lib/store';
import { authAPI } from '../lib/api';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      login(res.data.user, res.data.access_token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Left - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="gradient-overlay-blue absolute inset-0" />
        <div className="gradient-overlay-purple absolute inset-0" />
        <div className="relative z-10 max-w-md px-12">
          <Link to="/" className="font-display text-3xl font-bold text-[var(--text-primary)] mb-8 block">
            InterviewIQ
          </Link>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
            Your AI Interview Coach
          </h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-8">
            Practice with AI interviewers, get scored across 6 dimensions, and land your dream job.
          </p>
          <div className="space-y-4">
            {['Real-time AI feedback', '6-dimension scoring', 'Company-specific prep'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--green)' }} />
                <span className="text-[var(--text-secondary)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Link to="/" className="font-display text-2xl font-bold text-[var(--text-primary)]">
              InterviewIQ
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome back</h1>
          <p className="text-[var(--text-secondary)] mb-8">Sign in to continue your interview prep</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  data-testid="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] h-12 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              data-testid="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[var(--blue)] hover:bg-[#3E7FF0] text-white font-semibold text-base btn-glow"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>

          <p className="text-center text-[var(--text-secondary)] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--blue)] hover:underline font-medium" data-testid="login-register-link">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
