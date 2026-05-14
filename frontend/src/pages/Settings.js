import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Save, Loader2, CheckCircle, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authAPI, planAPI, paymentsAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Poll for payment status when returning from Stripe
  const pollPaymentStatus = useCallback(async (sessionId, attempts = 0) => {
    const maxAttempts = 8;
    const pollInterval = 2500;

    if (attempts >= maxAttempts) {
      toast.error('Payment status check timed out. Please refresh the page.');
      return;
    }

    try {
      const res = await paymentsAPI.getStatus(sessionId);
      const data = res.data;

      if (data.payment_status === 'paid') {
        // Payment successful! Refresh user data
        const userRes = await authAPI.getMe();
        updateUser(userRes.data.user);
        toast.success(`Successfully upgraded to ${data.metadata?.plan || 'Pro'}!`);
        // Clean URL
        setSearchParams({});
        return;
      } else if (data.status === 'expired') {
        toast.error('Payment session expired. Please try again.');
        setSearchParams({});
        return;
      }

      // Still pending, continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (err) {
      console.error('Payment status poll error:', err);
      if (attempts < maxAttempts - 1) {
        setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
      }
    }
  }, [updateUser, setSearchParams]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (payment === 'success' && sessionId) {
      toast.info('Verifying payment...');
      pollPaymentStatus(sessionId);
    } else if (payment === 'cancelled') {
      toast.info('Payment was cancelled.');
      setSearchParams({});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ name: name.trim() });
      updateUser(res.data.user || { ...user, name: name.trim() });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async (planName, billing = 'monthly') => {
    setCheckoutLoading(planName);
    try {
      const originUrl = window.location.origin;
      const res = await paymentsAPI.createCheckout({
        plan: planName,
        billing,
        origin_url: originUrl,
      });
      // Redirect to Stripe Checkout
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start checkout');
    } finally {
      setCheckoutLoading('');
    }
  };

  const currentPlan = user?.plan || 'FREE';
  const plans = [
    { name: 'FREE', label: 'Free', price: '$0/mo', features: ['3 interviews/month', 'Basic scoring'] },
    { name: 'PRO', label: 'Pro', price: '$19/mo', features: ['Unlimited interviews', 'Voice mode', 'Full 6-dim scoring', 'Company prep', 'Resume analysis'] },
    { name: 'PREMIUM', label: 'Premium', price: '$49/mo', features: ['Everything in Pro', 'Salary coach', 'Panel interviews', 'Priority AI'] },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your profile and subscription</p>
      </div>

      {/* Payment Success Banner */}
      {searchParams.get('payment') === 'success' && (
        <div className="glass-card p-4 flex items-center gap-3" style={{ borderLeft: '3px solid var(--success)', backgroundColor: 'rgba(16,185,129,0.06)' }}>
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--success)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>Verifying your payment...</span>
        </div>
      )}

      {/* Profile */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h3>
        <div>
          <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-10 h-11 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} data-testid="settings-name-input" />
          </div>
        </div>
        <div>
          <Label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <Input value={user?.email || ''} disabled className="pl-10 h-11 rounded-xl opacity-60" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="rounded-xl btn-glow text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid="settings-save-button">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>

      {/* Subscription */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>Subscription</h3>
          <span className="font-mono text-xs px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: 'var(--primary-indigo)' }}>{currentPlan}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map(p => {
            const isCurrent = currentPlan === p.name;
            const planOrder = { FREE: 0, PRO: 1, PREMIUM: 2 };
            const isUpgrade = planOrder[p.name] > planOrder[currentPlan];

            return (
              <div key={p.name} className={`p-4 rounded-xl ${isCurrent ? 'ring-1' : ''}`} style={{
                backgroundColor: isCurrent ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isCurrent ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}`,
              }}>
                <p className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{p.label}</p>
                <p className="text-sm my-1" style={{ color: 'var(--text-muted)' }}>{p.price}</p>
                <ul className="space-y-1 mb-3">
                  {p.features.map((f, j) => (
                    <li key={j} className="text-[11px] flex items-start gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: isCurrent ? 'var(--primary-indigo)' : 'var(--text-muted)' }} />{f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>Current Plan</span>
                ) : isUpgrade ? (
                  <Button size="sm" onClick={() => handleStripeCheckout(p.name)} disabled={!!checkoutLoading}
                    className="w-full mt-1 text-xs rounded-lg text-white" style={{ backgroundColor: 'var(--primary-indigo)' }}
                    data-testid={`upgrade-to-${p.name.toLowerCase()}`}>
                    {checkoutLoading === p.name ? (
                      <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing...</>
                    ) : (
                      <><CreditCard className="w-3 h-3 mr-1" /> Upgrade with Stripe</>
                    )}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
