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
          <span className="brand-logo-text">Copilot AI</span>
        </div>

        <div className="banner-image-container">
          <picture>
            <source srcSet="/trading_banner.webp" type="image/webp" />
            <img
              src="/trading_banner.png"
              alt="AI Trading Terminal Dashboard showing live market data"
              className="banner-image"
              loading="lazy"
            />
          </picture>
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
      <div className="auth-right-panel">
        {children}
      </div>
    </div>
  );
};
