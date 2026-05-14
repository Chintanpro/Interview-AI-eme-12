import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { resumeAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { toast } from 'sonner';
import ScoreRing from '../components/ScoreRing';

export default function ResumeAnalysis() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    resumeAPI.history().then(res => setHistory(res.data.resumes || [])).catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5MB.'); return; }
      setFile(f);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) { toast.error('Please enter a job description'); return; }
    if (!file && !resumeText.trim()) { toast.error('Please upload a resume or paste text'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('job_description', jobDescription);
      if (file) formData.append('file', file);
      if (resumeText) formData.append('resume_text', resumeText);
      const res = await resumeAPI.analyze(formData);
      setAnalysis(res.data.analysis);
      toast.success('Resume analyzed successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Resume Intelligence</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Match your resume against job descriptions and get personalized insights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-display text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Upload Resume</h3>
            <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer" style={{ borderColor: file ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)', backgroundColor: file ? 'rgba(16,185,129,0.04)' : 'transparent' }}
              onClick={() => document.getElementById('resume-upload')?.click()}>
              <input id="resume-upload" type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileChange} data-testid="resume-file-input" />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" style={{ color: 'var(--success)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{file.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }}><X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} /></button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Drop your PDF here or click to browse</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>PDF only • Max 5MB</p>
                </>
              )}
            </div>
            <div className="mt-3">
              <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Or paste resume text</Label>
              <Textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume content here..." rows={4}
                className="rounded-xl text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} data-testid="resume-text-input" />
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="font-display text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Job Description</h3>
            <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." rows={6}
              className="rounded-xl text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} data-testid="resume-jd-input" />
          </div>
          <Button onClick={handleAnalyze} disabled={loading} className="w-full h-11 rounded-xl font-semibold btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="resume-analyze-button">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing (~15s)...</> : 'Analyze Resume'}
          </Button>
        </div>

        {/* Right: Results */}
        <div>
          {!analysis ? (
            <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[400px]">
              <FileText className="w-12 h-12 mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your analysis will appear here</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Match Score */}
              {analysis.matchScore && (
                <div className="glass-card p-6 flex items-center gap-6">
                  <ScoreRing score={analysis.matchScore} size={80} label="Match" />
                  <div>
                    <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>JD Match Score</h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{analysis.summary}</p>
                  </div>
                </div>
              )}

              {/* Skills */}
              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Skills Analysis</h3>
                <div className="space-y-3">
                  {analysis.matchedSkills?.length > 0 && (
                    <div>
                      <span className="text-xs" style={{ color: 'var(--success)' }}>Matched Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">{analysis.matchedSkills.map((s, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-lg" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>{s}</span>
                      ))}</div>
                    </div>
                  )}
                  {analysis.missingSkills?.length > 0 && (
                    <div>
                      <span className="text-xs" style={{ color: 'var(--danger)' }}>Missing Skills</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">{analysis.missingSkills.map((s, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>{s}</span>
                      ))}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Red Flags */}
              {analysis.redFlags?.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--warning)' }}>Potential Concerns</h3>
                  <div className="space-y-2">
                    {analysis.redFlags.map((rf, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--warning)' }} />
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{rf.flag || rf}</p>
                          {rf.howToAddress && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{rf.howToAddress}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {analysis.keywordsToMention?.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--accent-cyan)' }}>Keywords to Mention</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.keywordsToMention.map((k, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-lg" style={{ backgroundColor: 'rgba(34,211,238,0.08)', color: 'var(--accent-cyan)' }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
