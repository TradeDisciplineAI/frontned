import React from 'react';
import type { UserResponse } from '@/features/auth/auth.types';
import { PortfolioView } from '@/components/PortfolioView';
import '@/styles/components/dashboard.css';

interface DashboardPageProps {
  user: UserResponse | null;
  onLogout: () => void;
}

/**
 * DashboardPage — Post-login dashboard landing.
 */
export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--color-bg-primary)',
        color: '#f3f4f6',
      }}
    >
      {/* Sidebar Panel */}
      <aside
        style={{
          width: '320px',
          background: 'var(--color-bg-secondary)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--color-border-subtle)',
          padding: '30px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div>
          {/* Brand Header */}
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--color-brand-teal)',
                boxShadow: '0 0 10px var(--color-brand-teal)',
              }}
            />
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '0.05em',
                color: '#ffffff',
              }}
            >
              TRADING COPILOT
            </h2>
          </div>

          {/* User Session Status */}
          <div
            style={{
              marginBottom: '24px',
              padding: '16px',
              background: 'rgba(13, 148, 136, 0.08)',
              border: '1px solid rgba(13, 148, 136, 0.2)',
              borderRadius: '12px',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                color: 'var(--color-brand-teal)',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              Session Status
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: user ? '#10b981' : '#ef4444',
                }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {user ? 'Logged In' : 'Not Logged In'}
              </span>
            </div>
          </div>

          {/* Profile Card */}
          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#9ca3af',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
              >
                Trader Profile
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  borderRadius: '12px',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong style={{ color: '#9ca3af' }}>User:</strong> {user.username}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem', wordBreak: 'break-all' }}>
                  <strong style={{ color: '#9ca3af' }}>Email:</strong> {user.email}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong style={{ color: '#9ca3af' }}>Role:</strong> {user.role}
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong style={{ color: '#9ca3af' }}>Verified:</strong>{' '}
                  {user.is_verified ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="logout-btn"
          onClick={onLogout}
          style={{
            width: '100%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            e.currentTarget.style.borderColor = '#ef4444';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>
            Welcome back, {user?.username || 'Trader'}!
          </h1>
          <p style={{ color: '#9ca3af', margin: '0 0 32px 0', fontSize: '1rem' }}>
            Monitor and manage your active stock portfolios in real-time.
          </p>

          <PortfolioView />
        </div>
      </main>
    </div>
  );
};
