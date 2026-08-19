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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { useUserStore } from '@/stores/userStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { ROUTES } from '@/constants/routes.constants';

export const PaperPositionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pnlFilter, setPnlFilter] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');
  const [sortBy, setSortBy] = useState<string>('value_desc');

  const { user, logout } = useUserStore();
  const { portfolio, fetchPortfolio, isLoading } = usePortfolioStore();

  useEffect(() => {
    if (!portfolio) {
      fetchPortfolio();
    }
  }, [portfolio, fetchPortfolio]);

  const positions = portfolio?.positions || [];
  const holdings = portfolio?.holdings || [];

  const getCurrencySymbol = (symbol: string) => {
    const holding = holdings.find((h) => h.symbol === symbol);
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
    return positions.map((pos) => {
      const holding = holdings.find((h) => h.symbol === pos.symbol);
      const currentPrice = holding?.price || pos.average_entry_price;
      const costBasis = pos.quantity * pos.average_entry_price;
      const currentVal = pos.quantity * currentPrice;
      const rawPnl = currentVal - costBasis;
      const pnl = Math.abs(rawPnl) < 0.0001 ? 0 : rawPnl;
      const returnPct = ((currentPrice - pos.average_entry_price) / pos.average_entry_price) * 100;
      const currency = getCurrencySymbol(pos.symbol);

      return {
        ...pos,
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
        background: '#040810',
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
          gap: 20px;
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
          font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
        }

        .ppp-table-container {
          background: rgba(10, 16, 32, 0.65);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .ppp-table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr 1.2fr 1.4fr 1.4fr 1.1fr 1fr;
          padding: 12px 18px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.66rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          align-items: center;
        }

        .ppp-table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr 1.2fr 1.4fr 1.4fr 1.1fr 1fr;
          padding: 14px 18px;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: background 0.18s ease;
        }
        .ppp-table-row:last-child { border-bottom: none; }
        .ppp-table-row:hover { background: rgba(255, 255, 255, 0.025); }

        .ppp-mono {
          font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
          font-weight: 800;
        }

        @media (max-width: 900px) {
          .ppp-container {
            margin-left: 0;
            padding: 20px;
          }
          .ppp-table-header { display: none; }
          .ppp-table-row { grid-template-columns: 1fr; gap: 8px; }
        }
      `}</style>

      {/* Sidebar Navigation */}
      <Sidebar
        user={user}
        onLogout={logout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="ppp-container">
        {/* Terminal Header */}
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
                <span style={{ fontWeight: 800, color: '#f1f5f9' }}>{positions.length} positions</span>
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

        {/* Position Table */}
        {isLoading ? (
          <div className="tpl-empty-box">
            <p style={{ color: '#64748b' }}>Loading positions...</p>
          </div>
        ) : filteredPositions.length === 0 ? (
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
          <div className="ppp-table-container" data-testid="positions-list-table">
            <div className="ppp-table-header">
              <span>SYMBOL</span>
              <span>QUANTITY</span>
              <span>AVG ENTRY</span>
              <span>CURRENT</span>
              <span>CURRENT VALUE</span>
              <span>UNREALIZED P&L</span>
              <span>RETURN %</span>
              <span>ACTION</span>
            </div>

            {filteredPositions.map((pos) => {
              const isPosProfit = pos.pnl >= 0;
              const pnlColor = isPosProfit ? '#10b981' : '#ef4444';
              const pnlSign = isPosProfit ? '+' : '';

              return (
                <div key={pos.id} className="ppp-table-row" data-testid={`position-row-${pos.symbol}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tpl-symbol-name">{pos.symbol}</span>
                    <span className="tpl-side-badge buy" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                      PAPER
                    </span>
                  </div>

                  <span className="ppp-mono" style={{ color: '#f1f5f9' }}>{pos.quantity} shares</span>

                  <span className="ppp-mono" style={{ color: '#94a3b8' }}>
                    {pos.currency}{formatPrice(pos.average_entry_price)}
                  </span>

                  <span className="ppp-mono" style={{ color: '#f1f5f9' }}>
                    {pos.currency}{formatPrice(pos.currentPrice)}
                  </span>

                  <span className="ppp-mono" style={{ color: '#f8fafc' }}>
                    {pos.currency}{formatPrice(pos.currentVal)}
                  </span>

                  <span className="ppp-mono" style={{ color: pnlColor }}>
                    {pnlSign}{pos.currency}{formatPrice(Math.abs(pos.pnl))}
                  </span>

                  <span className="ppp-mono" style={{ color: pnlColor }}>
                    {pnlSign}{pos.returnPct.toFixed(2)}%
                  </span>

                  <div>
                    <button
                      type="button"
                      className="tpl-action-btn"
                      onClick={() => navigate(`/portfolio/positions/${pos.symbol}`)}
                      data-testid={`view-position-btn-${pos.symbol}`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
