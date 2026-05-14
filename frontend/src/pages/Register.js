import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../lib/store';
import { authAPI } from '../lib/api';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthColors = ['var(--red)', 'var(--amber)', 'var(--amber)', 'var(--green)'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      login(res.data.user, res.data.access_token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Left - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="gradient-overlay-blue absolute inset-0" />
        <div className="gradient-overlay-green absolute inset-0" />
        <div className="relative z-10 max-w-md px-12">
          <Link to="/" className="font-display text-3xl font-bold text-[var(--text-primary)] mb-8 block">
            InterviewIQ
          </Link>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
            Start Your Interview Journey
          </h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed mb-8">
            Join thousands of job seekers who've improved their interview skills with AI-powered coaching.
          </p>
          <div className="glass-card p-4">
            <p className="text-sm text-[var(--text-secondary)] mb-1">No credit card required</p>
            <p className="text-[var(--text-primary)] font-semibold">Free plan includes 3 interviews/month</p>
          </div>
        </div>
      </div>

      {/* Right - Register Form */}
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
          
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Create your account</h1>
          <p className="text-[var(--text-secondary)] mb-8">Start practicing with AI interviewers today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  data-testid="register-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-10 bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  data-testid="register-email-input"
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
                  data-testid="register-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
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
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full"
                        style={{ backgroundColor: i < strength ? strengthColors[strength - 1] : 'rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strength > 0 ? strengthColors[strength - 1] : 'var(--text-muted)' }}>
                    {strength > 0 ? strengthLabels[strength - 1] : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  data-testid="register-confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] h-12 rounded-xl"
                />
              </div>
            </div>

            <Button
              data-testid="register-submit-button"
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[var(--blue)] hover:bg-[#3E7FF0] text-white font-semibold text-base btn-glow mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </form>

          <p className="text-center text-[var(--text-secondary)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--blue)] hover:underline font-medium" data-testid="register-login-link">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
