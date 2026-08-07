import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, User, Crown, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();
  const { status, openPaywall } = useSubscriptionStore();
  const [activeTab, setActiveTab] = useState<'subscription' | 'profile'>('subscription');

  if (!isOpen) return null;

  const isPro = status?.is_pro ?? false;
  const tradesCount = status?.trades_count ?? 0;
  const maxFree = status?.max_free_trades ?? 6;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5, 8, 22, 0.8)',
          backdropFilter: 'blur(12px)',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%',
            maxWidth: '640px',
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            position: 'relative',
            color: '#f8fafc',
            overflow: 'hidden',
          }}
        >
          {/* Top Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  padding: '10px',
                  borderRadius: '12px',
                  display: 'flex',
                }}
              >
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Account & Settings</h2>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, marginTop: '2px' }}>
                  Manage your profile, preferences, and subscription tier.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <button
              onClick={() => setActiveTab('subscription')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background:
                  activeTab === 'subscription' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: activeTab === 'subscription' ? '#fbbf24' : '#94a3b8',
                fontWeight: activeTab === 'subscription' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <Crown className="w-4 h-4" />
              <span>Subscription & Plans</span>
              {isPro && (
                <span
                  style={{
                    fontSize: '10px',
                    background: '#f59e0b',
                    color: '#000',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 800,
                  }}
                >
                  PRO
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'profile' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: activeTab === 'profile' ? '#fff' : '#94a3b8',
                fontWeight: activeTab === 'profile' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <User className="w-4 h-4" />
              <span>User Profile</span>
            </button>
          </div>

          {/* Tab Content: Subscription & Plans */}
          {activeTab === 'subscription' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Current Tier Overview Box */}
              <div
                style={{
                  background: isPro
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.15))'
                    : 'rgba(30, 41, 59, 0.5)',
                  border: isPro
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                      Active Tier
                    </span>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 0 0', color: isPro ? '#fbbf24' : '#fff' }}>
                      {isPro ? '👑 PRO Tier Active' : '⚡ Free Standard Tier'}
                    </h3>
                  </div>

                  <span
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: isPro ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 229, 153, 0.1)',
                      color: isPro ? '#fbbf24' : '#00e599',
                      border: isPro
                        ? '1px solid rgba(245, 158, 11, 0.4)'
                        : '1px solid rgba(0, 229, 153, 0.2)',
                    }}
                  >
                    {isPro ? 'UNLIMITED ACCESS' : '6 TRADES CAP'}
                  </span>
                </div>

                {!isPro && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>Trade Executions Used</span>
                      <span style={{ color: tradesCount >= maxFree ? '#ef4444' : '#fbbf24' }}>
                        {tradesCount} / {maxFree} Free Trades
                      </span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '14px' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (tradesCount / maxFree) * 100)}%`,
                          background: tradesCount >= maxFree ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #f59e0b)',
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Upgrade Button */}
                {!isPro ? (
                  <button
                    onClick={() => {
                      onClose();
                      openPaywall('manual');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#000',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Upgrade to Pro Plan ($19/mo)</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your Pro membership is active. Enjoy unlimited trading discipline tools!</span>
                  </div>
                )}
              </div>

              {/* Plan Comparison Summary */}
              <div style={{ background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>
                  Pro Tier Includes:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {[
                    'Unlimited Stock Holdings',
                    'Real-Time WebSocket Stream',
                    'Smart Price Target Alarms',
                    'AI Discipline Psychology Coach',
                  ].map((feature, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Profile Details */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Username</label>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>{user?.username || 'Anjal Dev VK'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</label>
                    <div style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '2px' }}>{user?.email || 'user@example.com'}</div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Account Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span style={{ fontSize: '13px', color: '#34d399', fontWeight: 600 }}>Verified & Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
