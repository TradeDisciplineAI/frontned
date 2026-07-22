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
    <main
      className="dashboard-page"
      style={{
        padding: '40px 20px',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className="dashboard-content"
        style={{ width: '100%', maxWidth: '900px', textAlign: 'center' }}
      >
        <h1 className="dashboard-title">Welcome, {user?.username || 'Trader'}!</h1>
        <p className="dashboard-subtitle" style={{ color: '#9ca3af', marginBottom: '24px' }}>
          You have successfully logged in to AI Trading Discipline Copilot.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'stretch',
          }}
        >
          {/* Profile Card */}
          {user && (
            <div
              style={{
                flex: '1 1 300px',
                padding: '24px',
                background: 'rgba(17, 24, 39, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                textAlign: 'left',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3
                  style={{
                    marginBottom: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    paddingBottom: '8px',
                    color: '#60a5fa',
                    fontWeight: 700,
                  }}
                >
                  Profile Details
                </h3>
                <p style={{ margin: '8px 0' }}>
                  <strong>Email:</strong> {user.email}
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Role:</strong> {user.role}
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Verified:</strong> {user.is_verified ? '✅ Yes' : '❌ No'}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '16px' }}>
                  Account created: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              <button
                type="button"
                className="logout-btn"
                onClick={onLogout}
                style={{
                  marginTop: '24px',
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  padding: '10px',
                  borderRadius: '8px',
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
            </div>
          )}

          {/* Portfolio Management Card */}
          <div style={{ flex: '2 1 500px', textAlign: 'left' }}>
            <PortfolioView />
          </div>
        </div>
      </div>
    </main>
  );
};
