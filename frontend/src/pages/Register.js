import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const getStrength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['var(--danger)', 'var(--warning)', 'var(--info)', 'var(--success)'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      login(res.data.user, res.data.access_token);
      toast.success('Account created! Welcome to InterviewIQ.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
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
          <h2 className="font-display text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Start practicing today</h2>
          <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>Create your account and begin your interview preparation journey.</p>
          <div className="space-y-4">
            {['Free plan includes 3 interviews/month', 'No credit card required', 'Instant AI-powered feedback'].map((item, i) => (
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

          <h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Create account</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Start your free interview coaching</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                  className="pl-10 h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  data-testid="register-name-input" />
              </div>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="pl-10 h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  data-testid="register-email-input" />
              </div>
            </div>
            <div>
              <Label className="text-sm mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters"
                  className="pl-10 pr-10 h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  data-testid="register-password-input" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full" style={{ backgroundColor: i < strength ? strengthColors[strength - 1] : 'rgba(255,255,255,0.06)' }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: strength > 0 ? strengthColors[strength - 1] : 'var(--text-muted)' }}>{strength > 0 ? strengthLabels[strength - 1] : ''}</span>
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl font-semibold btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="register-form-submit-button">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
            By creating an account you agree to our Terms and Privacy Policy.
          </p>
          <p className="text-sm text-center mt-4" style={{ color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" className="font-semibold" style={{ color: 'var(--primary-indigo)' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
