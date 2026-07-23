import React from 'react';
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
} from 'lucide-react';
import type { UserResponse } from '@/features/auth/auth.types';
import { ROUTES } from '@/constants/routes.constants';
import '@/styles/components/sidebar.css';

interface SidebarProps {
  user: UserResponse | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isExploreActive = location.pathname === ROUTES.EXPLORE;
  const isDashboardActive = location.pathname === ROUTES.DASHBOARD;

  const username = user?.username || 'Anjal Dev VK';

  return (
    <aside className="vercel-sidebar">
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
          <span className="sidebar-workspace-badge">Pro</span>
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
            onClick={() => navigate(ROUTES.DASHBOARD)}
          >
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <PieChart size={15} strokeWidth={2} />
              </span>
              <span>Portfolio</span>
            </div>
          </button>

          <button className="sidebar-nav-item">
            <div className="sidebar-item-left">
              <span className="sidebar-item-icon">
                <LineChart size={15} strokeWidth={2} />
              </span>
              <span>Analytics</span>
            </div>
          </button>

          <button className="sidebar-nav-item">
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

          <button className="sidebar-nav-item">
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
        <button className="sidebar-logout-full-btn" onClick={onLogout}>
          <LogOut size={14} strokeWidth={2} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
