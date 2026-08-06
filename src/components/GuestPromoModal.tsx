import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { ROUTES } from '@/constants/routes.constants';
import { Bot, ArrowRight } from 'lucide-react';

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
            padding: '16px',
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
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
              background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 229, 153, 0.05)',
              overflow: 'hidden',
            }}
          >
            {/* Visual gradient highlight */}
            <div
              style={{
                position: 'absolute',
                top: '-20%',
                left: '-20%',
                width: '50%',
                height: '50%',
                background: 'radial-gradient(circle, rgba(0, 229, 153, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(0, 229, 153, 0.1)',
                  color: '#00e599',
                  marginBottom: '12px',
                  border: '1px solid rgba(0, 229, 153, 0.2)',
                }}
              >
                <Bot size={22} />
              </div>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Create Your Free Account
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                Join to unlock full portfolio analytics and AI behavioral tracking.
              </p>
            </div>

            {/* Value Props Checklist */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '24px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#f1f5f9' }}>
                <span style={{ color: '#00e599', fontWeight: 'bold' }}>✓</span>
                <span>📊 Real-time Portfolio Tracking</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#f1f5f9' }}>
                <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>✓</span>
                <span>🧠 AI Technical & Risk Signals</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#f1f5f9' }}>
                <span style={{ color: '#eab308', fontWeight: 'bold' }}>✓</span>
                <span>🤖 AI Behavioral Trading Coach</span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleAction(ROUTES.LOGIN)}
                style={{
                  width: '100%',
                  background: '#00e599',
                  color: '#0b1120',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 10px rgba(0, 229, 153, 0.2)',
                }}
              >
                <span>Create Account</span>
                <ArrowRight size={13} />
              </button>

              <button
                onClick={() => handleAction(ROUTES.LOGIN)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13.5px',
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
                  borderRadius: '8px',
                  padding: '6px',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginTop: '2px',
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
