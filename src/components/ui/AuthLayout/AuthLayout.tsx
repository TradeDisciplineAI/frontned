import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes.constants';
import {
  TrendingUp,
  CheckCircle2,
  Bot,
  BellRing,
  ShieldAlert,
  LineChart,
  PieChart,
  Activity,
  Lock,
  ArrowUpRight,
  Check,
} from 'lucide-react';
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
        <div>
          {/* Logo Header */}
          <div
            className="brand-header"
            onClick={() => navigate(ROUTES.HOME)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.HOME)}
            style={{ cursor: 'pointer' }}
            aria-label="Go back to home"
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #00e599 0%, #3b82f6 100%)',
                color: '#0b1120',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} strokeWidth={3} />
            </div>
            <span className="brand-logo-text">TradeDisciplineAI</span>
          </div>

          {/* Heading Content */}
          <div className="banner-text-content" style={{ marginTop: '24px' }}>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                margin: 0,
                color: '#fff',
              }}
            >
              Trade With Intelligence.<br />
              <span style={{ background: 'linear-gradient(to right, #00e599, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Master Your Discipline.
              </span>
            </h1>
            <p className="banner-subtitle" style={{ fontSize: '15px', marginTop: '10px' }}>
              An AI-powered investment platform combining live market intelligence, portfolio analytics, smart alerts, behavioral coaching, and institutional-grade risk analysis.
            </p>
          </div>
        </div>


        {/* Feature Cards Showcase (2x2 floating glass cards) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', width: '100%', margin: '12px 0' }}>
          {[
            { icon: <CheckCircle2 size={16} />, color: '#00e599', title: 'Live Portfolio Tracking', desc: 'Track holdings and real-time performance.' },
            { icon: <LineChart size={16} />, color: '#3b82f6', title: 'AI Market Analysis', desc: 'Delineate support, resistance, and trends.' },
            { icon: <BellRing size={16} />, color: '#eab308', title: 'Smart target Alerts', desc: 'Instant browser chimes and email updates.' },
            { icon: <ShieldAlert size={16} />, color: '#f43f5e', title: 'Behavioral Coaching', desc: 'Identify revenge trades and build consistency.' }
          ].map((feat, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ background: `rgba(${feat.color === '#00e599' ? '0, 229, 153' : feat.color === '#3b82f6' ? '59, 130, 246' : feat.color === '#eab308' ? '234, 179, 8' : '244, 63, 94'}, 0.1)`, color: feat.color, padding: '6px', borderRadius: '8px', display: 'flex', flexShrink: 0 }}>
                {feat.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 2px 0' }}>{feat.title}</h4>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0, lineHeight: 1.35 }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', width: '100%', margin: '16px 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '16px 0' }}>
          {[
            { val: '5,000+', label: 'Live Stocks' },
            { val: '2M+', label: 'Alerts Sent' },
            { val: '99.9%', label: 'Uptime' },
            { val: '125K+', label: 'AI Insights' }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#00e599' }}>{stat.val}</div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel: Form Content passed as children */}
      <div className="auth-right-panel">{children}</div>
    </div>
  );
};
