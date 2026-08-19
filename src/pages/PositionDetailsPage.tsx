import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#0b1120',
          color: '#94a3b8',
        }}
      >
        <p>Loading position details...</p>
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
          background: '#0b1120',
          color: '#f3f4f6',
          gap: '16px',
        }}
      >
        <h2>Position Not Found</h2>
        <p style={{ color: '#94a3b8' }}>No active paper position found for symbol: {symbol}</p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: '#3b82f6',
            border: 'none',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
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

  const formatPrice = (price?: number) => {
    if (!price) return '0.00';
    if (price < 0.01) return price.toExponential(5);
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
  const unrealizedPnl = currentVal - costBasis;
  const returnPercent = ((currentPrice - position.average_entry_price) / position.average_entry_price) * 100;
  const isPnlPositive = unrealizedPnl >= 0;
  const pnlColor = isPnlPositive ? '#10b981' : '#ef4444';
  const pnlSign = isPnlPositive ? '+' : '';

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
        background: 'var(--color-bg-primary, #0b1120)',
        color: '#f3f4f6',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        .details-main-container {
          margin-left: 280px;
          flex: 1;
          padding: 40px;
          box-sizing: border-box;
          transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          min-width: 0;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .details-card {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .details-card-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #3b82f6;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .details-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .details-label {
          color: #94a3b8;
        }

        .details-value {
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .details-main-container {
            margin-left: 0;
            padding: 20px;
          }
          .details-grid {
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

      <main className="details-main-container">
        {/* Top bar with back button & mobile toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
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
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              data-testid="back-to-portfolio-btn"
            >
              <ArrowLeft size={16} />
              <span>Back to Portfolio</span>
            </button>
          </div>
        </div>

        {/* Header Summary Row */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 16,
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }} data-testid="position-symbol">
                  {symbol}
                </h1>
                <span
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: '#60a5fa',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 6,
                    letterSpacing: '0.5px',
                  }}
                >
                  PAPER
                </span>
              </div>
              <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9rem' }} data-testid="position-quantity">
                {position.quantity} shares held
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                Current Value
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }} data-testid="current-position-value">
                {currencySymbol}{formatPrice(currentVal)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                Unrealized P&L
              </div>
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: pnlColor,
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                data-testid="unrealized-pnl-header"
              >
                {pnlSign}{currencySymbol}{formatPrice(Math.abs(unrealizedPnl))}
                <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>
                  ({pnlSign}{returnPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="details-grid">
          {/* POSITION DETAILS */}
          <div className="details-card">
            <h3 className="details-card-title">Position</h3>
            <div className="details-row">
              <span className="details-label">Average Entry</span>
              <span className="details-value" data-testid="detail-average-entry">
                {currencySymbol}{formatPrice(position.average_entry_price)}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Current Price</span>
              <span className="details-value" data-testid="detail-current-price">
                {currencySymbol}{formatPrice(currentPrice)}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Quantity</span>
              <span className="details-value" data-testid="detail-quantity">
                {position.quantity} shares
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Position Value</span>
              <span className="details-value" data-testid="detail-position-value">
                {currencySymbol}{formatPrice(currentVal)}
              </span>
            </div>
          </div>

          {/* PERFORMANCE DETAILS */}
          <div className="details-card">
            <h3 className="details-card-title">Performance</h3>
            <div className="details-row">
              <span className="details-label">Cost Basis</span>
              <span className="details-value" data-testid="detail-cost-basis">
                {currencySymbol}{formatPrice(costBasis)}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Current Value</span>
              <span className="details-value" data-testid="detail-current-value">
                {currencySymbol}{formatPrice(currentVal)}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Unrealized P&L</span>
              <span className="details-value" style={{ color: pnlColor }} data-testid="detail-unrealized-pnl">
                {pnlSign}{currencySymbol}{formatPrice(Math.abs(unrealizedPnl))}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Return %</span>
              <span className="details-value" style={{ color: pnlColor }} data-testid="detail-return-percent">
                {pnlSign}{returnPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* RISK MANAGEMENT */}
          <div className="details-card">
            <h3 className="details-card-title">Risk Management</h3>
            <div className="details-row">
              <span className="details-label">Stop Loss</span>
              <span className="details-value" style={{ color: stopLoss > 0 ? '#f87171' : '#cbd5e1' }} data-testid="detail-stop-loss">
                {stopLoss > 0 ? `${currencySymbol}${formatPrice(stopLoss)}` : 'N/A'}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Take Profit</span>
              <span className="details-value" style={{ color: takeProfit > 0 ? '#34d399' : '#cbd5e1' }} data-testid="detail-take-profit">
                {takeProfit > 0 ? `${currencySymbol}${formatPrice(takeProfit)}` : 'N/A'}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Risk per share</span>
              <span className="details-value" data-testid="detail-risk-per-share">
                {riskPerShare > 0 ? `${currencySymbol}${formatPrice(riskPerShare)}` : 'N/A'}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Potential reward</span>
              <span className="details-value" data-testid="detail-potential-reward">
                {rewardPerShare > 0 ? `${currencySymbol}${formatPrice(rewardPerShare)}` : 'N/A'}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">Risk/Reward ratio</span>
              <span className="details-value" data-testid="detail-risk-reward-ratio">
                {riskRewardRatio}
              </span>
            </div>
          </div>

          {/* STRATEGY & AI INSIGHTS */}
          <div className="details-card">
            <h3 className="details-card-title">Strategy</h3>
            <div className="details-row">
              <span className="details-label">Primary Strategy</span>
              <span className="details-value" data-testid="detail-primary-strategy">
                {primaryProposal?.primary_strategy || 'N/A'}
              </span>
            </div>
            <div className="details-row">
              <span className="details-label">AI Confidence</span>
              <span className="details-value" data-testid="detail-ai-confidence">
                {primaryProposal?.confidence_score !== undefined
                  ? `${(Number(primaryProposal.confidence_score) * 100).toFixed(0)}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="details-row" style={{ flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <span className="details-label">Strategy Rationale</span>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  padding: '10px',
                  borderRadius: '8px',
                }}
                data-testid="detail-strategy-rationale"
              >
                {primaryProposal
                  ? `AI activated the ${primaryProposal.primary_strategy} strategy for ${symbol} with a confidence score of ${(Number(primaryProposal.confidence_score) * 100).toFixed(0)}%. Risk evaluation checked all portfolio safety constraints prior to confirmation.`
                  : 'No active strategy data matches this holding position.'}
              </p>
            </div>
          </div>
        </div>

        {/* EXECUTION LOGS (100% WIDTH CARD) */}
        <div className="details-card" style={{ gap: '12px' }}>
          <h3 className="details-card-title">Execution Details</h3>
          {matchedProposals.length === 0 ? (
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
              No execution records found for this position.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {matchedProposals.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    borderRadius: 12,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                  data-testid={`execution-item-${idx}`}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        Action
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: p.action === 'BUY' ? '#10b981' : '#ef4444', marginTop: '2px' }} data-testid={`exec-action-${idx}`}>
                        {p.action}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        Quantity (Requested / Filled)
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9', marginTop: '2px' }} data-testid={`exec-quantity-${idx}`}>
                        {p.requested_quantity} / {p.requested_quantity} shares
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        Proposal Entry Price
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1', marginTop: '2px' }} data-testid={`exec-proposal-price-${idx}`}>
                        {currencySymbol}{formatPrice(p.entry_price)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        Actual Execution Price
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa', marginTop: '2px' }} data-testid={`exec-execution-price-${idx}`}>
                        {currencySymbol}{formatPrice(position.average_entry_price)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.7rem',
                      color: '#64748b',
                      borderTop: '1px solid rgba(255, 255, 255, 0.03)',
                      paddingTop: '8px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <span data-testid={`exec-id-${idx}`}>Execution ID: EXE-{p.id.substring(0, 8).toUpperCase()}</span>
                    <span data-testid={`exec-date-${idx}`}>Executed At: {p.updated_at ? new Date(p.updated_at).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
