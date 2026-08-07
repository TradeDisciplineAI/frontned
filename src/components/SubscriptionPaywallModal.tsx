import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  CheckCircle2,
  Zap,
  ShieldAlert,
  Sparkles,
  X,
  TrendingUp,
  Brain,
  BellRing,
} from 'lucide-react';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

export const SubscriptionPaywallModal: React.FC = () => {
  const { isPaywallOpen, paywallReason, closePaywall, upgradeToPro, isUpgrading, status, error } =
    useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isPaywallOpen) {
    return null;
  }

  const tradesCount = status?.trades_count ?? 6;
  const maxFree = status?.max_free_trades ?? 6;

  const handleUpgrade = async () => {
    const dummyPaymentToken = `pay_tok_entitle_${Date.now()}`;
    const success = await upgradeToPro(dummyPaymentToken);
    if (success) {
      setSuccessMessage('🎉 Subscription Upgraded to PRO! Unlimited Trading Unlocked.');
      setTimeout(() => {
        setSuccessMessage(null);
        closePaywall();
      }, 2000);
    }
  };

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
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(16px)',
          padding: '16px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%',
            maxWidth: '720px', // 👈 Wider landscape modal container
            background: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px 28px', // 👈 Compact vertical padding
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 229, 153, 0.12)',
            position: 'relative',
            color: '#f8fafc',
            overflow: 'hidden',
          }}
        >
          {/* Top Emerald Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00e599, #10b981, #f59e0b, #00e599)',
            }}
          />

          {/* Close Button */}
          <button
            onClick={closePaywall}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Compact Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div
              style={{
                background: 'rgba(0, 229, 153, 0.12)',
                border: '1px solid rgba(0, 229, 153, 0.3)',
                color: '#00e599',
                padding: '10px',
                borderRadius: '12px',
                display: 'flex',
              }}
            >
              <Crown className="w-6 h-6 text-emerald-400" />
            </div>

            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: '#fff' }}>
                {paywallReason === 'trade_limit'
                  ? 'Free Trade Capacity Limit Reached (6/6)'
                  : 'Upgrade to AI Trading Discipline Pro'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '12.5px', margin: '2px 0 0 0' }}>
                Unlock unlimited trades, real-time WebSocket streaming, and AI risk guards.
              </p>
            </div>
          </div>

          {/* Side-by-Side 2-Column Content Layout (Benefits Left, Plans Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            {/* Left Column: Usage Meter & Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Progress Usage Meter */}
              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: '#cbd5e1' }}>Free Trade Usage</span>
                  <span style={{ color: tradesCount >= maxFree ? '#ef4444' : '#00e599' }}>
                    {tradesCount} / {maxFree} Free Trades
                  </span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (tradesCount / maxFree) * 100)}%`,
                      background: tradesCount >= maxFree ? 'linear-gradient(90deg, #00e599, #ef4444)' : 'linear-gradient(90deg, #00e599, #10b981)',
                      borderRadius: '9999px',
                    }}
                  />
                </div>
              </div>

              {/* 4 Key Features List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { icon: TrendingUp, title: 'Unlimited Trades', desc: 'No count caps' },
                  { icon: Brain, title: 'AI Risk Engine', desc: 'Size & revenge guards' },
                  { icon: BellRing, title: 'Price Alarms', desc: 'Instant email & toast' },
                  { icon: Zap, title: 'Live Stream', desc: 'Sub-second WS feed' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.025)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px',
                        padding: '8px 10px',
                      }}
                    >
                      <Icon className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#f1f5f9' }}>{item.title}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Plan Selector Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => setSelectedPlan('annual')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: selectedPlan === 'annual' ? '2px solid #00e599' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: selectedPlan === 'annual' ? 'rgba(0, 229, 153, 0.08)' : 'rgba(15, 23, 42, 0.5)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Annual Billing</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                    $19 <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>/mo</span>
                  </div>
                </div>

                <span style={{ background: '#00e599', color: '#000', fontSize: '9.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px' }}>
                  SAVE 35%
                </span>
              </button>

              <button
                onClick={() => setSelectedPlan('monthly')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: selectedPlan === 'monthly' ? '2px solid #00e599' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: selectedPlan === 'monthly' ? 'rgba(0, 229, 153, 0.08)' : 'rgba(15, 23, 42, 0.5)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Monthly Billing</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                    $29 <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>/mo</span>
                  </div>
                </div>

                <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600 }}>Flexible</span>
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '10px', padding: '10px', fontSize: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div style={{ background: 'rgba(0, 229, 153, 0.15)', border: '1px solid rgba(0, 229, 153, 0.3)', color: '#6ee7b7', borderRadius: '10px', padding: '10px', fontSize: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Upgrade Button */}
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #00e599 0%, #10b981 100%)',
              color: '#0b1120',
              fontSize: '14.5px',
              fontWeight: 800,
              cursor: isUpgrading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px -4px rgba(0, 229, 153, 0.4)',
              opacity: isUpgrading ? 0.7 : 1,
            }}
          >
            {isUpgrading ? (
              <span>Verifying & Upgrading...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Pro Plan Now</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
