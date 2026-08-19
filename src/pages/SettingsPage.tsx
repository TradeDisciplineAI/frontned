import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Crown,
  Bell,
  Shield,
  Sparkles,
  CheckCircle2,
  Menu,
  Monitor,
  Smartphone,
  Laptop,
  Terminal,
  ShieldCheck,
  AlertOctagon,
  RotateCw,
  LogOut,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useUserStore } from '@/stores/userStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { authService } from '@/features/auth/auth.service';
import type { UserSessionResponse } from '@/features/auth/auth.types';
import { ROUTES } from '@/constants/routes.constants';

interface MenuItem {
  id: 'profile' | 'subscription' | 'notifications' | 'security';
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  desc: string;
  badge?: string;
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, logoutAll } = useUserStore();
  const { status, fetchSubscriptionStatus, openPaywall } = useSubscriptionStore();

  const [activeTab, setActiveTab] = useState<MenuItem['id']>('profile');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLogoutAllModalOpen, setIsLogoutAllModalOpen] = useState(false);

  // Active Sessions state
  const [sessions, setSessions] = useState<UserSessionResponse[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  // Preference Toggles State
  const [emailAlerts, setEmailAlerts] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pref_email_alerts');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [audioChimes, setAudioChimes] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pref_audio_chimes');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user, fetchSubscriptionStatus]);

  const fetchSessions = async () => {
    setIsSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await authService.getSessions();
      setSessions(data || []);
    } catch (err: any) {
      console.error('Failed to fetch sessions', err);
      setSessionsError('Unable to load sessions.');
    } finally {
      setIsSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'security') {
      fetchSessions();
    }
  }, [user, activeTab]);

  const handleRevokeSession = async (sessionId: string) => {
    const targetSession = sessions.find((s) => s.id === sessionId);
    setRevokingSessionId(sessionId);
    try {
      await authService.revokeSession(sessionId);
      if (targetSession?.is_current) {
        showSavedNotification('Current session revoked. Logging out...');
        await logout();
        navigate(ROUTES.LOGIN);
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showSavedNotification('Session revoked successfully.');
    } catch (err) {
      console.error('Failed to revoke session', err);
      showSavedNotification('Failed to revoke session.');
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    try {
      await logoutAll();
      navigate(ROUTES.LOGIN);
    } catch (err) {
      console.error('Logout all failed', err);
      setIsLoggingOutAll(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const showSavedNotification = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const isPro = status?.is_pro ?? false;
  const tradesCount = status?.trades_count ?? 0;
  const maxFree = status?.max_free_trades ?? 6;

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'Profile & Account',
      icon: User,
      desc: 'Personal details & credentials',
    },
    {
      id: 'subscription',
      label: 'Subscription & Plans',
      icon: Crown,
      desc: 'Current tier & trade limits',
      badge: isPro ? 'PRO' : 'FREE',
    },
    {
      id: 'notifications',
      label: 'Notifications & Alerts',
      icon: Bell,
      desc: 'Email digests & Web Audio chimes',
    },
    {
      id: 'security',
      label: 'Security & Sessions',
      icon: Shield,
      desc: 'Active sessions & device security',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#000000',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <style>{`
        .settings-main-container {
          margin-left: 280px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 100vh;
          background: #000000;
        }
        .settings-grid-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 28px;
          padding: 32px;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }
        .mobile-top-bar {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          background: #000000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        @media (max-width: 1024px) {
          .settings-main-container {
            margin-left: 0;
          }
          .mobile-top-bar {
            display: flex;
          }
          .settings-grid-layout {
            grid-template-columns: 1fr;
            padding: 20px 16px;
          }
        }
      `}</style>

      {/* Sidebar Panel */}
      <Sidebar
        user={user}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Settings Content Area - Shifted 240px to account for sidebar */}
      <div className="settings-main-container">
        {/* Mobile Header Bar */}
        <div className="mobile-top-bar">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Menu className="w-5 h-5 text-emerald-400" />
            <span style={{ fontWeight: 700, fontSize: '14px' }}>Menu</span>
          </button>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#00e599' }}>Settings</span>
        </div>

        {/* Page Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.5px',
                color: '#f8fafc',
              }}
            >
              Account Settings
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
              Manage your personal credentials, subscription tier, and trading preferences.
            </p>
          </div>

          {savedFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'rgba(0, 229, 153, 0.15)',
                border: '1px solid rgba(0, 229, 153, 0.3)',
                color: '#00e599',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{savedFeedback}</span>
            </motion.div>
          )}
        </header>

        {/* Settings Body Grid */}
        <div className="settings-grid-layout">
          {/* Left Sub-Navigation Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: isActive
                      ? '1px solid rgba(0, 229, 153, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.05)',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(0, 229, 153, 0.12), rgba(16, 185, 129, 0.06))'
                      : 'rgba(15, 23, 42, 0.5)',
                    color: isActive ? '#00e599' : '#cbd5e1',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon className="w-4 h-4" style={{ color: isActive ? '#00e599' : '#64748b' }} />
                    <span style={{ fontSize: '13px', fontWeight: isActive ? 700 : 500 }}>
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background:
                          item.badge === 'PRO'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(0, 229, 153, 0.1)',
                        color: item.badge === 'PRO' ? '#fbbf24' : '#00e599',
                        border:
                          item.badge === 'PRO'
                            ? '1px solid rgba(245, 158, 11, 0.4)'
                            : '1px solid rgba(0, 229, 153, 0.2)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Section Content Panel */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '18px',
              padding: '28px',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* TAB 1: PROFILE DETAILS */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                    User Profile Details
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                    Your primary account identity details on AI Trading Discipline Copilot.
                  </p>
                </div>

                <div
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}
                >
                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '14px',
                      padding: '16px',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      Username
                    </label>
                    <div
                      style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginTop: '4px' }}
                    >
                      {user?.username || 'Anjal Dev VK'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '14px',
                      padding: '16px',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      Email Address
                    </label>
                    <div style={{ fontSize: '14px', color: '#e2e8f0', marginTop: '4px' }}>
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(30, 41, 59, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '14px',
                      padding: '16px',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      Role & Permissions
                    </label>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#00e599',
                        marginTop: '4px',
                        textTransform: 'capitalize',
                      }}
                    >
                      {user?.role || 'user'}
                    </div>
                  </div>

                  {user?.is_verified !== undefined && (
                    <div
                      style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '14px',
                        padding: '16px',
                      }}
                    >
                      <label
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                        }}
                      >
                        Verification Status
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '4px',
                          color: user?.is_verified ? '#34d399' : '#f87171',
                          fontSize: '14px',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{user?.is_verified ? 'Email Verified' : 'Email Unverified'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: SUBSCRIPTION & PLANS */}
            {activeTab === 'subscription' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                    Subscription & Usage Plans
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                    Manage your trade execution capacity, subscription plan, and billing options.
                  </p>
                </div>

                {/* Tier Card */}
                <div
                  style={{
                    background: isPro
                      ? 'linear-gradient(135deg, rgba(0, 229, 153, 0.12), rgba(15, 23, 42, 0.8))'
                      : 'rgba(30, 41, 59, 0.4)',
                    border: isPro
                      ? '1px solid rgba(0, 229, 153, 0.35)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 700,
                        }}
                      >
                        Current Active Subscription
                      </span>
                      <h2
                        style={{
                          fontSize: '24px',
                          fontWeight: 800,
                          margin: '4px 0 0 0',
                          color: isPro ? '#00e599' : '#fff',
                        }}
                      >
                        {isPro ? '👑 PRO Tier Active' : '⚡ Free Standard Tier'}
                      </h2>
                    </div>

                    <span
                      style={{
                        padding: '6px 16px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 800,
                        background: 'rgba(0, 229, 153, 0.15)',
                        color: '#00e599',
                        border: '1px solid rgba(0, 229, 153, 0.3)',
                      }}
                    >
                      {isPro ? 'UNLIMITED TRADES' : '6 TRADES CAP'}
                    </span>
                  </div>

                  {!isPro && (
                    <div style={{ marginBottom: '20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#cbd5e1',
                          marginBottom: '8px',
                        }}
                      >
                        <span>Trade Execution Capacity</span>
                        <span style={{ color: tradesCount >= maxFree ? '#ef4444' : '#00e599' }}>
                          {tradesCount} / {maxFree} Free Trades Used
                        </span>
                      </div>
                      <div
                        style={{
                          height: '8px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, (tradesCount / maxFree) * 100)}%`,
                            background:
                              tradesCount >= maxFree
                                ? 'linear-gradient(90deg, #00e599, #ef4444)'
                                : 'linear-gradient(90deg, #00e599, #10b981)',
                            borderRadius: '9999px',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {!isPro ? (
                    <button
                      onClick={() => openPaywall('manual')}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '14px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #00e599 0%, #10b981 100%)',
                        color: '#0b1120',
                        fontSize: '15px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 8px 20px -4px rgba(0, 229, 153, 0.4)',
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Upgrade to Pro Plan ($19/mo)</span>
                    </button>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#00e599',
                        fontSize: '14px',
                        fontWeight: 700,
                      }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>
                        Your account is upgraded to PRO. All trade limits & risk guards are
                        unlocked!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                    Notification Preferences
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                    Control how and when you receive price target alerts and trading discipline
                    digests.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: 'rgba(30, 41, 59, 0.4)',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                        Resend Email Price Target Alerts
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Receive instant email when your stock target price triggers.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEmailAlerts(checked);
                        try {
                          localStorage.setItem('pref_email_alerts', JSON.stringify(checked));
                          showSavedNotification('Notification preference updated.');
                        } catch (err) {
                          console.error('Failed to save email alert preference:', err);
                        }
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#00e599',
                        cursor: 'pointer',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: 'rgba(30, 41, 59, 0.4)',
                      borderRadius: '14px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                        Web Audio Chime Sound
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Play audio chime when WebSocket receives live target trigger.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={audioChimes}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAudioChimes(checked);
                        try {
                          localStorage.setItem('pref_audio_chimes', JSON.stringify(checked));
                          showSavedNotification('Web audio preference updated.');
                        } catch (err) {
                          console.error('Failed to save audio chime preference:', err);
                        }
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#00e599',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SECURITY & ACTIVE SESSIONS */}
            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                          SECURITY CENTER
                        </h3>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#10b981',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: '#10b981',
                              boxShadow: '0 0 8px #10b981',
                            }}
                          />
                          SESSION MONITORING ACTIVE
                        </span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                        Manage where your account is currently signed in.
                      </p>
                    </div>

                    {!isSessionsLoading && !sessionsError && (
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#60a5fa',
                          background: 'rgba(59, 130, 246, 0.12)',
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                          padding: '4px 12px',
                          borderRadius: '8px',
                        }}
                        data-testid="active-sessions-count-badge"
                      >
                        {sessions.length} ACTIVE {sessions.length === 1 ? 'SESSION' : 'SESSIONS'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Revoke All Sessions Controls */}
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '14px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                      Revoke All Active Sessions
                    </h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                      Sign out across all devices and browsers immediately.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLogoutAllModalOpen(true)}
                    disabled={isLoggingOutAll}
                    data-testid="logout-all-btn"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '9px 18px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: isLoggingOutAll ? 'not-allowed' : 'pointer',
                      opacity: isLoggingOutAll ? 0.6 : 1,
                      transition: 'all 0.18s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                    }}
                  >
                    <LogOut size={14} />
                    {isLoggingOutAll ? 'Logging out...' : 'Log Out All Sessions'}
                  </button>
                </div>

                {/* Active Sessions List Container */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', letterSpacing: '-0.01em' }}>
                    Active Sessions
                  </h4>

                  {isSessionsLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} data-testid="sessions-loading-state">
                      <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: 4 }}>Loading sessions...</div>
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            background: 'rgba(10, 16, 32, 0.65)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '14px',
                            padding: '20px',
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center',
                          }}
                        >
                          <div className="pulse-box" style={{ width: 44, height: 44, borderRadius: 12 }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div className="pulse-box" style={{ width: 160, height: 18 }} />
                            <div className="pulse-box" style={{ width: 240, height: 14 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : sessionsError ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '32px 20px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '14px',
                        gap: '12px',
                      }}
                      data-testid="sessions-error-state"
                    >
                      <AlertOctagon size={24} color="#ef4444" />
                      <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 700 }}>
                        Unable to load active sessions.
                      </span>
                      <button
                        type="button"
                        onClick={fetchSessions}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px 20px',
                        background: 'rgba(10, 16, 32, 0.65)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '14px',
                        textAlign: 'center',
                        gap: '12px',
                      }}
                      data-testid="sessions-empty-state"
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ShieldCheck size={24} color="#3b82f6" />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                        NO ACTIVE SESSIONS
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', maxWidth: '300px' }}>
                        Your account has no active sessions.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} data-testid="active-sessions-list">
                      {sessions.map((sess, idx) => {
                        const getIcon = () => {
                          const info = `${sess.device_name || ''} ${sess.user_agent || ''}`.toLowerCase();
                          if (info.includes('mac') || info.includes('apple')) return Laptop;
                          if (info.includes('win') || info.includes('windows')) return Monitor;
                          if (info.includes('linux') || info.includes('ubuntu')) return Terminal;
                          if (info.includes('android') || info.includes('iphone') || info.includes('mobile')) return Smartphone;
                          return Monitor;
                        };
                        const DeviceIcon = getIcon();

                        return (
                          <motion.div
                            key={sess.id}
                            data-testid={`session-card-${sess.id}`}
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.24, delay: idx * 0.05 }}
                            style={{
                              background: 'rgba(10, 16, 32, 0.65)',
                              backdropFilter: 'blur(12px)',
                              border: sess.is_current
                                ? '1px solid rgba(16, 185, 129, 0.35)'
                                : '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '14px',
                              padding: '20px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '20px',
                              boxShadow: sess.is_current
                                ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.08)'
                                : '0 4px 16px rgba(0, 0, 0, 0.3)',
                              flexWrap: 'wrap',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 12,
                                  background: sess.is_current ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.1)',
                                  border: sess.is_current
                                    ? '1px solid rgba(16, 185, 129, 0.3)'
                                    : '1px solid rgba(59, 130, 246, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: sess.is_current ? '#10b981' : '#60a5fa',
                                  flexShrink: 0,
                                }}
                              >
                                <DeviceIcon size={20} />
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                                    {sess.device_name || sess.user_agent || 'Terminal Session'}
                                  </span>
                                  {sess.is_current ? (
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        padding: '2px 8px',
                                        borderRadius: '9999px',
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: '#10b981',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: 5,
                                          height: 5,
                                          borderRadius: '50%',
                                          background: '#10b981',
                                          boxShadow: '0 0 6px #10b981',
                                        }}
                                      />
                                      CURRENT SESSION
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '9999px',
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        color: '#94a3b8',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                      }}
                                    >
                                      Active
                                    </span>
                                  )}
                                </div>

                                {sess.ip_address && (
                                  <span style={{ fontSize: '12px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                                    IP: {sess.ip_address}
                                  </span>
                                )}

                                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                  <span>Created: {new Date(sess.created_at).toLocaleString()}</span>
                                  {sess.last_used_at && (
                                    <span>Last Active: {new Date(sess.last_used_at).toLocaleString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRevokeSession(sess.id)}
                              disabled={revokingSessionId === sess.id}
                              data-testid={`revoke-session-btn-${sess.id}`}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: revokingSessionId === sess.id ? 'not-allowed' : 'pointer',
                                opacity: revokingSessionId === sess.id ? 0.6 : 1,
                                transition: 'all 0.18s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              {revokingSessionId === sess.id ? (
                                <>
                                  <RotateCw size={13} className="animate-spin" /> Revoking...
                                </>
                              ) : (
                                'Revoke Session'
                              )}
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout All Confirmation Modal */}
      {isLogoutAllModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 8, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setIsLogoutAllModalOpen(false)}
          data-testid="logout-all-modal-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0a1020',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <AlertOctagon size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                  LOG OUT ALL SESSIONS
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                  Sign out of all active sessions across all devices immediately?
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsLogoutAllModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsLogoutAllModalOpen(false);
                  await handleLogoutAll();
                }}
                data-testid="confirm-logout-all-btn"
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Log Out All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
