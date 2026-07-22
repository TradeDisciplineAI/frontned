import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { UserResponse } from '@/features/auth/auth.types';
import { ROUTES } from '@/constants/routes.constants';

interface SidebarProps {
  user: UserResponse | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardActive = location.pathname === ROUTES.DASHBOARD;
  const isExploreActive = location.pathname === ROUTES.EXPLORE;

  return (
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
        minHeight: '100vh',
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

        {/* Navigation Links */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              color: '#9ca3af',
              fontWeight: 700,
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            Navigation
          </div>

          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              background: isDashboardActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: isDashboardActive
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid transparent',
              color: isDashboardActive ? '#ffffff' : '#9ca3af',
              padding: '10px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              if (!isDashboardActive) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseOut={(e) => {
              if (!isDashboardActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }
            }}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => navigate(ROUTES.EXPLORE)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              background: isExploreActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: isExploreActive
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid transparent',
              color: isExploreActive ? '#ffffff' : '#9ca3af',
              padding: '10px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              if (!isExploreActive) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseOut={(e) => {
              if (!isExploreActive) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }
            }}
          >
            🌍 Explore Markets
          </button>
        </div>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={onLogout}
        style={{
          width: '100%',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          padding: '12px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.95rem',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
        }}
      >
        Logout
      </button>
    </aside>
  );
};
