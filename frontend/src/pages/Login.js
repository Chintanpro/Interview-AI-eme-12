import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      login(res.data.user, res.data.access_token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center p-12" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="gradient-overlay-indigo absolute inset-0" />
        <div className="relative z-10 max-w-md">
          <Link to="/" className="font-display text-2xl font-bold flex items-center gap-2.5 mb-8" style={{ color: 'var(--text-primary)' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-indigo)' }}>
              <span className="text-white font-bold">IQ</span>
            </div>
            InterviewIQ
          </Link>
          <h2 className="font-display text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>Continue your interview preparation journey.</p>
          <div className="space-y-4">
            {['AI-powered mock interviews', '6-dimension scoring', 'Personalized feedback'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link to="/" className="font-display text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-indigo)' }}>
                <span className="text-white font-bold text-sm">IQ</span>
              </div>
              InterviewIQ
            </Link>
          </div>

          <h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Sign in</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="pl-10 h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  data-testid="login-email-input" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <Label className="text-sm" style={{ color: 'var(--text-secondary)' }}>Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password"
                  className="pl-10 pr-10 h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  data-testid="login-password-input" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="login-form-submit-button">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" className="font-semibold" style={{ color: 'var(--primary-indigo)' }}>Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
