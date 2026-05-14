import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Sparkles, ChevronDown, ChevronUp, Lightbulb, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { companyAPI } from '../lib/api';
import { toast } from 'sonner';

const categories = ['HR', 'BEHAVIORAL', 'TECHNICAL', 'CASE_STUDY', 'MANAGERIAL', 'FINAL'];
const experienceLevels = ['fresher', 'junior', 'mid', 'senior', 'lead', 'manager'];
const popularCompanies = ['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Netflix', 'Stripe', 'McKinsey', 'Goldman Sachs'];

export default function CompanyPrep() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [experience, setExperience] = useState('mid');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('BEHAVIORAL');
  const [expandedQ, setExpandedQ] = useState(null);

  const handleGenerate = async () => {
    if (!company.trim()) { toast.error('Please enter a company name'); return; }
    setLoading(true);
    try {
      const res = await companyAPI.generate({ company_name: company.trim(), role: role.trim(), experience_level: experience });
      setResult(res.data.prep);
      const cats = Object.keys(res.data.prep?.questions || {});
      if (cats.length > 0) setActiveTab(cats[0]);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate predictions');
    } finally {
      setLoading(false);
    }
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
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Google" className="h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} data-testid="company-prep-input" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {popularCompanies.slice(0, 5).map(c => (
                <button key={c} onClick={() => setCompany(c)} className="text-[11px] px-2 py-0.5 rounded-md" style={{ backgroundColor: company === c ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: company === c ? 'var(--primary-indigo)' : 'var(--text-muted)' }}>{c}</button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer" className="h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Experience</Label>
            <div className="flex flex-wrap gap-1.5">
              {experienceLevels.map(l => (
                <button key={l} onClick={() => setExperience(l)} className="text-[11px] px-2.5 py-1 rounded-lg capitalize" style={{ backgroundColor: experience === l ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: experience === l ? 'var(--primary-indigo)' : 'var(--text-muted)', border: `1px solid ${experience === l ? 'rgba(99,102,241,0.3)' : 'transparent'}` }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading || !company.trim()} className="mt-4 h-11 rounded-xl font-semibold btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="company-prep-generate-button">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Predictions</>}
        </Button>
      </div>

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
                  <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: insights.interviewDifficulty === 'Hard' || insights.interviewDifficulty === 'Very Hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: insights.interviewDifficulty === 'Hard' || insights.interviewDifficulty === 'Very Hard' ? 'var(--danger)' : 'var(--warning)' }}>{insights.interviewDifficulty}</span>
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
                  <ul className="space-y-2">{tips.doMention.map((t, i) => <li key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {t}</li>)}</ul>
                </div>
              )}
              {tips.beReadyFor && tips.beReadyFor.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4" style={{ color: 'var(--warning)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>Be Ready For</span></div>
                  <ul className="space-y-2">{tips.beReadyFor.map((t, i) => <li key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {t}</li>)}</ul>
                </div>
              )}
              {tips.avoidSaying && tips.avoidSaying.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4" style={{ color: 'var(--danger)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Avoid Saying</span></div>
                  <ul className="space-y-2">{tips.avoidSaying.map((t, i) => <li key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {t}</li>)}</ul>
                </div>
              )}
            </div>
          )}

          {/* Question Tabs */}
          <div className="glass-card p-6">
            <h3 className="font-display text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Predicted Questions</h3>
            <div className="flex flex-wrap gap-2 mb-5">
              {Object.keys(questions).map(cat => {
                const qs = questions[cat] || [];
                return (
                  <button key={cat} onClick={() => { setActiveTab(cat); setExpandedQ(null); }} className="text-xs px-3 py-1.5 rounded-xl font-medium" style={{ backgroundColor: activeTab === cat ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: activeTab === cat ? 'var(--primary-indigo)' : 'var(--text-muted)', border: `1px solid ${activeTab === cat ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}` }}>
                    {cat.replace('_', ' ')} ({qs.length})
                  </button>
                );
              })}
            </div>
            <div className="space-y-3">
              {(questions[activeTab] || []).map((q, i) => (
                <div key={i} className="rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                  <button onClick={() => setExpandedQ(expandedQ === i ? null : i)} className="w-full flex items-start gap-3 p-4 text-left">
                    <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{q.question || q}</span>
                    {q.difficulty && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: q.difficulty === 'hard' ? 'rgba(239,68,68,0.1)' : q.difficulty === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: q.difficulty === 'hard' ? 'var(--danger)' : q.difficulty === 'medium' ? 'var(--warning)' : 'var(--success)' }}>{q.difficulty}</span>
                    )}
                    {expandedQ === i ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
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
        </motion.div>
      )}
    </motion.div>
  );
}
