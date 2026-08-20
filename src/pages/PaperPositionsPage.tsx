import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  ArrowLeft,
  Search,
  Briefcase,
  ShieldCheck,
  SlidersHorizontal,
  ArrowUpDown,
  Info,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { useUserStore } from '@/stores/userStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { ROUTES } from '@/constants/routes.constants';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import '@/styles/components/portfolio.css';
import '@/styles/components/tradeProposal.css';

export const PaperPositionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pnlFilter, setPnlFilter] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');
  const [sortBy, setSortBy] = useState<string>('value_desc');

  const { user, logout } = useUserStore();
  const { portfolio, fetchPortfolio, isLoading } = usePortfolioStore();

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const positions = portfolio?.positions || [];
  const holdings = portfolio?.holdings || [];

  const getCurrencySymbol = (symbol?: string) => {
    if (!symbol) return '$';
    const holding = Array.isArray(holdings) ? holdings.find((h) => h?.symbol === symbol) : undefined;
    if (
      holding?.currency === 'INR' ||
      holding?.currency === '₹' ||
      symbol.endsWith('.NS') ||
      symbol.endsWith('.BO')
    ) {
      return '₹';
    }
    return '$';
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || isNaN(price)) return '0.00';
    if (Math.abs(price) < 0.0001) return '0.00';
    return price.toFixed(2);
  };

  // Enriched positions with live pricing, cost basis, P&L, return %
  const enrichedPositions = useMemo(() => {
    if (!Array.isArray(positions)) return [];
    return positions
      .filter((pos): pos is typeof pos & { symbol: string } => Boolean(pos && pos.symbol))
      .map((pos) => {
        const symbol = String(pos.symbol || '');
        const holding = Array.isArray(holdings) ? holdings.find((h) => h?.symbol === symbol) : undefined;
        const qty = Number(pos.quantity) || 0;
        const avgEntry = Number(pos.average_entry_price) || 0;
        const currentPrice = Number(holding?.price) || avgEntry;
        const costBasis = qty * avgEntry;
        const currentVal = qty * currentPrice;
        const rawPnl = currentVal - costBasis;
        const pnl = Math.abs(rawPnl) < 0.0001 ? 0 : rawPnl;
        const rawReturnPct = avgEntry > 0 ? ((currentPrice - avgEntry) / avgEntry) * 100 : 0;
        const returnPct = Math.abs(rawReturnPct) < 0.0001 ? 0 : rawReturnPct;
        const currency = getCurrencySymbol(symbol);

        return {
          ...pos,
          id: pos.id || symbol,
          symbol,
          quantity: qty,
          average_entry_price: avgEntry,
          currentPrice,
          costBasis,
          currentVal,
          pnl,
          returnPct,
          currency,
        };
      });
  }, [positions, holdings]);

  // Total Portfolio Metrics
  const totalValue = enrichedPositions.reduce((acc, pos) => acc + pos.currentVal, 0);
  const totalCost = enrichedPositions.reduce((acc, pos) => acc + pos.costBasis, 0);
  const totalPnl = totalValue - totalCost;
  const isTotalPnlPositive = totalPnl >= 0;

  // Filter & Sort Positions
  const filteredPositions = useMemo(() => {
    return enrichedPositions
      .filter((pos) => {
        const matchesSearch =
          !searchTerm.trim() ||
          pos.symbol.toLowerCase().includes(searchTerm.toLowerCase().trim());

        const matchesPnl =
          pnlFilter === 'ALL' ||
          (pnlFilter === 'PROFIT' && pos.pnl >= 0) ||
          (pnlFilter === 'LOSS' && pos.pnl < 0);

        return matchesSearch && matchesPnl;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'pnl_desc':
            return b.pnl - a.pnl;
          case 'pnl_asc':
            return a.pnl - b.pnl;
          case 'symbol_asc':
            return a.symbol.localeCompare(b.symbol);
          case 'value_desc':
          default:
            return b.currentVal - a.currentVal;
        }
      });
  }, [enrichedPositions, searchTerm, pnlFilter, sortBy]);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#000000',
        color: '#f8fafc',
        position: 'relative',
        overflowX: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        .ppp-container {
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

        .ppp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 20px;
          flex-wrap: wrap;
        }

        .ppp-title {
          font-size: 1.5rem;
          font-weight: 900;
          color: #f8fafc;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .ppp-summary-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          background: rgba(10, 16, 32, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 18px 22px;
        }

        .ppp-summary-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ppp-summary-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ppp-summary-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @media (max-width: 900px) {
          .ppp-container {
            margin-left: 0;
            padding: 20px;
          }
        }
      `}</style>

      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        onLogout={() => { logout(); }}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="ppp-container">
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <>
            {/* Terminal Page Header */}
            <motion.header
              className="ppp-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="mobile-sidebar-toggle tpl-mobile-toggle"
                  aria-label="Toggle mobile menu"
                >
                  <Menu size={24} />
                </button>
                <button
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: '8px',
                  }}
                  data-testid="back-to-dashboard-btn"
                >
                  <ArrowLeft size={14} /> Back to Portfolio
                </button>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h1 className="ppp-title">PAPER POSITIONS</h1>
                    <span className="tpl-sub-badge">Active Holdings Queue</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.78rem', color: '#64748b' }}>
                    <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={11} /> PAPER TRADING
                    </span>
                    <span>•</span>
                    <span>Agent 5 Execution Engine</span>
                    <span>•</span>
                    <span style={{ fontWeight: 800, color: '#f1f5f9', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
                      {positions.length} positions
                    </span>
                  </div>
                </div>
              </div>
            </motion.header>

            {/* Paper Notice Bar */}
            <div className="tpl-paper-notice-bar">
              <Info size={14} className="tpl-notice-icon" />
              <span>
                <strong>PAPER TRADING:</strong> Simulated paper positions list. Execution and pricing are simulated without real money.
              </span>
            </div>

            {/* Summary Metrics Strip */}
            <motion.div
              className="ppp-summary-strip"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.05 }}
            >
              <div className="ppp-summary-item">
                <span className="ppp-summary-label">Total Portfolio Value</span>
                <span className="ppp-summary-value">${formatPrice(totalValue)}</span>
              </div>
              <div className="ppp-summary-item">
                <span className="ppp-summary-label">Total Cost Basis</span>
                <span className="ppp-summary-value">${formatPrice(totalCost)}</span>
              </div>
              <div className="ppp-summary-item">
                <span className="ppp-summary-label">Total Unrealized P&L</span>
                <span className="ppp-summary-value" style={{ color: isTotalPnlPositive ? '#10b981' : '#ef4444' }}>
                  {isTotalPnlPositive ? '+' : ''}${formatPrice(Math.abs(totalPnl))}
                </span>
              </div>
            </motion.div>

            {/* Command / Filter Bar */}
            <div className="tpl-command-bar">
              <div className="tpl-command-bar-row">
                <div className="tpl-search-box">
                  <Search size={14} className="tpl-search-icon" />
                  <input
                    type="text"
                    placeholder="Search position symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="tpl-search-input"
                    data-testid="positions-search-input"
                  />
                </div>

                <div className="tpl-filter-group">
                  <span className="tpl-filter-label"><SlidersHorizontal size={12} /> P&L Filter</span>
                  <select
                    value={pnlFilter}
                    onChange={(e) => setPnlFilter(e.target.value as any)}
                    className="tpl-select"
                    data-testid="positions-pnl-filter"
                  >
                    <option value="ALL">All Positions</option>
                    <option value="PROFIT">In Profit (+)</option>
                    <option value="LOSS">In Loss (-)</option>
                  </select>
                </div>

                <div className="tpl-filter-group">
                  <span className="tpl-filter-label"><ArrowUpDown size={12} /> Sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="tpl-select"
                    data-testid="positions-sort-select"
                  >
                    <option value="value_desc">Highest Value</option>
                    <option value="pnl_desc">Highest P&L</option>
                    <option value="pnl_asc">Lowest P&L</option>
                    <option value="symbol_asc">Symbol (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Position Cards Grid (Matching Portfolio Dashboard Design 100%) */}
            {filteredPositions.length === 0 ? (
              <div className="tpl-empty-box" data-testid="positions-empty-state">
                <div className="tpl-empty-icon">
                  <Briefcase size={24} color="#3b82f6" />
                </div>
                <h3 className="tpl-empty-title">No Paper Positions Found</h3>
                <p className="tpl-empty-desc">
                  {positions.length === 0
                    ? 'No active paper positions in portfolio. Execute a trade proposal or paper order to see positions here.'
                    : 'No positions match your search or filter settings.'}
                </p>
              </div>
            ) : (
              <div className="pv-positions-grid" data-testid="positions-list-table">
                {filteredPositions.map((pos, idx) => {
                  const isPosProfit = pos.pnl >= 0;
                  const pnlClass = isPosProfit ? 'positive' : 'negative';
                  const cardPnlClass = isPosProfit ? 'pnl-positive' : 'pnl-negative';
                  const pnlSign = pos.pnl > 0 ? '+' : pos.pnl < 0 ? '-' : '';
                  const returnPctSign = pos.returnPct > 0 ? '+' : pos.returnPct < 0 ? '-' : '';
                  const returnPctFormatted = Math.abs(pos.returnPct).toFixed(2);

                  return (
                    <motion.div
                      key={pos.id}
                      className={`pv-position-card ${cardPnlClass}`}
                      onClick={() => navigate(`/portfolio/positions/${pos.symbol}`)}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: idx * 0.05 }}
                      data-testid={`position-row-${pos.symbol}`}
                    >
                      {/* Card Header: Symbol + PAPER Tag + Qty Badge */}
                      <div className="pv-position-header">
                        <div className="pv-position-symbol-group">
                          <span className="pv-position-symbol">{pos.symbol}</span>
                          <span className="pv-paper-tag">PAPER</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="pv-qty-badge">{pos.quantity} shares</span>
                          <ChevronRight size={14} style={{ color: '#475569' }} />
                        </div>
                      </div>

                      {/* 4-Cell Metric Grid */}
                      <div className="pv-metric-row">
                        <div className="pv-metric-cell">
                          <span className="pv-metric-label">AVG ENTRY</span>
                          <span className="pv-metric-value">
                            {pos.currency}{formatPrice(pos.average_entry_price)}
                          </span>
                        </div>

                        <div className="pv-metric-cell">
                          <span className="pv-metric-label">CURRENT</span>
                          <span className="pv-metric-value">
                            {pos.currency}{formatPrice(pos.currentPrice)}
                          </span>
                        </div>

                        <div className="pv-metric-cell">
                          <span className="pv-metric-label">VALUE</span>
                          <span className="pv-metric-value">
                            {pos.currency}{formatPrice(pos.currentVal)}
                          </span>
                        </div>

                        <div className="pv-metric-cell">
                          <span className="pv-metric-label">P&amp;L</span>
                          <span className={`pv-metric-value ${pnlClass}`}>
                            {pnlSign}{pos.currency}{formatPrice(Math.abs(pos.pnl))}
                            <span className="pv-pnl-pct">
                              {' '}({returnPctSign}{returnPctFormatted}%)
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Action Button Strip */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <button
                          type="button"
                          className="tpl-action-btn"
                          style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/portfolio/positions/${pos.symbol}`);
                          }}
                          data-testid={`view-position-btn-${pos.symbol}`}
                        >
                          View Terminal Details
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
