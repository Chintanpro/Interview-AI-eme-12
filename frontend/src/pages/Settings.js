import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, CreditCard, LogOut, Save, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../lib/store';
import { authAPI, planAPI } from '../lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await authAPI.updateProfile({ name });
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    try {
      await planAPI.upgrade({ plan });
      updateUser({ ...user, plan });
      toast.success(`Upgraded to ${plan}!`);
    } catch (err) {
      toast.error('Failed to upgrade');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>

      {/* Profile */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-[var(--blue)]" /> Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/[0.04] border-[var(--border-subtle)] text-[var(--text-primary)] h-11 rounded-xl" />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Email</label>
            <Input value={user?.email || ''} disabled className="bg-white/[0.02] border-[var(--border-subtle)] text-[var(--text-muted)] h-11 rounded-xl" />
          </div>
          <Button onClick={handleSave} disabled={loading} className="bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl" data-testid="settings-save-button">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Current Plan */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-[var(--purple)]" /> Subscription
        </h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Current Plan</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{user?.plan || 'FREE'}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-lg font-semibold ${
            user?.plan === 'PREMIUM' ? 'bg-[rgba(155,107,242,0.15)] text-[var(--purple)]' :
            user?.plan === 'PRO' ? 'bg-[rgba(79,142,247,0.15)] text-[var(--blue)]' :
            'bg-white/[0.06] text-[var(--text-muted)]'
          }`}>
            {user?.plan || 'FREE'}
          </span>
        </div>
        {user?.plan !== 'PREMIUM' && (
          <div className="flex gap-3">
            {user?.plan === 'FREE' && (
              <Button onClick={() => handleUpgrade('PRO')} className="bg-[var(--blue)] hover:bg-[#3E7FF0] text-white rounded-xl flex-1">
                Upgrade to Pro ($19/mo)
              </Button>
            )}
            <Button onClick={() => handleUpgrade('PREMIUM')} className="bg-[var(--purple)] hover:bg-[#8A5CE0] text-white rounded-xl flex-1">
              {user?.plan === 'PRO' ? 'Upgrade to Premium ($39/mo)' : 'Go Premium ($39/mo)'}
            </Button>
          </div>
        )}
        {user?.plan !== 'FREE' && (
          <Button onClick={() => handleUpgrade('FREE')} variant="ghost" className="w-full mt-3 text-[var(--text-muted)] hover:text-[var(--red)] rounded-xl">
            Downgrade to Free
          </Button>
        )}
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Note: Plan changes are handled in demo mode. In production, this would integrate with Stripe.
        </p>
      </div>

      {/* Account Actions */}
      <div className="glass-card p-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--red)]" /> Account
        </h2>
        <Button onClick={handleLogout} variant="outline" className="rounded-xl border-white/10 text-[var(--red)] hover:bg-[rgba(255,77,106,0.08)]">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
