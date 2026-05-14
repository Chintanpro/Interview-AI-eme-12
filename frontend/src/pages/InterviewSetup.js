import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Briefcase, Users, ChevronRight, ChevronLeft,
  MessageSquare, Mic2, Zap, UserCircle, Shield, Code, Users2, ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { interviewAPI } from '../lib/api';
import { useInterviewStore, useAuthStore } from '../lib/store';
import { toast } from 'sonner';

const personas = [
  { id: 'RECRUITER', name: 'Alex', title: 'Senior Recruiter', icon: UserCircle, color: 'var(--green)', desc: 'Warm & professional. Culture fit, motivation, communication.' },
  { id: 'MANAGER', name: 'Rachel', title: 'Hiring Manager', icon: Shield, color: 'var(--red)', desc: 'Demanding. Metrics, failures, accountability, decisions.' },
  { id: 'TECHNICAL', name: 'Dev', title: 'Staff Engineer', icon: Code, color: 'var(--blue)', desc: 'Precise & analytical. Deep tech knowledge, trade-offs.' },
  { id: 'PANEL', name: 'Panel', title: '5 Interviewers', icon: Users2, color: 'var(--purple)', desc: 'Multiple interviewers rotating questions. Premium only.', premium: true },
];

const rounds = [
  { id: 'HR', label: 'HR' }, { id: 'BEHAVIORAL', label: 'Behavioral' },
  { id: 'TECHNICAL', label: 'Technical' }, { id: 'CASE_STUDY', label: 'Case Study' },
  { id: 'MANAGERIAL', label: 'Managerial' }, { id: 'FINAL', label: 'Final' },
];

const modes = [
  { id: 'TEXT', label: 'Text Interview', icon: MessageSquare, desc: 'Type your answers in a chat-like interface.', color: 'var(--blue)' },
  { id: 'RAPID_FIRE', label: 'Rapid Fire', icon: Zap, desc: '60-second timer per answer. Quick thinking practice.', color: 'var(--amber)', pro: true },
];

const experienceLevels = [
  { id: 'fresher', label: 'Fresher (0-1 yr)' },
  { id: 'junior', label: 'Junior (1-3 yrs)' },
  { id: 'mid', label: 'Mid-level (3-7 yrs)' },
  { id: 'senior', label: 'Senior (7+ yrs)' },
];

export default function InterviewSetup() {
  const [searchParams] = useSearchParams();
  const presetMode = searchParams.get('mode');
  
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('mid');
  const [round, setRound] = useState('BEHAVIORAL');
  const [persona, setPersona] = useState('RECRUITER');
  const [mode, setMode] = useState(presetMode === 'rapid_fire' ? 'RAPID_FIRE' : 'TEXT');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { setSession, setQuestion, reset } = useInterviewStore();

  const startInterview = async () => {
    setLoading(true);
    reset();
    try {
      const res = await interviewAPI.start({
        company: company || 'General',
        role: role || 'Software Engineer',
        experience_level: experience,
        mode,
        persona,
        round,
      });
      setSession(res.data.session);
      setQuestion(res.data.question, res.data.question_number);
      navigate(`/dashboard/interview/session/${res.data.session.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Start Mock Interview</h1>
      <p className="text-[var(--text-secondary)] mb-8">Set up your practice session in 3 easy steps</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step >= s ? 'bg-[var(--blue)] text-white' : 'bg-white/[0.06] text-[var(--text-muted)]'
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 rounded-full ${step > s ? 'bg-[var(--blue)]' : 'bg-white/[0.06]'}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Company & Role */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--blue)]" /> Company & Role
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Company Name</label>
                  <Input
                    data-testid="interview-setup-company-input"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google, Amazon, Microsoft"
                    className="bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] h-12 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Job Role</label>
                  <Input
                    data-testid="interview-setup-role-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Software Engineer, Product Manager"
                    className="bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] h-12 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Experience Level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {experienceLevels.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setExperience(l.id)}
                        className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                          experience === l.id
                            ? 'bg-[var(--blue)]/20 text-[var(--blue)] border border-[var(--blue)]/30'
                            : 'bg-white/[0.04] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-white/[0.06]'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Interview Round</label>
                  <div className="flex flex-wrap gap-2">
                    {rounds.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setRound(r.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          round === r.id
                            ? 'bg-[var(--blue)]/20 text-[var(--blue)] border border-[var(--blue)]/30'
                            : 'bg-white/[0.04] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-white/[0.06]'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={() => setStep(2)} className="w-full h-12 bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl font-semibold" data-testid="interview-setup-step-next-button">
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Mode */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[var(--blue)]" /> Interview Mode
              </h2>
              <div className="space-y-3">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 text-left transition-colors ${
                      mode === m.id
                        ? 'bg-[var(--blue)]/10 border border-[var(--blue)]/30'
                        : 'bg-white/[0.04] border border-[var(--border-subtle)] hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${m.color}15` }}>
                      <m.icon className="w-5 h-5" style={{ color: m.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</p>
                      <p className="text-xs text-[var(--text-muted)]">{m.desc}</p>
                    </div>
                    {m.pro && <span className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(245,166,35,0.12)] text-[var(--amber)]">Pro</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1 h-12 rounded-xl border-white/10 text-[var(--text-primary)]">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 h-12 bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl font-semibold">
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Persona */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--blue)]" /> Choose Interviewer
              </h2>
              <div className="space-y-3">
                {personas.map((p) => {
                  const isPremiumLocked = p.premium && user?.plan !== 'PREMIUM';
                  return (
                    <button
                      key={p.id}
                      onClick={() => !isPremiumLocked && setPersona(p.id)}
                      disabled={isPremiumLocked}
                      className={`w-full p-4 rounded-xl flex items-center gap-4 text-left transition-colors ${
                        isPremiumLocked ? 'opacity-50 cursor-not-allowed' :
                        persona === p.id
                          ? 'bg-[var(--blue)]/10 border border-[var(--blue)]/30'
                          : 'bg-white/[0.04] border border-[var(--border-subtle)] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: `${p.color}20`, color: p.color }}>
                        {p.name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{p.name} — {p.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">{p.desc}</p>
                      </div>
                      {isPremiumLocked && <span className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(155,107,242,0.12)] text-[var(--purple)]">Premium</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Session Summary</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-[var(--text-muted)]">Company:</span>
                <span className="text-[var(--text-primary)]">{company || 'General'}</span>
                <span className="text-[var(--text-muted)]">Role:</span>
                <span className="text-[var(--text-primary)]">{role || 'Software Engineer'}</span>
                <span className="text-[var(--text-muted)]">Round:</span>
                <span className="text-[var(--text-primary)]">{rounds.find(r => r.id === round)?.label}</span>
                <span className="text-[var(--text-muted)]">Mode:</span>
                <span className="text-[var(--text-primary)]">{modes.find(m => m.id === mode)?.label}</span>
                <span className="text-[var(--text-muted)]">Interviewer:</span>
                <span className="text-[var(--text-primary)]">{personas.find(p => p.id === persona)?.name}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(2)} variant="outline" className="flex-1 h-12 rounded-xl border-white/10 text-[var(--text-primary)]">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button
                onClick={startInterview}
                disabled={loading}
                className="flex-1 h-12 bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl font-semibold btn-glow"
                data-testid="interview-setup-begin-button"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">Begin Interview <ArrowRight className="w-4 h-4" /></span>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
