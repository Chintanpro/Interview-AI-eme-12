import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Upload, FileText, Loader2, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { resumeAPI } from '../lib/api';
import { toast } from 'sonner';
import ScoreRing from '../components/ScoreRing';

export default function ResumeAnalysis() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [useText, setUseText] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.txt'))) {
      setFile(f);
    } else {
      toast.error('Please upload a PDF or text file');
    }
  }, []);

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) { toast.error('Please enter a job description'); return; }
    if (!file && !resumeText.trim()) { toast.error('Please upload a resume or paste text'); return; }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('job_description', jobDescription);
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('resume_text', resumeText);
      }
      
      const res = await resumeAPI.analyze(formData);
      setAnalysis(res.data.analysis);
      toast.success('Resume analyzed successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Resume Analysis</h1>
        <p className="text-[var(--text-secondary)]">Match your resume against a job description and identify gaps</p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Resume */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Resume</h2>
          {!useText ? (
            <div
              data-testid="resume-upload-dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-[var(--blue)] bg-[rgba(79,142,247,0.06)]' :
                file ? 'border-[var(--green)]/30 bg-[rgba(0,214,143,0.04)]' :
                'border-[var(--border-subtle)] hover:border-white/20'
              }`}
              onClick={() => document.getElementById('resume-file').click()}
            >
              <input id="resume-file" type="file" accept=".pdf,.txt" className="hidden" onChange={handleFileSelect} />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-[var(--green)]" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Check className="w-5 h-5 text-[var(--green)]" />
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Drop your resume here or click to browse</p>
                  <p className="text-xs text-[var(--text-muted)]">PDF or TXT, max 5MB</p>
                </>
              )}
            </div>
          ) : (
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="min-h-[200px] bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] rounded-xl"
            />
          )}
          <button onClick={() => { setUseText(!useText); setFile(null); setResumeText(''); }} className="text-xs text-[var(--blue)] hover:underline mt-3">
            {useText ? 'Upload a file instead' : 'Paste text instead'}
          </button>
        </div>

        {/* Right - Job Description */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">Job Description</h2>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-[200px] bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] rounded-xl"
            data-testid="resume-jd-textarea"
          />
          <p className="text-xs text-[var(--text-muted)] text-right mt-2">{jobDescription.length} characters</p>
        </div>
      </div>

      <Button onClick={handleAnalyze} disabled={loading || (!file && !resumeText.trim()) || !jobDescription.trim()} className="w-full md:w-auto h-12 bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl font-semibold btn-glow" data-testid="resume-analyze-button">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileSearch className="w-4 h-4 mr-2" />}
        Analyze Resume & JD
      </Button>

      {/* Results */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Match Score */}
          <div className="glass-card p-6 flex items-center gap-6">
            <ScoreRing score={analysis.matchScore || 0} size={100} strokeWidth={7} />
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Resume Match Score</h2>
              <p className="text-sm text-[var(--text-secondary)]">{analysis.summary}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--green)] mb-3 flex items-center gap-2"><Check className="w-4 h-4" /> Matched Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {(analysis.matchedSkills || []).map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-lg bg-[rgba(0,214,143,0.1)] text-[var(--green)]">{s}</span>
                ))}
              </div>
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--red)] mb-3 flex items-center gap-2"><X className="w-4 h-4" /> Missing Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {(analysis.missingSkills || []).map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-lg bg-[rgba(255,77,106,0.1)] text-[var(--red)]">{s}</span>
                ))}
              </div>
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--blue)] mb-3">Extra Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {(analysis.extraSkills || []).map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-lg bg-[rgba(79,142,247,0.1)] text-[var(--blue)]">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Red Flags */}
          {analysis.redFlags?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--amber)] mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Red Flags</h3>
              <div className="space-y-3">
                {analysis.redFlags.map((rf, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        rf.severity === 'High' ? 'bg-[rgba(255,77,106,0.12)] text-[var(--red)]' :
                        rf.severity === 'Medium' ? 'bg-[rgba(245,166,35,0.12)] text-[var(--amber)]' :
                        'bg-white/[0.06] text-[var(--text-muted)]'
                      }`}>{rf.severity}</span>
                      <span className="text-sm text-[var(--text-primary)]">{rf.flag}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] ml-12">{rf.howToAddress}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {analysis.keywordsToMention?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--blue)] mb-3">Keywords to Mention in Interviews</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.keywordsToMention.map((k, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-[rgba(79,142,247,0.1)] text-[var(--blue)] border border-[rgba(79,142,247,0.2)]">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tailored Questions */}
          {analysis.tailoredQuestions?.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">Tailored Interview Questions</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Questions likely to arise from your resume + JD overlap</p>
              </div>
              <div>
                {analysis.tailoredQuestions.map((q, i) => (
                  <div key={i} className="p-4 border-b last:border-b-0 flex items-start gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
                    <span className="font-mono text-xs text-[var(--text-muted)] w-6 mt-0.5">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm text-[var(--text-primary)]">{q.question}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Based on: {q.basedOn}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        q.priority === 'High' ? 'bg-[rgba(255,77,106,0.12)] text-[var(--red)]' : 'bg-white/[0.06] text-[var(--text-muted)]'
                      }`}>{q.priority}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-[var(--text-muted)]">{q.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
