import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Loader2, ChevronDown, ChevronUp, Zap, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { companyAPI } from '../lib/api';
import { toast } from 'sonner';

const roundTabs = ['HR', 'BEHAVIORAL', 'TECHNICAL', 'CASE_STUDY', 'MANAGERIAL', 'FINAL'];
const roundLabels = { HR: 'HR', BEHAVIORAL: 'Behavioral', TECHNICAL: 'Technical', CASE_STUDY: 'Case Study', MANAGERIAL: 'Managerial', FINAL: 'Final' };

export default function CompanyPrep() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('mid');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  const handleGenerate = async () => {
    if (!company.trim()) { toast.error('Please enter a company name'); return; }
    setLoading(true);
    try {
      const res = await companyAPI.generate({ company_name: company, role: role || 'Software Engineer', experience_level: experience });
      setResult(res.data.prep);
      setFromCache(res.data.from_cache);
      toast.success(res.data.from_cache ? 'Loaded from cache' : 'Questions generated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Company Interview Prep</h1>
        <p className="text-[var(--text-secondary)]">Predict the exact questions a company will ask for your role</p>
      </div>

      {/* Search Section */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Company</label>
            <Input data-testid="company-prep-search-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., Google, Amazon" className="bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Role</label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer" className="bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Experience</label>
            <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full h-11 rounded-xl px-3 bg-white/[0.04] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm">
              <option value="fresher">Fresher</option>
              <option value="junior">1-3 years</option>
              <option value="mid">3-7 years</option>
              <option value="senior">7+ years</option>
            </select>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto h-11 bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl font-semibold btn-glow" data-testid="company-prep-generate-button">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          Generate Interview Questions
        </Button>
      </div>

      {result && (
        <>
          {/* Company Insights */}
          {result.insights && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] capitalize mb-1">{result.company_name}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">{result.insights.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                    result.insights.interviewDifficulty === 'Very Hard' || result.insights.interviewDifficulty === 'Hard' 
                      ? 'bg-[rgba(255,77,106,0.12)] text-[var(--red)]' 
                      : 'bg-[rgba(245,166,35,0.12)] text-[var(--amber)]'
                  }`}>
                    {result.insights.interviewDifficulty}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {result.insights.cultureValues?.map((v, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(79,142,247,0.1)] text-[var(--blue)]">{v}</span>
                ))}
                {result.insights.interviewStyle?.map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.06] text-[var(--text-secondary)]">{s}</span>
                ))}
              </div>
              {fromCache && <p className="text-xs text-[var(--text-muted)] mt-3"><Zap className="w-3 h-3 inline mr-1" />Loaded from cache</p>}
            </motion.div>
          )}

          {/* Questions by Round */}
          <div className="glass-card overflow-hidden">
            <Tabs defaultValue="HR">
              <div className="border-b overflow-x-auto" style={{ borderColor: 'var(--border-subtle)' }}>
                <TabsList className="bg-transparent p-0 h-auto">
                  {roundTabs.map(r => {
                    const qs = result.questions?.[r] || [];
                    return (
                      <TabsTrigger key={r} value={r} className="rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--blue)] data-[state=active]:text-[var(--text-primary)] text-[var(--text-secondary)] px-4 py-3 text-sm">
                        {roundLabels[r]} <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06]">{qs.length}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              {roundTabs.map(r => (
                <TabsContent key={r} value={r} className="mt-0">
                  {(result.questions?.[r] || []).length > 0 ? (
                    <div>
                      {result.questions[r].map((q, i) => (
                        <div key={i} className="border-b last:border-b-0" style={{ borderColor: 'var(--border-subtle)' }}>
                          <button onClick={() => setExpandedQ(expandedQ === `${r}-${i}` ? null : `${r}-${i}`)} className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/[0.02]">
                            <span className="font-mono text-xs text-[var(--text-muted)] w-6">{i + 1}</span>
                            <span className="flex-1 text-sm text-[var(--text-primary)]">{q.question}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                              q.difficulty === 'hard' ? 'bg-[rgba(255,77,106,0.12)] text-[var(--red)]' :
                              q.difficulty === 'medium' ? 'bg-[rgba(245,166,35,0.12)] text-[var(--amber)]' :
                              'bg-[rgba(0,214,143,0.12)] text-[var(--green)]'
                            }`}>{q.difficulty}</span>
                            {expandedQ === `${r}-${i}` ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                          </button>
                          {expandedQ === `${r}-${i}` && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 pl-10 space-y-3">
                              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase">Why This Is Asked</p>
                                <p className="text-sm text-[var(--text-secondary)]">{q.whyAsked}</p>
                              </div>
                              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                <p className="text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase">What It Tests</p>
                                <p className="text-sm text-[var(--text-secondary)]">{q.whatItTests}</p>
                              </div>
                              {q.howToAnswer && (
                                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(79,142,247,0.06)' }}>
                                  <p className="text-xs font-semibold text-[var(--blue)] mb-1 uppercase">How to Answer Well</p>
                                  <ul className="space-y-1">
                                    {q.howToAnswer.map((tip, j) => (
                                      <li key={j} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                        <span className="text-[var(--blue)]">•</span> {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[var(--text-muted)] text-sm">No questions for this round</div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Talking Points */}
          {result.talking_points && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-[var(--green)] mb-3">Do Mention</h3>
                <ul className="space-y-2">
                  {(result.talking_points.doMention || []).map((p, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2"><span className="text-[var(--green)]">+</span> {p}</li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-[var(--amber)] mb-3">Be Ready For</h3>
                <ul className="space-y-2">
                  {(result.talking_points.beReadyFor || []).map((p, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2"><span className="text-[var(--amber)]">•</span> {p}</li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-[var(--red)] mb-3">Avoid Saying</h3>
                <ul className="space-y-2">
                  {(result.talking_points.avoidSaying || []).map((p, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2"><span className="text-[var(--red)]">-</span> {p}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
