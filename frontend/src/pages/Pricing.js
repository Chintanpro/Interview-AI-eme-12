import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Zap, Crown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../lib/store';
import { planAPI } from '../lib/api';
import { toast } from 'sonner';

const plans = [
  {
    name: 'Free',
    key: 'FREE',
    price: { monthly: '$0', yearly: '$0' },
    desc: 'Get started with basic interview practice',
    features: [
      '3 mock interviews/month',
      'Basic overall score',
      'General question bank',
      'Basic session history',
    ],
    cta: 'Get Started',
    style: 'outline',
  },
  {
    name: 'Pro',
    key: 'PRO',
    price: { monthly: '$19', yearly: '$15' },
    desc: 'Full interview prep toolkit for serious candidates',
    features: [
      'Unlimited interviews',
      'Full 6-dimension scoring',
      'Company question prediction',
      'Resume analysis',
      'Voice interviews',
      'Progress analytics & trends',
      'STAR answer rewrites',
    ],
    cta: 'Start Pro Trial',
    style: 'primary',
    popular: true,
    icon: Zap,
  },
  {
    name: 'Premium',
    key: 'PREMIUM',
    price: { monthly: '$49', yearly: '$39' },
    desc: 'Everything you need to negotiate the best offer',
    features: [
      'Everything in Pro',
      'Salary negotiation coach',
      'Panel interview simulation',
      'Priority AI response speed',
      'Industry question packs',
      'Exportable reports (PDF)',
    ],
    cta: 'Go Premium',
    style: 'cyan',
    icon: Crown,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSelect = async (planKey) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    if (planKey === 'FREE') {
      toast.info('You are on the Free plan');
      return;
    }
    try {
      const res = await planAPI.upgrade({ plan: planKey });
      updateUser(res.data.user || { ...user, plan: planKey });
      toast.success(`Upgraded to ${planKey}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upgrade failed');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Link to="/" className="font-display text-xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-indigo)' }}>
            <span className="text-white font-bold text-sm">IQ</span>
          </div>
          InterviewIQ
        </Link>
        <Link to={isAuthenticated ? '/dashboard' : '/login'} className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="w-4 h-4" /> {isAuthenticated ? 'Dashboard' : 'Sign in'}
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Simple, transparent pricing</h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Start free, upgrade when you're ready</p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-sm" style={{ color: yearly ? 'var(--text-muted)' : 'var(--text-primary)' }}>Monthly</span>
            <button onClick={() => setYearly(!yearly)} className="w-12 h-6 rounded-full relative" style={{ backgroundColor: yearly ? 'var(--primary-indigo)' : 'rgba(255,255,255,0.12)' }} data-testid="pricing-billing-toggle">
              <div className="w-5 h-5 rounded-full absolute top-0.5 bg-white" style={{ left: yearly ? '26px' : '2px', transition: 'left 0.2s' }} />
            </button>
            <span className="text-sm" style={{ color: yearly ? 'var(--text-primary)' : 'var(--text-muted)' }}>Yearly</span>
            {yearly && <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>Save 20%</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={plan.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card p-6 relative ${plan.popular ? 'ring-1 pulse-glow' : ''}`}
              style={plan.popular ? { borderColor: 'rgba(99,102,241,0.3)' } : {}}
              data-testid={`pricing-plan-${plan.key.toLowerCase()}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-semibold text-white" style={{ backgroundColor: 'var(--primary-indigo)' }}>Most Popular</span>
              )}
              <div className="flex items-center gap-2 mb-2">
                {plan.icon && <plan.icon className="w-4 h-4" style={{ color: plan.popular ? 'var(--primary-indigo)' : 'var(--accent-cyan)' }} />}
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{yearly ? plan.price.yearly : plan.price.monthly}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: plan.popular ? 'var(--primary-indigo)' : plan.style === 'cyan' ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />{f}
                  </li>
                ))}
              </ul>
              <Button onClick={() => handleSelect(plan.key)} className={`w-full rounded-xl h-11 font-semibold ${
                plan.popular ? 'text-white btn-glow' : 'border'
              }`} style={
                plan.popular ? { backgroundColor: 'var(--primary-indigo)' } :
                plan.style === 'cyan' ? { backgroundColor: 'rgba(34,211,238,0.1)', borderColor: 'rgba(34,211,238,0.2)', color: 'var(--accent-cyan)' } :
                { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }
              } data-testid={`pricing-plan-${plan.key.toLowerCase()}-select-button`}>
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
