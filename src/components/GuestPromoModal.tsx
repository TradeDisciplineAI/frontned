import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { ROUTES } from '@/constants/routes.constants';
import { CheckCircle2, ShieldAlert, Bot, BellRing, ArrowRight } from 'lucide-react';

export const GuestPromoModal: React.FC = () => {
  const navigate = useNavigate();
  const { isGuestModalOpen, closeGuestModal } = useUserStore();

  const handleAction = (targetRoute: string) => {
    closeGuestModal();
    navigate(targetRoute);
  };

  return (
    <AnimatePresence>
      {isGuestModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeGuestModal}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5, 8, 16, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              background: 'linear-gradient(180deg, #162032 0%, #0b1120 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '36px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 229, 153, 0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Visual gradient highlights */}
            <div
              style={{
                position: 'absolute',
                top: '-20%',
                left: '-20%',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, rgba(0, 229, 153, 0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-20%',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '12px',
                  borderRadius: '16px',
                  background: 'rgba(0, 229, 153, 0.1)',
                  color: '#00e599',
                  marginBottom: '16px',
                  border: '1px solid rgba(0, 229, 153, 0.2)',
                }}
              >
                <Bot size={28} />
              </div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Create Your Free Account
              </h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                Join TradeDisciplineAI to supercharge your portfolio with automated discipline tracking.
              </p>
            </div>

            {/* Value Props / Checklist */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '32px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle2 size={16} style={{ color: '#00e599', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px 0' }}>Real-time Portfolio Tracking</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Create a custom portfolio and view weight allocations.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Bot size={16} style={{ color: '#3b82f6', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px 0' }}>AI Portfolio Analysis</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Receive automated risk scores and technical analysis updates.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <BellRing size={16} style={{ color: '#eab308', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px 0' }}>Target Price Alerts</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Configure browser audio and email triggers for thresholds.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <ShieldAlert size={16} style={{ color: '#f43f5e', marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px 0' }}>Behavioral Coaching</h4>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Identify revenge trading patterns and keep emotional control.</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleAction(ROUTES.LOGIN)}
                style={{
                  width: '100%',
                  background: '#00e599',
                  color: '#0b1120',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(0, 229, 153, 0.25)',
                }}
              >
                <span>Create Account</span>
                <ArrowRight size={14} />
              </button>

              <button
                onClick={() => handleAction(ROUTES.LOGIN)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Sign In
              </button>

              <button
                onClick={closeGuestModal}
                style={{
                  width: '100%',
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginTop: '4px',
                  transition: 'color 0.2s',
                }}
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
