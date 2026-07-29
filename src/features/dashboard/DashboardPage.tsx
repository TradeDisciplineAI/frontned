import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import type { UserResponse } from '@/features/auth/auth.types';
import { PortfolioView } from '@/components/PortfolioView';
import { Sidebar } from '@/components/Sidebar';
import { TradingViewChart } from '@/components/TradingViewChart';
import { usePriceAlertStore } from '@/stores/priceAlertStore';
import '@/styles/components/dashboard.css';

interface DashboardPageProps {
  user: UserResponse | null;
  onLogout: () => void;
}

/**
 * DashboardPage — Post-login dashboard landing.
 */
export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const { toggleDrawer, alerts } = usePriceAlertStore();
  const activeAlertsCount = alerts.filter((a) => !a.is_triggered).length;

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>
                Welcome back, {user?.username || 'Trader'}!
              </h1>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: '1rem' }}>
                Monitor and manage your active stock portfolios in real-time.
              </p>
            </div>

            <button
              onClick={toggleDrawer}
              style={{
                background: 'rgba(0, 229, 153, 0.1)',
                border: '1px solid rgba(0, 229, 153, 0.3)',
                color: '#00e599',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title="View Active Alarms"
            >
              <Bell size={16} strokeWidth={2.5} /> Alarms ({activeAlertsCount})
            </button>
          </div>

          <TradingViewChart symbol={selectedStock} />

          <PortfolioView onSelectStock={setSelectedStock} />
        </div>
      </main>
    </div>
  );
};
