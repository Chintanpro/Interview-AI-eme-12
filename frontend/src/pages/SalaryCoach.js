import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Send, Loader2, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { salaryAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { toast } from 'sonner';

export default function SalaryCoach() {
  const user = useAuthStore((s) => s.user);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('US');
  const [experience, setExperience] = useState(3);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupDone, setSetupDone] = useState(false);

  if ((user?.plan || 'FREE') !== 'PREMIUM') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="glass-card p-8 text-center max-w-md">
          <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="font-display text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Premium Feature</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Salary Negotiation Coach requires a Premium plan.</p>
          <Button className="rounded-xl btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} onClick={() => toast.info('Upgrade flow coming soon')} data-testid="upgrade-to-premium">
            Upgrade to Premium
          </Button>
        </div>
      </div>
    );
  }

  const handleStart = async () => {
    if (!role.trim() || !company.trim()) { toast.error('Please fill in role and company'); return; }
    setLoading(true);
    try {
      const res = await salaryAPI.start({ role: role.trim(), company: company.trim(), location, experience_years: experience });
      setSessionId(res.data.session_id);
      setMessages([{ role: 'hr', text: res.data.message }]);
      setSetupDone(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'candidate', text: msg }]);
    setLoading(true);
    try {
      const res = await salaryAPI.message(sessionId, { message: msg });
      setMessages(prev => [...prev, { role: 'hr', text: res.data.message }]);
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!setupDone) {
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Salary Negotiation Coach</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Practice negotiating your offer with a realistic AI recruiter.</p>
        </div>
        <div className="glass-card p-6 space-y-4">
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer" className="h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} data-testid="salary-role-input" />
          </div>
          <div>
            <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google" className="h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} data-testid="salary-company-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Years Experience</Label>
              <Input type="number" value={experience} onChange={(e) => setExperience(parseInt(e.target.value) || 0)} className="h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <Button onClick={handleStart} disabled={loading} className="w-full h-11 rounded-xl font-semibold btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="salary-start-button">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting...</> : <><DollarSign className="w-4 h-4 mr-2" />Start Negotiation</>}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Negotiating: {role} at {company}</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[80%] p-4 rounded-2xl" style={
              msg.role === 'candidate'
                ? { background: 'linear-gradient(135deg, var(--primary-indigo), #8B5CF6)', color: 'white', borderBottomRightRadius: '6px' }
                : { backgroundColor: 'var(--bg-surface)', borderLeft: '3px solid var(--warning)', color: 'var(--text-primary)', borderBottomLeftRadius: '6px' }
            }>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {loading && <div className="flex gap-1 p-3"><div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)' }} /><div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '0.15s' }} /><div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-muted)', animationDelay: '0.3s' }} /></div>}
      </div>
      <div className="flex gap-3">
        <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSend(); }} placeholder="Your negotiation response..." className="min-h-[50px] max-h-[100px] rounded-xl resize-none" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} data-testid="salary-message-input" />
        <Button onClick={handleSend} disabled={!input.trim() || loading} className="h-11 w-11 rounded-xl p-0 flex-shrink-0 text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="salary-send-button">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </motion.div>
  );
}
