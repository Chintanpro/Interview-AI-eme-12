import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Briefcase, Mic, Keyboard, Users, UserCheck,
  Code, Shield, Zap, ArrowRight, ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { interviewAPI } from '../lib/api';
import { useInterviewStore, useAuthStore } from '../lib/store';
import { toast } from 'sonner';

const personas = [
  { id: 'RECRUITER', name: 'Sarah Chen', title: 'Senior Recruiter', style: 'Warm, encouraging, culture-focused', color: '#10B981', icon: UserCheck },
  { id: 'MANAGER', name: 'Marcus Williams', title: 'Engineering Director', style: 'Results-first, pushes for specifics', color: '#6366F1', icon: Briefcase },
  { id: 'TECHNICAL', name: 'Priya Patel', title: 'Principal Engineer', style: 'Deep technical dives, asks why', color: '#8B5CF6', icon: Code },
  { id: 'PANEL', name: 'David Chen', title: 'Senior PM', style: 'Friendly but challenges every claim', color: '#F59E0B', icon: Shield },
];

const rounds = [
  { id: 'BEHAVIORAL', label: 'Behavioral' },
  { id: 'HR', label: 'HR' },
  { id: 'TECHNICAL', label: 'Technical' },
  { id: 'CASE_STUDY', label: 'Case Study' },
  { id: 'MANAGERIAL', label: 'Managerial' },
  { id: 'FINAL', label: 'Final' },
];

const experienceLevels = ['fresher', 'junior', 'mid', 'senior', 'lead', 'manager'];
const popularCompanies = ['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Netflix', 'Stripe', 'McKinsey'];

export default function InterviewSetup() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('mid');
  const [persona, setPersona] = useState('RECRUITER');
  const [round, setRound] = useState('BEHAVIORAL');
  const [mode, setMode] = useState('TEXT');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSession, setQuestion, reset } = useInterviewStore();
  const user = useAuthStore((s) => s.user);

  const handleStart = async () => {
    if (!company.trim()) { toast.error('Please enter a company name'); return; }
    if (!role.trim()) { toast.error('Please enter a role'); return; }
    setLoading(true);
    reset();
    try {
      const res = await interviewAPI.start({
        company: company.trim(),
        role: role.trim(),
        experience_level: experience,
        persona,
        round,
        mode,
      });
      setSession(res.data.session);
      setQuestion(res.data.question, res.data.question_number);
      navigate(`/dashboard/interview/session/${res.data.session.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Company & Role */}
          <div className="glass-card p-6">
            <h3 className="font-display text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Target</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Company</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Google, Amazon, Stripe..."
                  className="h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  data-testid="interview-setup-company-input" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {popularCompanies.map(c => (
                    <button key={c} onClick={() => setCompany(c)} className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: company === c ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: company === c ? 'var(--primary-indigo)' : 'var(--text-muted)', border: `1px solid ${company === c ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}` }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Role</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Software Engineer, Product Manager..."
                  className="h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  data-testid="interview-setup-role-input" />
              </div>
              <div>
                <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Experience Level</Label>
                <div className="flex flex-wrap gap-2">
                  {experienceLevels.map(l => (
                    <button key={l} onClick={() => setExperience(l)} className="text-xs px-3 py-1.5 rounded-lg capitalize font-medium" style={{ backgroundColor: experience === l ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: experience === l ? 'var(--primary-indigo)' : 'var(--text-muted)', border: `1px solid ${experience === l ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}` }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Round */}
          <div className="glass-card p-6">
            <h3 className="font-display text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Interview Round</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {rounds.map(r => (
                <button key={r.id} onClick={() => setRound(r.id)} className="text-xs py-2 px-2 rounded-xl font-medium text-center" style={{ backgroundColor: round === r.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: round === r.id ? 'var(--primary-indigo)' : 'var(--text-secondary)', border: `1px solid ${round === r.id ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}` }}
                  data-testid={`interview-setup-round-${r.id.toLowerCase()}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Persona */}
          <div className="glass-card p-6">
            <h3 className="font-display text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Choose Interviewer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {personas.map(p => (
                <button key={p.id} onClick={() => setPersona(p.id)}
                  className="p-4 rounded-xl text-left" style={{ backgroundColor: persona === p.id ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${persona === p.id ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}` }}
                  data-testid={`interview-setup-persona-${p.id.toLowerCase()}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${p.color}15`, color: p.color }}>
                      <p.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.title}</p>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.style}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="glass-card p-6">
            <h3 className="font-display text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Interview Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setMode('TEXT')} className="p-4 rounded-xl text-center" style={{ backgroundColor: mode === 'TEXT' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${mode === 'TEXT' ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}` }}>
                <Keyboard className="w-6 h-6 mx-auto mb-2" style={{ color: mode === 'TEXT' ? 'var(--primary-indigo)' : 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Text</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Type your answers</p>
              </button>
              <button onClick={() => { if ((user?.plan || 'FREE') === 'FREE') { toast.error('Voice mode requires Pro plan'); } else { setMode('VOICE'); } }}
                className="p-4 rounded-xl text-center relative" style={{ backgroundColor: mode === 'VOICE' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${mode === 'VOICE' ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}` }}>
                <Mic className="w-6 h-6 mx-auto mb-2" style={{ color: mode === 'VOICE' ? 'var(--primary-indigo)' : 'var(--text-muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Voice</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Speak naturally</p>
                {(user?.plan || 'FREE') === 'FREE' && (
                  <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: 'var(--primary-indigo)' }}>PRO</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 lg:sticky lg:top-6">
            <h3 className="font-display text-base font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Your Interview</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{company || 'Select a company'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4" style={{ color: 'var(--primary-indigo)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{role || 'Select a role'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" style={{ color: personas.find(p => p.id === persona)?.color || 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{personas.find(p => p.id === persona)?.name}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>{round.replace('_', ' ')}</span>
                <span className="text-xs px-2 py-1 rounded-lg capitalize" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{experience}</span>
                <span className="text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{mode}</span>
              </div>
              <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Estimated</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>~8 questions • 25 minutes</p>
              </div>
            </div>
            <Button onClick={handleStart} disabled={loading || !company.trim() || !role.trim()} className="w-full mt-6 h-11 rounded-xl font-semibold btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="interview-setup-start-button">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Starting...</span>
              ) : (
                <span className="flex items-center gap-2">Start Interview <ArrowRight className="w-4 h-4" /></span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
