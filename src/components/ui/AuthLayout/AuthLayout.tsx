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

        {/* Animated Hero: Premium Dashboard Mockup Previews */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', width: '100%', margin: '16px 0' }}>
          {/* Portfolio & Performance Mock Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'linear-gradient(135deg, rgba(22, 32, 50, 0.4) 0%, rgba(11, 17, 32, 0.6) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: '0 15px 30px rgba(0,0,0,0.6)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e599', display: 'inline-block' }} />
                <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE PORTFOLIO</span>
              </div>
              <span style={{ color: '#00e599', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                +1.41% <ArrowUpRight size={10} />
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>Total Value</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>₹2,45,230</div>

            {/* Simulated Grid Sparkline Area */}
            <div style={{ height: '55px', display: 'flex', alignItems: 'flex-end', gap: '4px', position: 'relative', overflow: 'hidden', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[35, 45, 40, 50, 48, 62, 58, 68, 65, 80].map((val, i) => (
                <div key={i} style={{ flex: 1, height: `${val}%`, background: 'linear-gradient(to top, rgba(0, 229, 153, 0.1), rgba(0, 229, 153, 0.45))', borderRadius: '1.5px' }} />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: '#64748b' }}>
              <span>Today's Gain: <strong style={{ color: '#00e599' }}>+₹3,421</strong></span>
              <span>AI Rating: <strong style={{ color: '#00e599' }}>92/100</strong></span>
            </div>
          </motion.div>

          {/* AI Signal & Candlestick Mock Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Candlestick Chart Snippet */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'linear-gradient(135deg, rgba(22, 32, 50, 0.4) 0%, rgba(11, 17, 32, 0.6) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
                boxShadow: '0 15px 30px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>REAL-TIME ORDER FLOW</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '40px', padding: '0 4px' }}>
                {/* 5 Candle sticks: wick (center line) + body box */}
                {[
                  { open: 15, close: 30, color: '#00e599', wickL: 8, wickH: 35 },
                  { open: 25, close: 12, color: '#ff4444', wickL: 8, wickH: 30 },
                  { open: 15, close: 25, color: '#00e599', wickL: 10, wickH: 28 },
                  { open: 22, close: 38, color: '#00e599', wickL: 18, wickH: 40 },
                  { open: 35, close: 28, color: '#ff4444', wickL: 20, wickH: 38 }
                ].map((candle, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '12px', height: '100%', display: 'flex', justifyContent: 'center' }}>
                    {/* Wick */}
                    <div style={{ position: 'absolute', bottom: `${candle.wickL}%`, top: `${100 - candle.wickH}%`, width: '1.5px', background: candle.color }} />
                    {/* Body */}
                    <div style={{ position: 'absolute', bottom: `${Math.min(candle.open, candle.close)}%`, top: `${100 - Math.max(candle.open, candle.close)}%`, width: '100%', background: candle.color, borderRadius: '1.5px' }} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Recommendation Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, rgba(22, 32, 50, 0.4) 0%, rgba(11, 17, 32, 0.6) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
                boxShadow: '0 15px 30px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}><Bot size={13} style={{ color: '#00e599' }} /> AI Rating</span>
                <span style={{ background: 'rgba(0, 229, 153, 0.15)', color: '#00e599', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>STRONG BUY</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '6px' }}>
                <span>Confidence: <strong style={{ color: '#f1f5f9' }}>87%</strong></span>
                <span>Risk: <strong style={{ color: '#3b82f6' }}>LOW</strong></span>
              </div>
            </motion.div>
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

        {/* Trust Badges Footer */}
        <div className="auth-left-footer" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} style={{ color: '#3b82f6' }} /> Secure JWT Login</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} style={{ color: '#3b82f6' }} /> End-to-End Encryption</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} style={{ color: '#3b82f6' }} /> Google OAuth</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} style={{ color: '#3b82f6' }} /> Real-Time Markets</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} style={{ color: '#3b82f6' }} /> AI Powered</div>
        </div>
      </div>

      {/* Right Panel: Form Content passed as children */}
      <div className="auth-right-panel">{children}</div>
    </div>
  );
};
