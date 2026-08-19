import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  AlertOctagon,
  RotateCw,
  LogOut,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useUserStore } from '@/stores/userStore';
import { authService } from '@/features/auth/auth.service';
import type { UserSessionResponse } from '@/features/auth/auth.types';
import { ROUTES } from '@/constants/routes.constants';

import windowsImg from '@/assets/devices/windows_pc.png';
import macbookImg from '@/assets/devices/macbook.png';
import smartphoneImg from '@/assets/devices/smartphone.png';
import linuxImg from '@/assets/devices/linux_pc.png';

export const SecuritySessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, logoutAll } = useUserStore();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<UserSessionResponse[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [isLogoutAllModalOpen, setIsLogoutAllModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchSessions = async () => {
    setIsSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await authService.getSessions();
      setSessions(data || []);
    } catch (err: any) {
      console.error('Failed to fetch sessions', err);
      setSessionsError('Unable to load active sessions.');
    } finally {
      setIsSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const handleRevokeSession = async (sessionId: string) => {
    const targetSession = sessions.find((s) => s.id === sessionId);
    setRevokingSessionId(sessionId);
    try {
      await authService.revokeSession(sessionId);
      if (targetSession?.is_current) {
        showNotification('Current session revoked. Logging out...');
        await logout();
        navigate(ROUTES.LOGIN);
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showNotification('Session revoked successfully.');
    } catch (err) {
      console.error('Failed to revoke session', err);
      showNotification('Failed to revoke session.');
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

  const getDeviceImage = (sess: UserSessionResponse): string => {
    const info = `${sess.device_name || ''} ${sess.user_agent || ''}`.toLowerCase();
    if (info.includes('mac') || info.includes('apple') || info.includes('macintosh')) {
      return macbookImg;
    }
    if (info.includes('android') || info.includes('iphone') || info.includes('mobile') || info.includes('phone')) {
      return smartphoneImg;
    }
    if (info.includes('linux') || info.includes('ubuntu') || info.includes('server')) {
      return linuxImg;
    }
    return windowsImg;
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#000000',
        color: '#f8fafc',
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        .sec-page-container {
          margin-left: 280px;
          flex: 1;
          padding: 36px 40px;
          box-sizing: border-box;
          transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: calc(100% - 280px);
          min-width: 0;
        }

        @media (max-width: 1024px) {
          .sec-page-container {
            margin-left: 0;
            width: 100%;
            padding: 20px 16px;
          }
        }

        .sec-card-responsive {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .sec-card-responsive {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <Sidebar
        user={user}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Responsive Content Container offset from Sidebar */}
      <main className="sec-page-container">
        {/* Mobile Header Bar */}
        <div
          style={{
            padding: '12px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#000000',
            marginBottom: '12px',
          }}
          className="mobile-header-only"
        >
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Menu size={20} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
              Security Center
            </span>
          </button>
        </div>

        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 9999,
              background: 'rgba(16, 185, 129, 0.95)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            }}
          >
            {notification}
          </motion.div>
        )}

        {/* Page Title & Status Banner */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  SECURITY & ACTIVE SESSIONS
                </h1>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px', margin: '6px 0 0 0' }}>
                Real-time security console to review and manage authorized login sessions across all your devices.
              </p>
            </div>

            {!isSessionsLoading && !sessionsError && (
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#60a5fa',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                }}
                data-testid="active-sessions-count-badge"
              >
                {sessions.length} ACTIVE {sessions.length === 1 ? 'SESSION' : 'SESSIONS'}
              </span>
            )}
          </div>
        </div>

        {/* Revoke All Sessions Banner */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '16px',
            padding: '22px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={18} color="#ef4444" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                Revoke All Active Sessions
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
              Sign out across all registered devices and browsers immediately.
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
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isLoggingOutAll ? 'not-allowed' : 'pointer',
              opacity: isLoggingOutAll ? 0.6 : 1,
              transition: 'all 0.18s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
            }}
          >
            <LogOut size={15} />
            {isLoggingOutAll ? 'Logging out...' : 'Log Out All Sessions'}
          </button>
        </div>

        {/* Active Sessions Grid / List */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginBottom: '16px', letterSpacing: '-0.01em' }}>
            Active Sessions Console
          </h3>

          {isSessionsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} data-testid="sessions-loading-state">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(10, 16, 32, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                  }}
                >
                  <div className="pulse-box" style={{ width: 80, height: 80, borderRadius: 14 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="pulse-box" style={{ width: 200, height: 20 }} />
                    <div className="pulse-box" style={{ width: 300, height: 16 }} />
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
                padding: '40px 20px',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '16px',
                gap: '14px',
              }}
              data-testid="sessions-error-state"
            >
              <AlertOctagon size={28} color="#ef4444" />
              <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: 700 }}>
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
                  padding: '8px 18px',
                  fontSize: '13px',
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
                padding: '48px 20px',
                background: 'rgba(10, 16, 32, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px',
                textAlign: 'center',
                gap: '14px',
              }}
              data-testid="sessions-empty-state"
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={28} color="#3b82f6" />
              </div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                NO ACTIVE SESSIONS
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', maxWidth: '320px' }}>
                Your account has no active sessions.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} data-testid="active-sessions-list">
              {sessions.map((sess, idx) => {
                const deviceImgSrc = getDeviceImage(sess);

                return (
                  <motion.div
                    key={sess.id}
                    data-testid={`session-card-${sess.id}`}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.28, delay: idx * 0.06 }}
                    className="sec-card-responsive"
                    style={{
                      background: 'rgba(10, 16, 32, 0.75)',
                      backdropFilter: 'blur(16px)',
                      border: sess.is_current
                        ? '1px solid rgba(16, 185, 129, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '16px',
                      padding: '22px 24px',
                      boxShadow: sess.is_current
                        ? '0 12px 32px rgba(0, 0, 0, 0.5), 0 0 24px rgba(16, 185, 129, 0.12)'
                        : '0 6px 20px rgba(0, 0, 0, 0.35)',
                      transition: 'all 0.22s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0, flex: 1 }}>
                      {/* Transparent Animated Device Container */}
                      <motion.div
                        whileHover={{ scale: 1.08, rotate: 1.5 }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: idx * 0.3 },
                          scale: { duration: 0.2 },
                        }}
                        style={{
                          width: 84,
                          height: 84,
                          borderRadius: 16,
                          background: 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          position: 'relative',
                          filter: sess.is_current
                            ? 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.4))'
                            : 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.3))',
                        }}
                      >
                        <img
                          src={deviceImgSrc}
                          alt={sess.device_name || 'Device'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                          }}
                        />
                      </motion.div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                            {sess.device_name || sess.user_agent || 'Terminal Session'}
                          </span>
                          {sess.is_current && (
                            <span
                              title="Current Session"
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#10b981',
                                boxShadow: '0 0 10px #10b981',
                                display: 'inline-block',
                              }}
                            />
                          )}
                        </div>

                        {sess.ip_address && (
                          <span style={{ fontSize: '13px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                            IP: {sess.ip_address}
                          </span>
                        )}

                        <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: 2 }}>
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
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#ef4444',
                        borderRadius: '8px',
                        padding: '9px 18px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: revokingSessionId === sess.id ? 'not-allowed' : 'pointer',
                        opacity: revokingSessionId === sess.id ? 0.6 : 1,
                        transition: 'all 0.18s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      {revokingSessionId === sess.id ? (
                        <>
                          <RotateCw size={14} className="animate-spin" /> Revoking...
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
      </main>

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
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                <AlertOctagon size={22} />
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
