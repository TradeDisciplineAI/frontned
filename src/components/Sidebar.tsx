import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap,
  Search,
  LayoutGrid,
  PieChart,
  LineChart,
  Bot,
  Globe,
  Settings,
  LogOut,
  ShieldAlert,
  Briefcase,
} from 'lucide-react';
import type { UserResponse } from '@/features/auth/auth.types';
import { ROUTES } from '@/constants/routes.constants';
import { useUserStore } from '@/stores/userStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import '@/styles/components/sidebar.css';

interface SidebarProps {
  user: UserResponse | null;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  onLogout,
  isOpen = false,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { status, fetchSubscriptionStatus } = useSubscriptionStore();

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user, fetchSubscriptionStatus]);

  const isExploreActive = location.pathname === ROUTES.EXPLORE;
  const isDashboardActive = location.pathname === ROUTES.DASHBOARD;
  const isPositionsActive = location.pathname === ROUTES.POSITIONS || location.pathname.startsWith('/portfolio/positions');
  const isProposalsActive = location.pathname === ROUTES.PROPOSALS;

  const isLoggedIn = !!user;
  const username = isLoggedIn ? user?.username || 'Anjal Dev VK' : 'Guest Terminal';
  const isPro = status?.is_pro ?? false;

  return (
    <aside className={`vercel-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      {/* Scrollable Navigation Area */}
      <div className="sidebar-scrollable-content">
        {/* Top Workspace Header Selector */}
        <div className="sidebar-workspace-bar">
          <div className="sidebar-workspace-info">
            <div className="sidebar-workspace-avatar">
              <Zap size={12} strokeWidth={2.5} />
            </div>
            <span className="sidebar-workspace-name">{username}</span>
          </div>
          {isLoggedIn ? (
            isPro ? (
              <span className="sidebar-workspace-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                PRO
              </span>
            ) : (
              <span className="sidebar-workspace-badge" style={{ background: 'rgba(0, 229, 153, 0.1)', color: '#00e599', border: '1px solid rgba(0, 229, 153, 0.2)' }}>
                FREE
              </span>
            )
          ) : (
            <span className="sidebar-workspace-badge" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>Guest</span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px',
                fontSize: '1.25rem',
                lineHeight: 1,
              }}
              className="sidebar-close-mobile-btn"
            >
              &times;
            </button>
          )}
        </div>

        {/* Search Input Box */}
        <div className="sidebar-search-box">
          <div className="sidebar-search-placeholder">
            <Search size={13} strokeWidth={2} />
            <span>Find</span>
          </div>
          <span className="sidebar-search-key">F</span>
        </div>

        {/* Sidebar Navigation */}
        <div className="sidebar-nav-list">
          <button
            className={`sidebar-nav-item ${isExploreActive ? 'active' : ''}`}
            onClick={() => navigate(ROUTES.EXPLORE)}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <LayoutGrid size={15} strokeWidth={2} />
              </span>
              <span>Explore Markets</span>
            </div>
          </button>

          <button
            className={`sidebar-nav-item ${isDashboardActive ? 'active' : ''}`}
            onClick={() => (isLoggedIn ? navigate(ROUTES.DASHBOARD) : useUserStore.getState().openGuestModal())}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <PieChart size={15} strokeWidth={2} />
              </span>
              <span>Portfolio</span>
            </div>
          </button>

          <button
            className={`sidebar-nav-item ${isPositionsActive ? 'active' : ''}`}
            onClick={() => (isLoggedIn ? navigate(ROUTES.POSITIONS) : useUserStore.getState().openGuestModal())}
            data-testid="sidebar-nav-positions"
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <Briefcase size={15} strokeWidth={2} />
              </span>
              <span>Paper Positions</span>
            </div>
          </button>

          <button
            className={`sidebar-nav-item ${isProposalsActive ? 'active' : ''}`}
            onClick={() => (isLoggedIn ? navigate(ROUTES.PROPOSALS) : useUserStore.getState().openGuestModal())}
            data-testid="sidebar-nav-proposals"
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <ShieldAlert size={15} strokeWidth={2} />
              </span>
              <span>Trade Proposals</span>
            </div>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => (isLoggedIn ? null : useUserStore.getState().openGuestModal())}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <LineChart size={15} strokeWidth={2} />
              </span>
              <span>Analytics</span>
            </div>
          </button>

          <button
            className="sidebar-nav-item"
            onClick={() => (isLoggedIn ? null : useUserStore.getState().openGuestModal())}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <Bot size={15} strokeWidth={2} />
              </span>
              <span>AI Discipline</span>
            </div>
            <span className="sidebar-badge-beta">Beta</span>
          </button>

          <div className="sidebar-divider" />

          <button className="sidebar-nav-item">
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <Globe size={15} strokeWidth={2} />
              </span>
              <span>Global Feeds</span>
            </div>
          </button>

          <button
            className={`sidebar-nav-item ${location.pathname === ROUTES.SETTINGS ? 'active' : ''}`}
            onClick={() => (isLoggedIn ? navigate(ROUTES.SETTINGS) : useUserStore.getState().openGuestModal())}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <Settings size={15} strokeWidth={2} />
              </span>
              <span>Settings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Pinned Logout Button at Bottom of Sidebar */}
      <div className="sidebar-pinned-bottom">
        {isLoggedIn ? (
          <button className="sidebar-logout-full-btn" onClick={onLogout}>
            <LogOut size={14} strokeWidth={2} />
            <span>Log Out</span>
          </button>
        ) : (
          <button
            className="sidebar-logout-full-btn"
            onClick={() => navigate(ROUTES.LOGIN)}
            style={{ background: '#00e599', color: '#0b1120', fontWeight: 600 }}
          >
            <Zap size={14} strokeWidth={2} fill="#0b1120" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
};
