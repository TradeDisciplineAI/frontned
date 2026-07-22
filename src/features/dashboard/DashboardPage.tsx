import React from 'react';
import type { UserResponse } from '@/features/auth/auth.types';
import { PortfolioView } from '@/components/PortfolioView';
import { Sidebar } from '@/components/Sidebar';
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
      <Sidebar user={user} onLogout={onLogout} />

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
