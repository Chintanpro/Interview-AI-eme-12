import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const plans = [
  {
    name: 'Free', price: '$0', period: '/month',
    features: {
      'Mock Interviews': '3/month', 'Text Mode': true, 'Voice Interviews': false,
      'Company Prep': '3 sample Qs', 'Resume Analysis': '1', 'Panel Interview': false,
      'Salary Coach': false, 'Advanced Analytics': false, 'AI Messages/Day': '50',
    },
    color: 'var(--text-secondary)'
  },
  {
    name: 'Pro', price: '$19', period: '/month', popular: true,
    features: {
      'Mock Interviews': 'Unlimited', 'Text Mode': true, 'Voice Interviews': true,
      'Company Prep': 'Full Access', 'Resume Analysis': 'Unlimited', 'Panel Interview': false,
      'Salary Coach': false, 'Advanced Analytics': true, 'AI Messages/Day': 'Unlimited',
    },
    color: 'var(--blue)'
  },
  {
    name: 'Premium', price: '$39', period: '/month',
    features: {
      'Mock Interviews': 'Unlimited', 'Text Mode': true, 'Voice Interviews': true,
      'Company Prep': 'Full Access', 'Resume Analysis': 'Unlimited', 'Panel Interview': true,
      'Salary Coach': true, 'Advanced Analytics': true, 'AI Messages/Day': 'Unlimited',
    },
    color: 'var(--purple)'
  },
];

const featureNames = Object.keys(plans[0].features);

export default function Pricing() {
  return (
    <div className="min-h-screen py-20" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Choose Your Plan</h1>
          <p className="text-lg text-[var(--text-secondary)]">Start free, upgrade when you're ready to level up</p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-8 relative ${plan.popular ? 'ring-1 ring-[var(--blue)]/30' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: 'var(--blue)', color: 'white' }}>Most Popular</span>
              )}
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-mono text-5xl font-bold text-[var(--text-primary)]">{plan.price}</span>
                <span className="text-[var(--text-muted)]">{plan.period}</span>
              </div>
              <Link to="/register">
                <Button className={`w-full rounded-xl h-12 font-semibold mb-6 ${plan.popular ? 'bg-[var(--blue)] hover:bg-[#3E7FF0] text-white btn-glow' : 'bg-white/[0.06] hover:bg-white/[0.10] text-[var(--text-primary)]'}`}>
                  Get {plan.name}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)] w-1/4">Feature</th>
                  {plans.map((p) => (
                    <th key={p.name} className="p-4 text-center text-sm font-semibold text-[var(--text-primary)] w-1/4">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featureNames.map((fname, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover:bg-white/[0.02]">
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{fname}</td>
                    {plans.map((p) => {
                      const val = p.features[fname];
                      return (
                        <td key={p.name} className="p-4 text-center">
                          {typeof val === 'boolean' ? (
                            val ? <Check className="w-5 h-5 mx-auto" style={{ color: 'var(--green)' }} /> : <X className="w-5 h-5 mx-auto" style={{ color: 'var(--text-muted)' }} />
                          ) : (
                            <span className="text-sm font-medium text-[var(--text-primary)]">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
