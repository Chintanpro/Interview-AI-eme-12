import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic2, BarChart3, Building2, FileSearch, Zap, Users2,
  ArrowRight, Check, Star, ChevronRight, Menu, X, Sparkles, Play, Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';

const features = [
  { icon: Mic2, title: 'AI Mock Interviews', desc: 'Practice with 4 distinct AI interviewer personas that adapt to your responses in real-time.', color: '#6366F1' },
  { icon: BarChart3, title: '6-Dimension Scoring', desc: 'Get scored on clarity, confidence, relevance, structure, completeness, and depth.', color: '#10B981' },
  { icon: Zap, title: 'STAR Rewrites', desc: 'Receive improved STAR-format versions of every answer to learn what great looks like.', color: '#F59E0B' },
  { icon: Building2, title: 'Company Prediction', desc: 'Predict exact questions any company asks for your specific role and level.', color: '#22D3EE' },
  { icon: FileSearch, title: 'Resume Intelligence', desc: 'Match your resume against job descriptions. Identify gaps, red flags, and talking points.', color: '#EF4444' },
  { icon: Users2, title: 'Salary Coach', desc: 'Practice salary negotiation with a realistic AI recruiter. Master counteroffers.', color: '#A78BFA' },
];

const steps = [
  { num: '01', title: 'Choose your setup', desc: 'Pick company, role, interviewer persona, round type, and difficulty level.' },
  { num: '02', title: 'Practice with AI', desc: 'Answer questions from AI interviewers that feel like the real thing with follow-ups.' },
  { num: '03', title: 'Get scored & improve', desc: 'Receive 6-dimension scores, STAR rewrites, and a personalized improvement plan.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'SWE at Google', text: 'The 6-dimension scoring showed me I was scoring 42/100 on Structure. After 8 sessions targeting that specifically, I got to 78/100 and landed my Google offer.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
  { name: 'Marcus Johnson', role: 'PM at Meta', text: 'The company-specific question prediction feature saved me hours of research. I got 3 of the 5 exact questions they asked in my Meta PM loop.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face' },
  { name: 'Priya Patel', role: 'SDE at Amazon', text: 'The STAR rewrite feature transformed my answers. I went from fumbling through behavioral questions to delivering structured, confident responses.', avatar: 'https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?w=80&h=80&fit=crop&crop=face' },
];

const companies = ['Google', 'Amazon', 'Meta', 'Apple', 'Microsoft', 'Netflix', 'Stripe', 'Airbnb', 'McKinsey', 'Goldman Sachs', 'OpenAI', 'Uber'];

const stats = [
  { value: '12,847', label: 'Candidates trained' },
  { value: '94%', label: 'Report improved scores' },
  { value: '200+', label: 'Companies covered' },
  { value: '4.9/5', label: 'Average rating' },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
  item: { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }
};

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl" style={{ backgroundColor: 'rgba(10, 15, 30, 0.85)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-indigo)' }}>
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            InterviewIQ
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm hover:text-[var(--text-primary)]" style={{ color: 'var(--text-secondary)' }}>Features</a>
            <a href="#how-it-works" className="text-sm hover:text-[var(--text-primary)]" style={{ color: 'var(--text-secondary)' }}>How it works</a>
            <Link to="/pricing" className="text-sm hover:text-[var(--text-primary)]" style={{ color: 'var(--text-secondary)' }}>Pricing</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="rounded-xl" style={{ color: 'var(--text-secondary)' }} data-testid="landing-login-button">Log in</Button>
            </Link>
            <Link to="/register">
              <Button className="rounded-xl btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="landing-hero-primary-cta">Get Started Free</Button>
            </Link>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="mobile-menu-toggle">
            {mobileMenuOpen ? <X className="w-6 h-6" style={{ color: 'var(--text-primary)' }} /> : <Menu className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-3" style={{ backgroundColor: 'rgba(10, 15, 30, 0.95)' }}>
            <a href="#features" className="block py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Features</a>
            <a href="#how-it-works" className="block py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>How it works</a>
            <Link to="/pricing" className="block py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Pricing</Link>
            <Link to="/login" className="block py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Log in</Link>
            <Link to="/register">
              <Button className="w-full rounded-xl btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }}>Get Started Free</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="gradient-overlay-indigo absolute inset-0" />
        <div className="gradient-overlay-cyan absolute inset-0" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6" style={{ border: '1px solid rgba(99,102,241,0.3)', backgroundColor: 'rgba(99,102,241,0.08)' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--primary-indigo)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--primary-indigo)' }}>Powered by Claude AI</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
                Practice with a realistic AI before the real one interviews you.
              </h1>
              <p className="text-lg md:text-xl leading-relaxed mb-8 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                Get company-specific questions, real-time scoring across 6 dimensions, and STAR-format rewrites. Land your dream job.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button className="h-12 px-8 rounded-xl text-base font-semibold btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="landing-cta-primary">
                    Start Practicing Free <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" className="h-12 px-8 rounded-xl text-base" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}>
                    <Play className="w-4 h-4 mr-2" /> See How It Works
                  </Button>
                </a>
              </div>
              <div className="flex items-center gap-3 mt-8">
                <div className="flex -space-x-2">
                  {testimonials.map((t, i) => (
                    <img key={i} src={t.avatar} alt="" className="w-8 h-8 rounded-full border-2" style={{ borderColor: 'var(--bg-base)' }} />
                  ))}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Join 12,000+ candidates from top companies</span>
              </div>
            </motion.div>

            {/* Hero Preview Card */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="lg:col-span-5 hidden lg:block">
              <div className="glass-card noise-overlay relative overflow-hidden p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>A</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Alex — Senior Recruiter</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Google, Behavioral Round</p>
                  </div>
                  <div className="ml-auto">
                    <span className="font-mono text-xs px-2 py-1 rounded-md" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>Q3 of ~8</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-primary)' }}>
                  "Tell me about a time when you had to deal with a difficult team member. How did you approach the situation and what was the outcome?"
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[{ l: 'Clarity', v: 85, c: 'var(--success)' }, { l: 'Structure', v: 72, c: 'var(--warning)' }, { l: 'Depth', v: 90, c: 'var(--success)' }].map(d => (
                    <div key={d.l} className="text-center">
                      <p className="font-mono text-lg font-semibold" style={{ color: d.c }}>{d.v}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {['Clarity', 'Confidence', 'Relevance'].map(d => (
                      <span key={d} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>{d}</span>
                    ))}
                  </div>
                  <div className="w-12 h-12 relative">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary-indigo)" strokeWidth="6" strokeDasharray="264" strokeDashoffset="48" strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold" style={{ color: 'var(--text-primary)' }}>82</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Marquee */}
      <section className="py-8 overflow-hidden" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-8 marquee" style={{ width: 'max-content' }}>
          {[...companies, ...companies].map((c, i) => (
            <span key={i} className="text-sm font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{c}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Everything you need to ace your interview</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Comprehensive AI-powered tools covering every aspect of interview preparation.</p>
          </div>
          <motion.div variants={stagger.container} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={i} variants={stagger.item} className="glass-card p-6 group cursor-pointer" style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${f.color}15` }}>
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>From nervous to confident in 3 steps</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Simple, effective, and measurable</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="relative">
                <span className="font-mono text-5xl font-bold" style={{ color: 'rgba(99,102,241,0.12)' }}>{s.num}</span>
                <h3 className="text-xl font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                {i < 2 && <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-6 h-6" style={{ color: 'var(--text-muted)' }} />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Loved by job seekers worldwide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className={`glass-card p-6 ${i === 1 ? 'ring-1 ring-[var(--primary-indigo)]/20' : ''}`}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-[var(--warning)]" style={{ color: 'var(--warning)' }} />)}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12" style={{ background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
                <p className="font-display text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Simple, transparent pricing</h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Start free, upgrade when you're ready</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Free', price: '$0', features: ['3 mock interviews/month', 'Basic overall score', 'General question bank', 'Basic session history'], cta: 'Get Started', style: 'outline' },
              { name: 'Pro', price: '$19', features: ['Unlimited interviews', 'Full 6-dimension scoring', 'Company prediction', 'Resume analysis', 'Voice interviews', 'Progress analytics'], cta: 'Start Pro Trial', style: 'primary', popular: true },
              { name: 'Premium', price: '$49', features: ['Everything in Pro', 'Salary negotiation coach', 'Panel interview sim', 'Priority AI speed', 'Industry question packs'], cta: 'Go Premium', style: 'cyan' },
            ].map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className={`glass-card p-6 relative ${plan.popular ? 'ring-1 pulse-glow' : ''}`}
                style={plan.popular ? { borderColor: 'rgba(99,102,241,0.3)' } : {}}
                data-testid={`pricing-plan-${plan.name.toLowerCase()}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-semibold text-white" style={{ backgroundColor: 'var(--primary-indigo)' }}>Most Popular</span>
                )}
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: plan.popular ? 'var(--primary-indigo)' : plan.style === 'cyan' ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button className={`w-full rounded-xl h-11 font-semibold ${
                    plan.popular ? 'text-white btn-glow' : 'border'
                  }`} style={
                    plan.popular ? { backgroundColor: 'var(--primary-indigo)' } :
                    plan.style === 'cyan' ? { backgroundColor: 'rgba(34,211,238,0.1)', borderColor: 'rgba(34,211,238,0.2)', color: 'var(--accent-cyan)' } :
                    { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }
                  } data-testid={`pricing-plan-${plan.name.toLowerCase()}-select-button`}>
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card noise-overlay relative overflow-hidden p-12 md:p-16">
            <div className="gradient-overlay-indigo absolute inset-0" />
            <div className="relative z-10">
              <Shield className="w-10 h-10 mx-auto mb-4" style={{ color: 'var(--primary-indigo)' }} />
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Your dream job is one good interview away.</h2>
              <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>Join thousands of candidates who've improved their interview skills with AI coaching.</p>
              <Link to="/register">
                <Button className="h-12 px-10 rounded-xl text-base font-semibold btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="landing-final-cta">
                  Start Free Practice <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>No credit card required • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <span className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>InterviewIQ</span>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>AI-powered interview coaching</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Product</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li><a href="#features">Features</a></li>
                <li><Link to="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li>About</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Resources</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li>FAQ</li>
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} InterviewIQ. Built with AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
