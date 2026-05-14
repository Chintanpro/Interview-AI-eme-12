import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic2, BarChart3, Building2, FileSearch, Zap, Users2,
  ArrowRight, Check, Star, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';

const features = [
  { icon: Mic2, title: 'AI Mock Interviews', desc: 'Practice with 4 distinct AI interviewer personas that adapt to your responses.', color: 'var(--blue)' },
  { icon: BarChart3, title: 'Real-time Scoring', desc: 'Get scored across 6 dimensions instantly after each answer.', color: 'var(--green)' },
  { icon: Zap, title: 'STAR Rewrites', desc: 'Receive improved STAR-format versions of every answer you give.', color: 'var(--amber)' },
  { icon: Building2, title: 'Company Prep', desc: 'Predict exact questions any company is likely to ask for your role.', color: 'var(--purple)' },
  { icon: FileSearch, title: 'Resume Analysis', desc: 'Match your resume against job descriptions and identify gaps.', color: 'var(--red)' },
  { icon: Users2, title: 'Panel Simulation', desc: 'Face 5 interviewers at once in realistic panel interview practice.', color: 'var(--blue)' },
];

const steps = [
  { num: '01', title: 'Set up your interview', desc: 'Choose company, role, interviewer persona, and round type.' },
  { num: '02', title: 'Practice with AI', desc: 'Answer questions from AI interviewers that feel like the real thing.' },
  { num: '03', title: 'Get instant feedback', desc: 'Receive scores, rewrites, and actionable improvement tips.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'SWE at Google', text: 'InterviewIQ helped me prepare for my Google interviews. The AI feedback was incredibly accurate and actionable.', avatar: 'SC' },
  { name: 'Marcus Johnson', role: 'PM at Meta', text: 'The company-specific question prediction feature saved me hours of research. Got the exact questions they asked!', avatar: 'MJ' },
  { name: 'Priya Patel', role: 'SDE at Amazon', text: 'The STAR rewrite feature transformed my interview answers. I went from fumbling to structured and confident.', avatar: 'PP' },
];

const stagger = { container: { animate: { transition: { staggerChildren: 0.08 } } }, item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } } };

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl" style={{ backgroundColor: 'rgba(4, 6, 8, 0.85)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--blue)' }}>
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            InterviewIQ
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Features</a>
            <a href="#how-it-works" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">How it works</a>
            <a href="#pricing" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl" data-testid="landing-login-button">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl btn-glow" data-testid="landing-hero-primary-cta">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="gradient-overlay-blue absolute inset-0" />
        <div className="gradient-overlay-green absolute inset-0" />
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex gap-2 mb-6">
              {['Recruiter', 'Manager', 'Technical', 'Panel'].map((p) => (
                <span key={p} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>{p}</span>
              ))}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-[1.05] tracking-tight mb-6">
              Your AI Interview Coach That Gets You Hired
            </h1>
            <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
              Practice with AI interviewers, get scored across 6 dimensions, receive STAR-format rewrites, and predict company-specific questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button className="h-13 px-8 bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl text-base font-semibold btn-glow" data-testid="landing-cta-primary">
                  Start Free Practice <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" className="h-13 px-8 rounded-xl text-base border-white/10 text-[var(--text-primary)] hover:bg-white/[0.05]">
                  See How It Works
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Hero Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 glass-card p-6 md:p-8 max-w-4xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'rgba(79,142,247,0.2)', color: 'var(--blue)' }}>A</div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Alex — Senior Recruiter</p>
                <p className="text-xs text-[var(--text-muted)]">Google, Behavioral Round</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)] font-mono">Q3 of ~12</span>
                <div className="w-24 h-1.5 rounded-full bg-white/10">
                  <div className="w-1/4 h-full rounded-full" style={{ backgroundColor: 'var(--blue)' }} />
                </div>
              </div>
            </div>
            <p className="text-[var(--text-primary)] text-lg leading-relaxed mb-6">
              "Tell me about a time when you had to deal with a difficult team member. How did you approach the situation and what was the outcome?"
            </p>
            <div className="flex gap-4">
              <div className="flex-1 grid grid-cols-3 gap-3">
                {[{ label: 'Clarity', val: 85, color: 'var(--green)' }, { label: 'Structure', val: 72, color: 'var(--amber)' }, { label: 'Depth', val: 90, color: 'var(--green)' }].map((d) => (
                  <div key={d.label} className="text-center">
                    <p className="font-mono text-lg font-semibold" style={{ color: d.color }}>{d.val}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{d.label}</p>
                  </div>
                ))}
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--blue)" strokeWidth="8" strokeDasharray="283" strokeDashoffset="60" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-[var(--text-primary)]">82</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">Everything you need to ace your interview</h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">Comprehensive AI-powered tools that cover every aspect of interview preparation.</p>
          </div>
          <motion.div variants={stagger.container} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} variants={stagger.item} className="glass-card p-6 group cursor-pointer" style={{ '--hover-color': f.color }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${f.color}15` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">How InterviewIQ works</h2>
            <p className="text-[var(--text-secondary)] text-lg">Three simple steps to interview success</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <span className="font-mono text-5xl font-bold" style={{ color: 'rgba(79,142,247,0.15)' }}>{s.num}</span>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-4 mb-2">{s.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
                {i < 2 && <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-6 h-6 text-[var(--text-muted)]" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">Loved by job seekers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="glass-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[var(--amber)]" style={{ color: 'var(--amber)' }} />)}
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'rgba(79,142,247,0.2)', color: 'var(--blue)' }}>{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">Simple, transparent pricing</h2>
            <p className="text-[var(--text-secondary)] text-lg">Start free, upgrade when you're ready</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Free', price: '$0', period: '/month', features: ['3 mock interviews/month', 'Text mode only', '1 resume analysis', 'Basic dashboard'], cta: 'Get Started', color: 'var(--text-secondary)' },
              { name: 'Pro', price: '$19', period: '/month', features: ['Unlimited interviews', 'Voice interviews', 'Full company prep', 'Unlimited resume analysis', 'Advanced analytics'], cta: 'Start Pro Trial', color: 'var(--blue)', popular: true },
              { name: 'Premium', price: '$39', period: '/month', features: ['Everything in Pro', 'Panel interview sim', 'Salary negotiation coach', 'Priority support', 'All future features'], cta: 'Go Premium', color: 'var(--purple)' },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`glass-card p-6 relative ${plan.popular ? 'ring-1 ring-[var(--blue)]/30' : ''}`}
                data-testid={`pricing-plan-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'var(--blue)', color: 'white' }}>Most Popular</span>
                )}
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-mono text-4xl font-bold text-[var(--text-primary)]">{plan.price}</span>
                  <span className="text-[var(--text-muted)] text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button
                    className={`w-full rounded-xl h-11 font-semibold ${plan.popular ? 'bg-[var(--blue)] hover:bg-[#3E7FF0] text-white btn-glow' : 'bg-white/[0.06] hover:bg-white/[0.10] text-[var(--text-primary)] border border-white/[0.08]'}`}
                    data-testid={`pricing-plan-${plan.name.toLowerCase()}-select-button`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-20">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">Ready to ace your next interview?</h2>
          <p className="text-[var(--text-secondary)] text-lg mb-8">Join thousands of candidates who've improved their interview skills with AI coaching.</p>
          <Link to="/register">
            <Button className="h-13 px-10 bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl text-base font-semibold btn-glow">
              Start Free Practice <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm font-semibold text-[var(--text-muted)]">InterviewIQ</span>
          <p className="text-sm text-[var(--text-muted)]">Built with AI. Designed for success.</p>
        </div>
      </footer>
    </div>
  );
}
