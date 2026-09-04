import { apiClient } from '@/lib/api.client';
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
  const { isPaywallOpen, paywallReason, closePaywall, isUpgrading, status, error } =
    useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isPaywallOpen) {
    return null;
  }

  const tradesCount = status?.trades_count ?? 6;
  const maxFree = status?.max_free_trades ?? 6;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (status?.is_pro || loading || isUpgrading) {
      return;
    }

    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay payment gateway SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      let proPlanId: string | null = null;
      try {
        const plansRes = await apiClient.get('/auth/subscriptions/plans');
        const plans = plansRes.data;
        const proPlan = plans.find((p: any) => p.name === 'PRO') || plans[1] || plans[0];
        if (proPlan) {
          proPlanId = proPlan.id;
        }
      } catch (e) {
        console.warn('Could not fetch plan list from /auth/subscriptions/plans:', e);
      }

      if (!proPlanId) {
        alert('Unable to load subscription plans. Please try again later.');
        setLoading(false);
        return;
      }

      const orderRes = await apiClient.post('/auth/subscriptions/create-order', {
        plan_id: proPlanId,
      });
      const orderData = orderRes.data;

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Trade Discipline AI',
        description: 'PRO Subscription Upgrade (15 Portfolios & All AI Agents)',
        order_id: orderData.razorpay_order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await apiClient.post('/auth/subscriptions/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.status === 'SUCCESS' || verifyRes.status === 200) {
              setSuccessMessage('Payment Verified! Account Upgraded to PRO.');
              await useSubscriptionStore.getState().fetchSubscriptionStatus();
              setTimeout(() => {
                setSuccessMessage(null);
                closePaywall();
              }, 2000);
            }
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr);
            alert(verifyErr?.response?.data?.detail || 'Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: {
          color: '#00e599',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        alert('Payment Failed: ' + (resp.error.description || 'Transaction declined'));
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error('Razorpay Checkout error:', err);
      alert(err?.response?.data?.detail || 'Failed to initialize payment checkout. Please try again.');
      setLoading(false);
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
          padding: '16px',
          backgroundColor: 'rgba(5, 7, 13, 0.82)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '540px',
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #0b1120 0%, #070a14 100%)',
            border: '1px solid rgba(0, 229, 153, 0.25)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 229, 153, 0.15)',
            padding: '24px',
            overflow: 'hidden',
          }}
        >
          {/* Top Decorative Banner Accent */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, #00e599, #10b981, #00e599)',
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
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              padding: '6px',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(0, 229, 153, 0.1)',
                border: '1px solid rgba(0, 229, 153, 0.3)',
                color: '#00e599',
                fontSize: '11.5px',
                fontWeight: 700,
                marginBottom: '10px',
              }}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>UNRESTRICTED TRADING ACCESS</span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
              Upgrade to Trade Discipline PRO
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, padding: '0 10px' }}>
              {paywallReason === 'trade_limit'
                ? `You have executed ${tradesCount} of ${maxFree} free trades. Upgrade to PRO to unlock 15 portfolios.`
                : 'Unlock maximum portfolios, advanced AI Execution Agents, and real-time alerts.'}
            </p>
          </div>

          {/* Core Content Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 0.9fr',
              gap: '14px',
              marginBottom: '20px',
            }}
          >
            {/* Left Column: Progress & Core Features */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Usage Progress Meter */}
              <div style={{ marginBottom: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#94a3b8',
                    marginBottom: '5px',
                  }}
                >
                  <span>Trade Limit Used</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>
                    {tradesCount} / {maxFree}
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (tradesCount / maxFree) * 100)}%`,
                      background:
                        tradesCount >= maxFree
                          ? 'linear-gradient(90deg, #00e599, #ef4444)'
                          : 'linear-gradient(90deg, #00e599, #10b981)',
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
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#f1f5f9' }}>
                          {item.title}
                        </div>
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
                  border:
                    selectedPlan === 'annual'
                      ? '2px solid #00e599'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  background:
                    selectedPlan === 'annual' ? 'rgba(0, 229, 153, 0.08)' : 'rgba(15, 23, 42, 0.5)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    Annual Billing
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                    $19{' '}
                    <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>/mo</span>
                  </div>
                </div>

                <span
                  style={{
                    background: '#00e599',
                    color: '#000',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
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
                  border:
                    selectedPlan === 'monthly'
                      ? '2px solid #00e599'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  background:
                    selectedPlan === 'monthly'
                      ? 'rgba(0, 229, 153, 0.08)'
                      : 'rgba(15, 23, 42, 0.5)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                    Monthly Billing
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                    $29{' '}
                    <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748b' }}>/mo</span>
                  </div>
                </div>

                <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 600 }}>
                  Flexible
                </span>
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '12px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                background: 'rgba(0, 229, 153, 0.15)',
                border: '1px solid rgba(0, 229, 153, 0.3)',
                color: '#6ee7b7',
                borderRadius: '10px',
                padding: '10px',
                fontSize: '12px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action Upgrade Button */}
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading || loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #00e599 0%, #10b981 100%)',
              color: '#0b1120',
              fontSize: '14.5px',
              fontWeight: 800,
              cursor: isUpgrading || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px -4px rgba(0, 229, 153, 0.4)',
              opacity: isUpgrading || loading ? 0.7 : 1,
            }}
          >
            {isUpgrading || loading ? (
              <span>Initializing Razorpay Checkout...</span>
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
