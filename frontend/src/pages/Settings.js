import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authAPI, planAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);

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

  const handleUpgrade = async (planName) => {
    setUpgradeLoading(true);
    setUpgradePlan(planName);
    try {
      const res = await planAPI.upgrade({ plan: planName });
      updateUser(res.data.user || { ...user, plan: planName });
      toast.success(`Successfully upgraded to ${planName}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upgrade failed');
    } finally {
      setUpgradeLoading(false);
      setUpgradePlan('');
    }
  };

  const currentPlan = user?.plan || 'FREE';
  const plans = [
    { name: 'FREE', label: 'Free', price: '$0/mo' },
    { name: 'PRO', label: 'Pro', price: '$19/mo' },
    { name: 'PREMIUM', label: 'Premium', price: '$49/mo' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your profile and subscription</p>
      </div>

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

      {/* Plan */}
      <div className="glass-card p-6">
        <h3 className="font-display text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Subscription</h3>
        <div className="grid grid-cols-3 gap-3">
          {plans.map(p => {
            const isCurrent = currentPlan === p.name;
            const planOrder = { FREE: 0, PRO: 1, PREMIUM: 2 };
            const isUpgrade = planOrder[p.name] > planOrder[currentPlan];

            return (
              <div key={p.name} className={`p-4 rounded-xl text-center ${isCurrent ? 'ring-1' : ''}`} style={{ backgroundColor: isCurrent ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)', borderColor: isCurrent ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)', border: `1px solid ${isCurrent ? 'rgba(99,102,241,0.3)' : 'var(--border-subtle)'}` }}>
                <p className="font-display text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{p.label}</p>
                <p className="text-sm my-1" style={{ color: 'var(--text-muted)' }}>{p.price}</p>
                {isCurrent ? (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>Current</span>
                ) : isUpgrade ? (
                  <Button size="sm" onClick={() => handleUpgrade(p.name)} disabled={upgradeLoading} className="mt-2 text-xs rounded-lg text-white" style={{ backgroundColor: 'var(--primary-indigo)' }} data-testid={`upgrade-to-${p.name.toLowerCase()}`}>
                    {upgradeLoading && upgradePlan === p.name ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Upgrade'}
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
