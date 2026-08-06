import React from 'react';
import { TrendingUp } from 'lucide-react';
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

        <div className="banner-image-container" style={{ width: '100%', margin: '40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Mock Terminal Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(22, 32, 50, 0.4) 0%, rgba(11, 17, 32, 0.6) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Window bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>TERMINAL PREVIEW</span>
            </div>

            {/* Sparkline & details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ACTIVE POSITION</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>AAPL · US Equity</div>
              </div>
              <span style={{ background: 'rgba(0, 229, 153, 0.15)', color: '#00e599', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>+4.82%</span>
            </div>

            <div style={{ height: '80px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingBottom: '10px', position: 'relative' }}>
              {/* Draw a CSS bar chart / sparkline */}
              {[40, 50, 45, 60, 55, 70, 65, 80, 75, 95].map((val, i) => (
                <div key={i} style={{ flex: 1, height: `${val}%`, background: 'linear-gradient(to top, rgba(0, 229, 153, 0.15), rgba(0, 229, 153, 0.55))', borderRadius: '2px' }} />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', fontSize: '11px', color: '#64748b' }}>
              <span>Entry: $182.40</span>
              <span>Current: $191.20</span>
              <span style={{ color: '#00e599', fontWeight: 700 }}>P&L: +$8.80</span>
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
