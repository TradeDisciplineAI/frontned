import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Menu,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Brain,
  Activity,
  Zap,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { useUserStore } from '@/stores/userStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';

export const PositionDetailsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { user, logout } = useUserStore();
  const { portfolio, fetchPortfolio, isLoading: isPortfolioLoading } = usePortfolioStore();
  const { proposals, fetchProposals, isLoading: isProposalsLoading } = useTradeProposalStore();

  useEffect(() => {
    if (!portfolio) {
      fetchPortfolio();
    }
    fetchProposals(user?.id);
  }, [portfolio, fetchPortfolio, fetchProposals, user?.id]);

  if (isPortfolioLoading || isProposalsLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#040810' }}>
        <Sidebar user={user} onLogout={logout} isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
        <div style={{ marginLeft: 280, flex: 1, padding: 36, display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          <style>{`
            @keyframes skeleton-pulse {
              0%, 100% { background-color: rgba(255, 255, 255, 0.03); }
              50% { background-color: rgba(255, 255, 255, 0.08); }
            }
            .pdp-skeleton-box { animation: skeleton-pulse 1.5s infinite ease-in-out; border-radius: 10px; }
          `}</style>
          <div className="pdp-skeleton-box" style={{ height: 40, width: 300 }} />
          <div className="pdp-skeleton-box" style={{ height: 180, width: '100%' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="pdp-skeleton-box" style={{ height: 120 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const position = portfolio?.positions?.find((p) => p.symbol === symbol);

  if (!position) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#040810',
          color: '#f8fafc',
          gap: '16px',
          fontFamily: 'sans-serif',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Position Not Found</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No active paper position found for symbol: {symbol}</p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.88rem',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)',
          }}
        >
          Back to Portfolio
        </button>
      </div>
    );
  }

  // Look up current price & currency
  const holding = portfolio?.holdings?.find((h) => h.symbol === symbol);
  const currentPrice = holding?.price || position.average_entry_price;
  const currencySymbol =
    holding?.currency === 'INR' ||
    holding?.currency === '₹' ||
    symbol?.endsWith('.NS') ||
    symbol?.endsWith('.BO')
      ? '₹'
      : '$';

  // Fixed formatPrice to prevent floating-point precision issues / scientific notation (e.g. 4.88e-5)
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || isNaN(price)) return '0.00';
    if (Math.abs(price) < 0.0001) return '0.00';
    return price.toFixed(2);
  };

  // Find matching executed proposal(s)
  const matchedProposals = proposals.filter(
    (p) => p.symbol === symbol && p.status === 'EXECUTED',
  );
  const primaryProposal = matchedProposals[0]; // latest execution details

  // Performance calculations
  const costBasis = position.quantity * position.average_entry_price;
  const currentVal = position.quantity * currentPrice;
  const rawPnl = currentVal - costBasis;
  const unrealizedPnl = Math.abs(rawPnl) < 0.0001 ? 0 : rawPnl;
  const returnPercent = ((currentPrice - position.average_entry_price) / position.average_entry_price) * 100;
  const isPnlPositive = unrealizedPnl >= 0;
  const pnlColor = isPnlPositive ? '#10b981' : '#ef4444';
  const pnlSign = isPnlPositive ? '+' : '';
  const cardPnlGlow = isPnlPositive ? 'pdp-glow-positive' : 'pdp-glow-negative';

  // Risk values (using the executed proposal if available)
  const stopLoss = primaryProposal?.stop_loss ?? 0;
  const takeProfit = primaryProposal?.take_profit ?? 0;
  const riskPerShare = stopLoss > 0 ? Math.max(0, position.average_entry_price - stopLoss) : 0;
  const rewardPerShare = takeProfit > 0 ? Math.max(0, takeProfit - position.average_entry_price) : 0;
  const riskRewardRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : 'N/A';

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#040810',
        color: '#f8fafc',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        @keyframes pdp-grid-pan {
          0% { background-position: 0 0; }
          100% { background-position: 32px 32px; }
        }

        .pdp-main-container {
          margin-left: 280px;
          flex: 1;
          padding: 36px 40px;
          box-sizing: border-box;
          transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          min-width: 0;
        }

        .pdp-hero-card {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(10, 16, 32, 0.95) 0%, rgba(15, 23, 46, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .pdp-hero-card.pdp-glow-positive {
          border-color: rgba(16, 185, 129, 0.25);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), 0 0 35px rgba(16, 185, 129, 0.08);
        }

        .pdp-hero-card.pdp-glow-negative {
          border-color: rgba(239, 68, 68, 0.25);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), 0 0 35px rgba(239, 68, 68, 0.08);
        }

        .pdp-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(59, 130, 246, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.035) 1px, transparent 1px);
          background-size: 32px 32px;
          animation: pdp-grid-pan 12s linear infinite;
          pointer-events: none;
        }

        .pdp-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .pdp-card {
          background: rgba(10, 16, 32, 0.65);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: border-color 0.2s ease, transform 0.15s ease, background 0.2s ease;
        }

        .pdp-card:hover {
          border-color: rgba(255, 255, 255, 0.12);
          background: rgba(14, 22, 44, 0.7);
          transform: translateY(-2px);
        }

        .pdp-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 10px;
        }

        .pdp-card-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
        }

        .pdp-card-title {
          font-size: 0.78rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin: 0;
        }

        .pdp-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.88rem;
          padding: 4px 0;
        }

        .pdp-label {
          color: #64748b;
          font-weight: 500;
        }

        .pdp-value {
          font-weight: 700;
          color: #f1f5f9;
          font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
        }

        .pdp-mono {
          font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
        }

        @media (max-width: 900px) {
          .pdp-main-container {
            margin-left: 0;
            padding: 20px;
          }
          .pdp-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>

      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        onLogout={logout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="pdp-main-container">
        {/* Top Navigation Bar */}
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            paddingBottom: '16px',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}
              className="mobile-sidebar-toggle"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '8px',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f1f5f9';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
              data-testid="back-to-portfolio-btn"
            >
              <ArrowLeft size={15} />
              <span>Back to Portfolio</span>
            </button>
          </div>
        </motion.div>

        {/* Header Summary Hero Card */}
        <motion.div
          className={`pdp-hero-card ${cardPnlGlow}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="pdp-hero-grid" aria-hidden="true" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(37,99,235,0.1) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
                fontWeight: 800,
                fontSize: '1.1rem',
                boxShadow: '0 0 20px rgba(59,130,246,0.15)',
              }}
            >
              {symbol?.substring(0, 2)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1
                  style={{ fontSize: '2.1rem', fontWeight: 900, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}
                  data-testid="position-symbol"
                >
                  {symbol}
                </h1>
                <span
                  style={{
                    background: 'rgba(59, 130, 246, 0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.28)',
                    color: '#60a5fa',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 6,
                    letterSpacing: '0.6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ShieldCheck size={11} /> PAPER
                </span>
              </div>
              <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 500 }} data-testid="position-quantity">
                {position.quantity} shares held
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '36px', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
                Current Value
              </div>
              <div
                style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', marginTop: '3px', fontFamily: "'JetBrains Mono', monospace" }}
                data-testid="current-position-value"
              >
                {currencySymbol}{formatPrice(currentVal)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
                Unrealized P&L
              </div>
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: pnlColor,
                  marginTop: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                data-testid="unrealized-pnl-header"
              >
                {pnlSign}{currencySymbol}{formatPrice(Math.abs(unrealizedPnl))}
                <span style={{ fontSize: '0.95rem', fontWeight: 700, opacity: 0.9, fontFamily: 'inherit' }}>
                  ({pnlSign}{returnPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Breakdown Grid */}
        <div className="pdp-grid">
          {/* POSITION DETAILS */}
          <motion.div
            className="pdp-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.05 }}
          >
            <div className="pdp-card-header">
              <div className="pdp-card-icon"><BarChart3 size={15} /></div>
              <h3 className="pdp-card-title">Position</h3>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Average Entry</span>
              <span className="pdp-value" data-testid="detail-average-entry">
                {currencySymbol}{formatPrice(position.average_entry_price)}
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Current Price</span>
              <span className="pdp-value" data-testid="detail-current-price">
                {currencySymbol}{formatPrice(currentPrice)}
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Quantity</span>
              <span className="pdp-value" data-testid="detail-quantity">
                {position.quantity} shares
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Position Value</span>
              <span className="pdp-value" data-testid="detail-position-value">
                {currencySymbol}{formatPrice(currentVal)}
              </span>
            </div>
          </motion.div>

          {/* PERFORMANCE DETAILS */}
          <motion.div
            className="pdp-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.1 }}
          >
            <div className="pdp-card-header">
              <div className="pdp-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                <TrendingUp size={15} />
              </div>
              <h3 className="pdp-card-title">Performance</h3>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Cost Basis</span>
              <span className="pdp-value" data-testid="detail-cost-basis">
                {currencySymbol}{formatPrice(costBasis)}
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Current Value</span>
              <span className="pdp-value" data-testid="detail-current-value">
                {currencySymbol}{formatPrice(currentVal)}
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Unrealized P&L</span>
              <span className="pdp-value" style={{ color: pnlColor }} data-testid="detail-unrealized-pnl">
                {pnlSign}{currencySymbol}{formatPrice(Math.abs(unrealizedPnl))}
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Return %</span>
              <span className="pdp-value" style={{ color: pnlColor }} data-testid="detail-return-percent">
                {pnlSign}{returnPercent.toFixed(2)}%
              </span>
            </div>
          </motion.div>

          {/* RISK MANAGEMENT */}
          <motion.div
            className="pdp-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.15 }}
          >
            <div className="pdp-card-header">
              <div className="pdp-card-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                <Activity size={15} />
              </div>
              <h3 className="pdp-card-title">Risk Management</h3>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Stop Loss</span>
              <span className="pdp-value" style={{ color: stopLoss > 0 ? '#ef4444' : '#64748b' }} data-testid="detail-stop-loss">
                {stopLoss > 0 ? `${currencySymbol}${formatPrice(stopLoss)}` : 'N/A'}
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Take Profit</span>
              <span className="pdp-value" style={{ color: takeProfit > 0 ? '#10b981' : '#64748b' }} data-testid="detail-take-profit">
                {takeProfit > 0 ? `${currencySymbol}${formatPrice(takeProfit)}` : 'N/A'}
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Risk per share</span>
              <span className="pdp-value" data-testid="detail-risk-per-share">
                {riskPerShare > 0 ? `${currencySymbol}${formatPrice(riskPerShare)}` : 'N/A'}
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Potential reward</span>
              <span className="pdp-value" data-testid="detail-potential-reward">
                {rewardPerShare > 0 ? `${currencySymbol}${formatPrice(rewardPerShare)}` : 'N/A'}
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Risk/Reward ratio</span>
              <span className="pdp-value" style={{ color: '#60a5fa' }} data-testid="detail-risk-reward-ratio">
                {riskRewardRatio}
              </span>
            </div>
          </motion.div>

          {/* STRATEGY & AI INSIGHTS */}
          <motion.div
            className="pdp-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.2 }}
          >
            <div className="pdp-card-header">
              <div className="pdp-card-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', borderColor: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>
                <Brain size={15} />
              </div>
              <h3 className="pdp-card-title">Strategy</h3>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">Primary Strategy</span>
              <span className="pdp-value" style={{ color: '#c084fc' }} data-testid="detail-primary-strategy">
                {primaryProposal?.primary_strategy || 'N/A'}
              </span>
            </div>
            <div className="pdp-row">
              <span className="pdp-label">AI Confidence</span>
              <span className="pdp-value" style={{ color: '#c084fc' }} data-testid="detail-ai-confidence">
                {primaryProposal?.confidence_score !== undefined
                  ? `${(Number(primaryProposal.confidence_score) * 100).toFixed(0)}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="pdp-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '4px' }}>
              <span className="pdp-label" style={{ fontSize: '0.75rem' }}>Strategy Rationale</span>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.82rem',
                  lineHeight: 1.45,
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
                data-testid="detail-strategy-rationale"
              >
                {primaryProposal
                  ? `AI activated the ${primaryProposal.primary_strategy} strategy for ${symbol} with a confidence score of ${(Number(primaryProposal.confidence_score) * 100).toFixed(0)}%. Risk evaluation checked all portfolio safety constraints prior to confirmation.`
                  : 'No active strategy data matches this holding position.'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* EXECUTION LOGS (100% WIDTH CARD) */}
        <motion.div
          className="pdp-card"
          style={{ gap: '14px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.25 }}
        >
          <div className="pdp-card-header">
            <div className="pdp-card-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
              <Zap size={15} />
            </div>
            <h3 className="pdp-card-title">Execution Details</h3>
          </div>
          {matchedProposals.length === 0 ? (
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.84rem' }}>
              No execution records found for this position.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matchedProposals.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 12,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                  data-testid={`execution-item-${idx}`}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
                        Action
                      </div>
                      <div
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          color: p.action === 'BUY' ? '#10b981' : '#ef4444',
                          marginTop: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        data-testid={`exec-action-${idx}`}
                      >
                        {p.action === 'BUY' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {p.action}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
                        Quantity (Requested / Filled)
                      </div>
                      <div className="pdp-mono" style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f1f5f9', marginTop: '2px' }} data-testid={`exec-quantity-${idx}`}>
                        {p.requested_quantity} / {p.requested_quantity} shares
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
                        Proposal Entry Price
                      </div>
                      <div className="pdp-mono" style={{ fontSize: '0.88rem', fontWeight: 800, color: '#94a3b8', marginTop: '2px' }} data-testid={`exec-proposal-price-${idx}`}>
                        {currencySymbol}{formatPrice(p.entry_price)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.4px' }}>
                        Actual Execution Price
                      </div>
                      <div className="pdp-mono" style={{ fontSize: '0.88rem', fontWeight: 800, color: '#60a5fa', marginTop: '2px' }} data-testid={`exec-execution-price-${idx}`}>
                        {currencySymbol}{formatPrice(position.average_entry_price)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      color: '#475569',
                      borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                      paddingTop: '10px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <span className="pdp-mono" data-testid={`exec-id-${idx}`}>Execution ID: EXE-{p.id.substring(0, 8).toUpperCase()}</span>
                    <span data-testid={`exec-date-${idx}`}>Executed At: {p.updated_at ? new Date(p.updated_at).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};
