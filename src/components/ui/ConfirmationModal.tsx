import React, { useEffect, useRef } from 'react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

export const ConfirmationModal: React.FC = () => {
  const { modal, isSubmitting, confirmAction, closeModal, portfolio } = usePortfolioStore();
  const modalRef = useRef<HTMLDivElement>(null);

  const { isOpen, mode, symbol, price, exchange } = modal;

  // Handle Keyboard listeners (Escape, Enter, Tab Trap)
  useEffect(() => {
    if (!isOpen) return;

    // Select all focusable items inside the modal
    const getFocusableElements = () => {
      if (!modalRef.current) return [];
      return Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
    };

    const focusable = getFocusableElements();
    const initialEl = focusable[0];
    if (initialEl) {
      // Focus the first button on open
      initialEl.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!isSubmitting) closeModal();
        return;
      }

      if (e.key === 'Enter') {
        // Only trigger confirmAction if the focus is NOT already on a button (to prevent double-triggering)
        if (document.activeElement?.tagName !== 'BUTTON') {
          e.preventDefault();
          confirmAction();
        }
        return;
      }

      if (e.key === 'Tab') {
        const elements = getFocusableElements();
        if (elements.length === 0) return;

        const firstEl = elements[0];
        const lastEl = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl?.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, closeModal, confirmAction]);

  if (!isOpen) return null;

  const currentUsageCount = portfolio?.holdings?.length || 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        animation: 'modalFadeIn 0.25s ease-out forwards',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-box {
          animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .modal-button-cancel {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #9ca3af;
        }
        .modal-button-cancel:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        .modal-button-confirm-add {
          background: var(--color-brand-teal, #0d9488);
          color: #ffffff;
          border: none;
        }
        .modal-button-confirm-add:hover:not(:disabled) {
          filter: brightness(1.1);
        }
        .modal-button-confirm-remove {
          background: #ef4444;
          color: #ffffff;
          border: none;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.25);
        }
        .modal-button-confirm-remove:hover:not(:disabled) {
          background: #dc2626;
        }
        .spinner {
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-left-color: #ffffff;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        ref={modalRef}
        className="modal-box"
        style={{
          width: '420px',
          background: 'var(--color-bg-secondary, #0f172a)',
          border: '1px solid var(--color-border-subtle, #1e293b)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: '#f3f4f6',
        }}
      >
        {/* Title */}
        <h3
          id="modal-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            margin: '0 0 16px 0',
            color: '#ffffff',
          }}
        >
          {mode === 'add' ? 'Add Stock to Portfolio' : 'Remove Stock'}
        </h3>

        {/* Body content */}
        <div style={{ marginBottom: '24px' }}>
          {mode === 'add' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Stock:</span>
                  <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.05rem' }}>
                    {symbol}
                  </span>
                </div>
                {price !== null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Current Price:</span>
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>${price.toFixed(2)}</span>
                  </div>
                )}
                {exchange && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Exchange:</span>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{exchange}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: '8px',
                    marginTop: '4px',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Current Usage:</span>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--color-brand-teal)',
                    }}
                  >
                    {currentUsageCount} / 5 Holdings
                  </span>
                </div>
              </div>
              <p
                style={{
                  margin: '8px 0 0 0',
                  fontSize: '0.9rem',
                  color: '#cbd5e1',
                  lineHeight: '1.4',
                }}
              >
                Do you want to add this stock to your portfolio?
              </p>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              Are you sure you want to remove <strong style={{ color: '#ffffff' }}>{symbol}</strong>{' '}
              from your portfolio?
            </p>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="modal-button-cancel"
            onClick={closeModal}
            disabled={isSubmitting}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            className={mode === 'add' ? 'modal-button-confirm-add' : 'modal-button-confirm-remove'}
            onClick={confirmAction}
            disabled={isSubmitting}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            {isSubmitting && <div className="spinner" />}
            {isSubmitting
              ? mode === 'add'
                ? 'Adding...'
                : 'Removing...'
              : mode === 'add'
                ? 'Add Stock'
                : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};
