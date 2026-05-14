import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Sparkles, ChevronDown, ChevronUp, Lightbulb, CheckCircle, AlertTriangle, Loader2, XCircle, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { companyAPI } from '../lib/api';
import { toast } from 'sonner';

const experienceLevels = ['fresher', 'junior', 'mid', 'senior', 'lead', 'manager'];
const popularCompanies = ['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Netflix', 'Stripe', 'McKinsey', 'Goldman Sachs'];

const STEPS = [
  'Analyzing company culture & interview style...',
  'Generating HR & behavioral questions...',
  'Predicting technical & case study questions...',
  'Building talking points & tips...',
  'Finalizing predictions...',
];

export default function CompanyPrep() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [experience, setExperience] = useState('mid');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [warning, setWarning] = useState(null);
  const [activeTab, setActiveTab] = useState('BEHAVIORAL');
  const [expandedQ, setExpandedQ] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [progressStep, setProgressStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const timerRef = useRef(null);
  const stepTimerRef = useRef(null);
  const abortRef = useRef(null);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  const startTimers = () => {
    setElapsed(0);
    setProgressStep(0);
    timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    stepTimerRef.current = setInterval(() => {
      setProgressStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 6000);
  };

  const stopTimers = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (stepTimerRef.current) { clearInterval(stepTimerRef.current); stepTimerRef.current = null; }
  };

  const handleGenerate = async () => {
    if (!company.trim()) { toast.error('Please enter a company name'); return; }
    setLoading(true);
    setErrorMsg(null);
    setWarning(null);
    setResult(null);
    startTimers();

    // Create abort controller
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await companyAPI.generate(
        { company_name: company.trim(), role: role.trim(), experience_level: experience },
        { signal: controller.signal }
      );
      setResult(res.data.prep);
      if (res.data.warning) setWarning(res.data.warning);
      const cats = Object.keys(res.data.prep?.questions || {});
      if (cats.length > 0) setActiveTab(cats[0]);
      if (res.data.from_cache) {
        toast.info('Showing cached predictions (less than 24h old)');
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        toast.info('Generation cancelled');
      } else {
        const detail = err.response?.data?.detail || 'Failed to generate predictions. Please try again.';
        setErrorMsg(detail);
        toast.error(detail);
      }
    } finally {
      setLoading(false);
      stopTimers();
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setLoading(false);
    stopTimers();
  };

  const insights = result?.insights || {};
  const questions = result?.questions || {};
  const tips = result?.talking_points || {};

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Predict Your Interview Questions</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>See exactly what companies ask for your role — before you walk in the door.</p>
      </div>

      {/* Input */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Google"
              className="h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              disabled={loading} data-testid="company-prep-input" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {popularCompanies.slice(0, 5).map(c => (
                <button key={c} onClick={() => !loading && setCompany(c)} disabled={loading}
                  className="text-[11px] px-2 py-0.5 rounded-md transition-colors"
                  style={{ backgroundColor: company === c ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: company === c ? 'var(--primary-indigo)' : 'var(--text-muted)' }}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer"
              className="h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              disabled={loading} />
          </div>
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Experience</Label>
            <div className="flex flex-wrap gap-1.5">
              {experienceLevels.map(l => (
                <button key={l} onClick={() => !loading && setExperience(l)} disabled={loading}
                  className="text-[11px] px-2.5 py-1 rounded-lg capitalize"
                  style={{ backgroundColor: experience === l ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: experience === l ? 'var(--primary-indigo)' : 'var(--text-muted)', border: `1px solid ${experience === l ? 'rgba(99,102,241,0.3)' : 'transparent'}` }}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate / Cancel buttons */}
        <div className="flex items-center gap-3 mt-4">
          {loading ? (
            <>
              <Button disabled className="h-11 rounded-xl font-semibold text-white" style={{ backgroundColor: 'var(--primary-indigo)', opacity: 0.9 }}>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...
              </Button>
              <Button variant="outline" onClick={handleCancel} className="h-11 rounded-xl" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }} data-testid="company-prep-cancel-button">
                <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleGenerate} disabled={!company.trim()} className="h-11 rounded-xl font-semibold btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="company-prep-generate-button">
              <Sparkles className="w-4 h-4 mr-2" />Generate Predictions
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.12)' }}>
                {/* Progress bar */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--primary-indigo)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--primary-indigo)' }}>AI is analyzing {company}</span>
                  </div>
                  <span className="font-mono text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock className="w-3 h-3" /> {elapsed}s
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    animate={{ width: `${Math.min(15 + progressStep * 18, 92)}%` }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--primary-indigo), var(--accent-cyan))' }}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{STEPS[progressStep]}</p>
                <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>This typically takes 15-40 seconds. Complex companies may take longer.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error state with retry */}
      {errorMsg && !loading && !result && (
        <div className="glass-card p-6 text-center" style={{ borderLeft: '3px solid var(--danger)' }}>
          <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--danger)' }} />
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Generation Failed</h3>
          <p className="text-xs mb-4 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>{errorMsg}</p>
          <Button onClick={handleGenerate} className="rounded-xl text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="company-prep-retry-button">
            <RotateCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      )}

      {/* Warning banner */}
      {warning && (
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--warning)' }} />
          <span className="text-xs" style={{ color: 'var(--warning)' }}>{warning}</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Company Insights */}
          {insights.description && (
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4" style={{ color: 'var(--accent-cyan)' }} />
                <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>{company}</h3>
                {insights.interviewDifficulty && (
                  <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{
                    backgroundColor: insights.interviewDifficulty === 'Hard' || insights.interviewDifficulty === 'Very Hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    color: insights.interviewDifficulty === 'Hard' || insights.interviewDifficulty === 'Very Hard' ? 'var(--danger)' : 'var(--warning)'
                  }}>{insights.interviewDifficulty}</span>
                )}
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{insights.description}</p>
              {insights.cultureValues && (
                <div className="flex flex-wrap gap-2">
                  {insights.cultureValues.map((v, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--primary-indigo)' }}>{v}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Talking Points */}
          {tips && (tips.doMention || tips.beReadyFor || tips.avoidSaying) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tips.doMention && tips.doMention.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-3"><CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>Do Mention</span></div>
                  <ul className="space-y-2">{tips.doMention.map((t, i) => <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>• {t}</li>)}</ul>
                </div>
              )}
              {tips.beReadyFor && tips.beReadyFor.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4" style={{ color: 'var(--warning)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>Be Ready For</span></div>
                  <ul className="space-y-2">{tips.beReadyFor.map((t, i) => <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>• {t}</li>)}</ul>
                </div>
              )}
              {tips.avoidSaying && tips.avoidSaying.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4" style={{ color: 'var(--danger)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Avoid Saying</span></div>
                  <ul className="space-y-2">{tips.avoidSaying.map((t, i) => <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>• {t}</li>)}</ul>
                </div>
              )}
            </div>
          )}

          {/* Question Tabs */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Predicted Questions</h3>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {Object.values(questions).reduce((acc, qs) => acc + (Array.isArray(qs) ? qs.length : 0), 0)} total
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {Object.keys(questions).map(cat => {
                const qs = questions[cat] || [];
                return (
                  <button key={cat} onClick={() => { setActiveTab(cat); setExpandedQ(null); }}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium transition-colors"
                    style={{ backgroundColor: activeTab === cat ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: activeTab === cat ? 'var(--primary-indigo)' : 'var(--text-muted)', border: `1px solid ${activeTab === cat ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}` }}>
                    {cat.replace('_', ' ')} ({Array.isArray(qs) ? qs.length : 0})
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">
              {(questions[activeTab] || []).map((q, i) => (
                <div key={i} className="rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <button onClick={() => setExpandedQ(expandedQ === i ? null : i)} className="w-full flex items-start gap-3 p-4 text-left">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md flex-shrink-0 mt-0.5" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>{i + 1}</span>
                    <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{q.question || q}</span>
                    {q.difficulty && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{
                        backgroundColor: q.difficulty === 'hard' ? 'rgba(239,68,68,0.1)' : q.difficulty === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        color: q.difficulty === 'hard' ? 'var(--danger)' : q.difficulty === 'medium' ? 'var(--warning)' : 'var(--success)'
                      }}>{q.difficulty}</span>
                    )}
                    {expandedQ === i ? <ChevronUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  <AnimatePresence>
                    {expandedQ === i && q.whyAsked && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4">
                        <div className="p-3 rounded-xl space-y-2" style={{ backgroundColor: 'rgba(99,102,241,0.04)' }}>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}><strong>Why asked:</strong> {q.whyAsked}</p>
                          {q.whatItTests && <p className="text-xs" style={{ color: 'var(--text-muted)' }}><strong>Tests:</strong> {q.whatItTests}</p>}
                          {q.howToAnswer && q.howToAnswer.length > 0 && (
                            <div>
                              <p className="text-xs font-medium mb-1" style={{ color: 'var(--primary-indigo)' }}>How to answer:</p>
                              <ul className="space-y-1">{q.howToAnswer.map((tip, j) => <li key={j} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {tip}</li>)}</ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Regenerate */}
          <div className="text-center">
            <Button variant="outline" onClick={handleGenerate} className="rounded-xl text-sm" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }} data-testid="company-prep-regenerate-button">
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Regenerate Predictions
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
