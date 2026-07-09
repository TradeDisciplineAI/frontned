import React from 'react';
import type { UserResponse } from '@/features/auth/auth.types';
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
    <main className="dashboard-page">
      <div className="dashboard-content">
        <h1 className="dashboard-title">
          Welcome, {user?.username || 'Trader'}!
        </h1>
        <p className="dashboard-subtitle">
          You have successfully logged in to AI Trading Discipline Copilot.
        </p>
        
        {user && (
          <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'left', minWidth: '300px' }}>
            <h3 style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
              Profile Details
            </h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Verified:</strong> {user.is_verified ? '✅ Yes' : '❌ No'}</p>
            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '12px' }}>
              Account created: {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        )}

        <button type="button" className="logout-btn" onClick={onLogout} style={{ marginTop: '24px' }}>
          Logout
        </button>
      </div>
    </main>
  );
};
