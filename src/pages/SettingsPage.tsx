import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Crown, Bell, CheckCircle2, Menu } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useUserStore } from '@/stores/userStore';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { ROUTES } from '@/constants/routes.constants';

interface MenuItem {
  id: 'profile' | 'subscription' | 'notifications';
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  desc: string;
  badge?: string;
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const { status, fetchSubscriptionStatus, openPaywall } = useSubscriptionStore();

  const [activeTab, setActiveTab] = useState<MenuItem['id']>('profile');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user, fetchSubscriptionStatus]);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const showSavedNotification = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const isPro = status?.is_pro ?? false;

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
          margin-left: 240px;
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
          </div>
        </div>
      </div>
    </div>
  );
};
