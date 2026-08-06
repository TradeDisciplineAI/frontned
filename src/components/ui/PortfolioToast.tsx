import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { ROUTES } from '@/constants/routes.constants';

export const PortfolioToast: React.FC = () => {
  const { toast, closeToast } = usePortfolioStore();
  const navigate = useNavigate();
  const [shouldRender, setShouldRender] = useState(false);

  const { isOpen, type, title, symbol, message, currentUsage } = toast;

  // Handle auto-dismiss and lifecycle rendering
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        closeToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, closeToast]);

  if (!shouldRender) return null;

  const handleActionClick = () => {
    navigate(ROUTES.DASHBOARD);
    closeToast();
  };

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setShouldRender(false);
    }
  };

  const isSuccess = type === 'success';

  return (
    <div
      onAnimationEnd={handleAnimationEnd}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 2500,
        width: '360px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderRadius: '12px',
        border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        color: '#f3f4f6',
        animation: `${isOpen ? 'toastSlideIn' : 'toastSlideOut'} 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
      }}
    >
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes progressBarShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .toast-progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          animation: progressBarShrink 4s linear forwards;
        }
        .toast-close-btn {
          color: #9ca3af;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          line-height: 1;
          padding: 4px;
        }
        .toast-close-btn:hover {
          color: #ffffff;
        }
        .toast-action-btn {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          margin-top: 8px;
          width: fit-content;
        }
        .toast-action-btn:hover {
          background: rgba(16, 185, 129, 0.25);
          color: #ffffff;
        }
      `}</style>

      {/* Progress Bar */}
      <div
        className="toast-progress-bar"
        style={{
          background: isSuccess ? '#10b981' : '#ef4444',
        }}
      />

      <div style={{ padding: '16px 20px', position: 'relative' }}>
        {/* Close Button */}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <button type="button" className="toast-close-btn" onClick={closeToast}>
            &times;
          </button>
        </div>

        {/* Content Details */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Status Icon */}
          <div
            style={{
              fontSize: '1.25rem',
              lineHeight: 1,
              marginTop: '2px',
              color: isSuccess ? '#10b981' : '#ef4444',
            }}
          >
            {isSuccess ? '✓' : '⚠️'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', pr: '16px' }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: isSuccess ? '#10b981' : '#ef4444',
              }}
            >
              {title}
            </span>

            {symbol && (
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#ffffff',
                  marginTop: '2px',
                }}
              >
                {symbol}
              </span>
            )}

            <span style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.4' }}>
              {message}
            </span>

            {isSuccess && symbol && (
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}
              >
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Portfolio Usage: <strong>{currentUsage} / 5 Holdings</strong>
                </span>
                <button type="button" className="toast-action-btn" onClick={handleActionClick}>
                  View Portfolio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
