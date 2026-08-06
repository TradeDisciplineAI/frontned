import React from 'react';
import { TrendingUp, CheckCircle2, Bot, BellRing, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';
import '@/styles/components/auth-layout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="auth-screen-wrapper">
      {/* Left Panel: Brand Showcase (Shared across all auth screens) */}
      <div className="auth-left-panel">
        <div
          className="brand-header"
          onClick={() => navigate(ROUTES.HOME)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.HOME)}
          style={{ cursor: 'pointer' }}
          aria-label="Go back to home"
        >
          <div className="brand-logo-icon">
            <TrendingUp size={22} strokeWidth={2.5} />
          </div>
          <span className="brand-logo-text">TradeDisciplineAI</span>
        </div>

        <div className="banner-image-container" style={{ width: '100%', margin: '30px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Glassmorphic Promo Card */}
          <div style={{
            background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(0, 229, 153, 0.03)',
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              PLATFORM FEATURES
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(0, 229, 153, 0.1)', color: '#00e599', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px 0' }}>Real-time Portfolio Tracking</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>Create watchlists, track holdings, and review performance weight allocation.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                <Bot size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px 0' }}>AI Technical & Risk Signals</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>Receive automated support/resistance zones, trend indicators, and confidence ratings.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                <BellRing size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px 0' }}>Smart Price Target Alerts</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>Setup browser audio and email triggers for instant target notifications.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                <ShieldAlert size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px 0' }}>Behavioral Trading Coach</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>Analyze emotional trading, revenge trades, and improve discipline tracking.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="banner-text-content">
          <h2 className="banner-title">
            Trade with Discipline,
            <br />
            Not Emotion.
          </h2>
          <p className="banner-subtitle">
            The AI-driven institutional layer for your personal trading strategy, ensuring every
            move is backed by cold, hard data.
          </p>
        </div>

        <div className="auth-left-footer">
          <div className="secure-badge">
            <span className="shield-icon">⛨</span> SECURE TRADING ENVIRONMENT
          </div>
        </div>
      </div>

      {/* Right Panel: Form Content passed as children */}
      <div className="auth-right-panel">{children}</div>
    </div>
  );
};
