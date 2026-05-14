import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Send, Loader2, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { salaryAPI, planAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function SalaryCoach() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [setup, setSetup] = useState({ role: '', company: '', location: 'US', experience_years: 3 });
  const [started, setStarted] = useState(false);

  const isPremium = user?.plan === 'PREMIUM';

  const handleUpgrade = async () => {
    try {
      await planAPI.upgrade({ plan: 'PREMIUM' });
      updateUser({ ...user, plan: 'PREMIUM' });
      toast.success('Upgraded to Premium!');
    } catch (err) {
      toast.error('Failed to upgrade');
    }
  };

  if (!isPremium) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="glass-card p-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(155,107,242,0.15)' }}>
            <Lock className="w-7 h-7 text-[var(--purple)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Premium Feature</h2>
          <p className="text-[var(--text-secondary)] mb-6">Salary negotiation coaching is available on the Premium plan ($39/month).</p>
          <Button onClick={handleUpgrade} className="bg-[var(--purple)] hover:bg-[#8A5CE0] text-white rounded-xl font-semibold px-8" data-testid="salary-upgrade-button">
            Upgrade to Premium <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  const handleStart = async () => {
    if (!setup.role || !setup.company) {
      toast.error('Please fill in role and company');
      return;
    }
    setLoading(true);
    try {
      const res = await salaryAPI.start(setup);
      setSessionId(res.data.session_id);
      setMessages([{ role: 'hr', text: res.data.message }]);
      setStarted(true);
    } catch (err) {
      toast.error('Failed to start negotiation');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const newMsg = { role: 'candidate', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await salaryAPI.message(sessionId, { message: input });
      setMessages(prev => [...prev, { role: 'hr', text: res.data.message }]);
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Salary Negotiation Coach</h1>
        <p className="text-[var(--text-secondary)]">Practice negotiation with an AI HR manager</p>
      </div>

      {!started ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 max-w-lg">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Setup Your Negotiation</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Role</label>
              <Input value={setup.role} onChange={(e) => setSetup({...setup, role: e.target.value})} placeholder="e.g., Senior Software Engineer" className="bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Company</label>
              <Input value={setup.company} onChange={(e) => setSetup({...setup, company: e.target.value})} placeholder="e.g., Google" className="bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Location</label>
                <Input value={setup.location} onChange={(e) => setSetup({...setup, location: e.target.value})} className="bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] h-11 rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Years of Exp</label>
                <Input type="number" value={setup.experience_years} onChange={(e) => setSetup({...setup, experience_years: parseInt(e.target.value) || 0})} className="bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] h-11 rounded-xl" />
              </div>
            </div>
            <Button onClick={handleStart} disabled={loading} className="w-full h-12 bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl font-semibold btn-glow" data-testid="salary-start-button">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Negotiation'}
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-14rem)]">
          {/* Chat Messages */}
          <div className="flex-1 glass-card overflow-y-auto p-5 space-y-4 mb-4">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'candidate'
                    ? 'bg-[var(--blue)]/20 text-[var(--text-primary)] rounded-br-md'
                    : 'bg-white/[0.06] text-[var(--text-secondary)] rounded-bl-md'
                }`}>
                  {msg.role === 'hr' && <p className="text-xs font-semibold text-[var(--amber)] mb-1">HR Manager</p>}
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.06] p-4 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="glass-card p-4 flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type your negotiation response..."
              className="flex-1 min-h-[44px] max-h-[120px] bg-transparent border-0 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus-visible:ring-0"
              data-testid="salary-message-input"
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading} className="bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl self-end" data-testid="salary-send-button">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
