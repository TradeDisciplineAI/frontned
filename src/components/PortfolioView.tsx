import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Trash2,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldCheck,
  Briefcase,
  Sparkles,
  AlertTriangle,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { usePriceAlertStore } from '@/stores/priceAlertStore';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { useUserStore } from '@/stores/userStore';
import { agent3Service, type TradeSignal } from '@/services/agent3.service';
import { AISignalModal } from '@/components/tradeProposal/AISignalModal';
import { CreateProposalModal } from '@/components/tradeProposal/CreateProposalModal';
import { PreRiskReviewModal } from '@/components/tradeProposal/PreRiskReviewModal';
import { Sparkline } from '@/components/ui/Sparkline';
import { ROUTES } from '@/constants/routes.constants';
import '@/styles/components/portfolio.css';

interface PortfolioViewProps {
  onSelectStock?: (symbol: string) => void;
  onViewIndicators?: (symbol: string) => void;
}

const ACCENT_BG_COLORS = [
  'rgba(16, 185, 129, 0.1)',  // Emerald
  'rgba(6, 182, 212, 0.1)',   // Cyan
  'rgba(59, 130, 246, 0.1)',  // Blue
  'rgba(99, 102, 241, 0.1)',  // Indigo
  'rgba(139, 92, 246, 0.1)',  // Violet
];

const ACCENT_TEXT_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onSelectStock, onViewIndicators }) => {
  const navigate = useNavigate();
  const { portfolio, isLoading, triggerRemoveHolding, createPortfolio } = usePortfolioStore();
  const openModal = usePriceAlertStore((state) => state.openModal);

  const { user } = useUserStore();
  const {
    isCreateModalOpen,
    isReviewModalOpen,
    draftProposal,
    openCreateModal,
    closeCreateModal,
    closeReviewModal,
    fetchProposals,
  } = useTradeProposalStore();

  const [analyzingSymbol, setAnalyzingSymbol] = useState<string | null>(null);
  const [activeSignal, setActiveSignal] = useState<TradeSignal | null>(null);
  const [isSignalModalOpen, setIsSignalModalOpen] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [watchlistPage, setWatchlistPage] = useState(0);

  const WATCHLIST_PER_PAGE = 4;

  const getCurrencySymbolForPos = (symbol: string, currency?: string) => {
    if (
      currency === 'INR' ||
      currency === '₹' ||
      symbol.endsWith('.NS') ||
      symbol.endsWith('.BO')
    ) {
      return '₹';
    }
    return '$';
  };

  React.useEffect(() => {
    fetchProposals(user?.id);
  }, [fetchProposals, user?.id]);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || isNaN(price)) return '0.00';
    if (Math.abs(price) < 0.0001) return '0.00';
    return price.toFixed(2);
  };

  const handleAnalyzeWithAI = async (symbol: string) => {
    setAnalyzingSymbol(symbol);
    setAnalysisError(null);
    try {
      const signal = await agent3Service.evaluateTicker(symbol);
      setActiveSignal(signal);
      setIsSignalModalOpen(true);
    } catch (err: any) {
      let errorMsg = 'AI strategy analysis is currently unavailable.';
      if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Unable to connect to AI-Service API (http://localhost:8002). Please ensure AI-Service is running on port 8002.';
      } else if (err.response?.data?.detail) {
        errorMsg = typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail);
      }
      setAnalysisError(errorMsg);
    } finally {
      setAnalyzingSymbol(null);
    }
  };

  const handleProposeTradeFromSignal = (signal: TradeSignal) => {
    setIsSignalModalOpen(false);
    openCreateModal({
      symbol: signal.symbol,
      action: signal.action === 'SELL' ? 'SELL' : 'BUY',
      entry_price: signal.entry_price,
      stop_loss: signal.stop_loss,
      take_profit: signal.take_profit,
      primary_strategy: signal.primary_strategy,
      confidence_score: signal.confidence_score,
      signal_id: signal.signal_id,
      requested_quantity: 10,
    });
  };

  const handleCopyId = () => {
    if (portfolio?.id) {
      navigator.clipboard.writeText(String(portfolio.id)).then(() => {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 1500);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="pv-loading-state">
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <motion.div
        className="pv-portfolio-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', gap: '16px' }}
      >
        <div className="pv-portfolio-icon-wrap" style={{ width: '48px', height: '48px' }}>
          <Briefcase size={24} color="#3b82f6" />
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0', color: '#f8fafc' }}>
            No Paper Portfolio Found
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, maxWidth: '420px', lineHeight: 1.5 }}>
            Create a paper portfolio to start tracking simulated positions and executing trade proposals.
          </p>
        </div>
        <button
          className="pv-analyze-btn"
          style={{ width: 'auto', padding: '10px 24px', fontSize: '0.88rem', marginTop: '8px' }}
          onClick={() => createPortfolio('My Paper Portfolio')}
        >
          <Sparkles size={15} />
          Create Paper Portfolio
        </button>
      </motion.div>
    );
  }

  const positions = portfolio.positions || [];

  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Analysis Error Alert */}
      {analysisError && (
        <div className="pv-error-banner" data-testid="ai-analysis-error-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={15} />
            <span>{analysisError}</span>
          </div>
          <button className="pv-error-dismiss" onClick={() => setAnalysisError(null)}>
            &times;
          </button>
        </div>
      )}

      {/* ─── PORTFOLIO HEADER ─── */}
      <motion.div
        className="pv-portfolio-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Left: Icon + Name + Status */}
        <div className="pv-portfolio-header-left">
          <div className="pv-portfolio-icon-wrap">
            <Briefcase size={20} color="#3b82f6" />
          </div>
          <div>
            <div className="pv-portfolio-name-row">
              <h3 className="pv-portfolio-name">
                {portfolio.name || 'My Paper Portfolio'}
              </h3>
              <div className="pv-active-dot" title="Active paper trading portfolio" />
              <span className="pv-active-label">Active</span>
            </div>
            <div className="pv-portfolio-id-row">
              <span className="pv-portfolio-id">ID: {portfolio.id}</span>
              <button
                className="pv-copy-id-btn"
                onClick={handleCopyId}
                title="Copy portfolio ID"
              >
                <Copy size={11} />
              </button>
              {copiedId && (
                <span style={{ fontSize: '0.68rem', color: '#10b981' }}>Copied!</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Paper Trading Badge */}
        <div>
          <span className="pv-paper-badge">
            <ShieldCheck size={13} />
            PAPER TRADING
          </span>
        </div>
      </motion.div>

      {/* ─── PAPER POSITIONS ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="pv-section-header">
          <div>
            <span className="pv-section-title">
              Paper Positions
            </span>
            <span className="pv-section-count">({positions.length})</span>
          </div>
          {positions.length > 0 && (
            <span
              className="pv-section-action"
              role="button"
              tabIndex={0}
              onClick={() => navigate(ROUTES.POSITIONS)}
            >
              View all <ChevronRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </span>
          )}
        </div>

        {positions.length === 0 ? (
          <div className="pv-empty-state" data-testid="empty-paper-positions">
            No paper positions yet.
          </div>
        ) : (
          <div className="pv-positions-grid">
            {positions.map((pos, idx) => {
              const holding = portfolio.holdings.find((h) => h.symbol === pos.symbol);
              const currentPrice = holding?.price || pos.average_entry_price;
              const currencySymbol = getCurrencySymbolForPos(pos.symbol, holding?.currency);
              const positionValue = pos.quantity * currentPrice;

              const pnlValue = (currentPrice - pos.average_entry_price) * pos.quantity;
              const pnlPercent =
                ((currentPrice - pos.average_entry_price) / pos.average_entry_price) * 100;
              const isPnlPositive = pnlValue >= 0;
              const pnlClass = isPnlPositive ? 'positive' : 'negative';
              const pnlSign = isPnlPositive ? '+' : '';
              const cardPnlClass = isPnlPositive ? 'pnl-positive' : 'pnl-negative';

              return (
                <motion.div
                  key={pos.id}
                  className={`pv-position-card ${cardPnlClass}`}
                  onClick={() => navigate(`/portfolio/positions/${pos.symbol}`)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: idx * 0.06 }}
                  data-testid={`position-card-${pos.symbol}`}
                >
                  {/* Card Header: Symbol + Qty */}
                  <div className="pv-position-header">
                    <div className="pv-position-symbol-group">
                      <span className="pv-position-symbol">{pos.symbol}</span>
                      <span className="pv-paper-tag">PAPER</span>
                    </div>
                    <span className="pv-qty-badge">{pos.quantity} shares</span>
                  </div>

                  {/* 4-cell metric grid */}
                  <div className="pv-metric-row">
                    <div className="pv-metric-cell">
                      <span className="pv-metric-label">Avg Entry</span>
                      <span className="pv-metric-value">
                        {currencySymbol}{formatPrice(pos.average_entry_price)}
                      </span>
                    </div>
                    <div className="pv-metric-cell">
                      <span className="pv-metric-label">Current</span>
                      <span className="pv-metric-value">
                        {currencySymbol}{formatPrice(currentPrice)}
                      </span>
                    </div>
                    <div className="pv-metric-cell">
                      <span className="pv-metric-label">Value</span>
                      <span className="pv-metric-value">
                        {currencySymbol}{formatPrice(positionValue)}
                      </span>
                    </div>
                    <div className="pv-metric-cell">
                      <span className="pv-metric-label">P&amp;L</span>
                      <span className={`pv-metric-value ${pnlClass}`}>
                        {pnlSign}{currencySymbol}{formatPrice(Math.abs(pnlValue))}
                        <span className="pv-pnl-pct">
                          {' '}({pnlSign}{pnlPercent.toFixed(2)}%)
                        </span>
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── WATCHLIST HOLDINGS ─── */}
      {portfolio.holdings.length > 0 && (() => {
        const totalPages = Math.ceil(portfolio.holdings.length / WATCHLIST_PER_PAGE);
        const pageHoldings = portfolio.holdings.slice(
          watchlistPage * WATCHLIST_PER_PAGE,
          (watchlistPage + 1) * WATCHLIST_PER_PAGE,
        );

        return (
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
          >
            {/* Section header */}
            <div className="pv-section-header">
              <div>
                <span className="pv-section-title" style={{ color: '#94a3b8' }}>
                  Watchlist
                </span>
                <span className="pv-section-count">({portfolio.holdings.length})</span>
              </div>
              {totalPages > 1 && (
                <div className="pv-pagination-controls">
                  <button
                    className="pv-page-btn"
                    onClick={() => setWatchlistPage((p) => Math.max(0, p - 1))}
                    disabled={watchlistPage === 0}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  <span className="pv-page-indicator">
                    {watchlistPage + 1} / {totalPages}
                  </span>
                  <button
                    className="pv-page-btn"
                    onClick={() => setWatchlistPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={watchlistPage === totalPages - 1}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            {/* Paginated grid — row by row */}
            <div className="pv-watchlist-grid">
              {pageHoldings.map((holding, idx) => {
                const globalIdx = watchlistPage * WATCHLIST_PER_PAGE + idx;
                const bgAccent = ACCENT_BG_COLORS[globalIdx % ACCENT_BG_COLORS.length];
                const textAccent = ACCENT_TEXT_COLORS[globalIdx % ACCENT_TEXT_COLORS.length];
                const isPositive = (holding.percent_change || 0) >= 0;
                const changeClass = isPositive ? 'positive' : 'negative';
                const isAnalyzingThis = analyzingSymbol === holding.symbol;

                return (
                  <motion.div
                    key={holding.id || holding.symbol}
                    className="pv-watchlist-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: idx * 0.04 }}
                    onClick={() => {
                      if (onSelectStock) onSelectStock(holding.symbol);
                    }}
                  >
                    {/* Card Top: Avatar + Symbol + Delete */}
                    <div className="pv-watchlist-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          className="pv-watchlist-avatar"
                          style={{ background: bgAccent, color: textAccent }}
                        >
                          {holding.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <div className="pv-watchlist-symbol">{holding.symbol}</div>
                          <div className="pv-watchlist-subtitle">
                            {holding.currency || 'USD'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="pv-watchlist-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerRemoveHolding(holding.symbol);
                        }}
                        title="Remove from watchlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Price + Change + Sparkline */}
                    <div className="pv-watchlist-price-row">
                      <div>
                        <div className="pv-watchlist-price">
                          ${formatPrice(holding.price)}
                        </div>
                        {holding.percent_change !== undefined && holding.percent_change !== null && (
                          <div className={`pv-watchlist-change ${changeClass}`}>
                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {isPositive ? '+' : ''}{holding.percent_change.toFixed(2)}%
                          </div>
                        )}
                      </div>
                      <div className="pv-watchlist-chart-area">
                        <Sparkline symbol={holding.symbol} change={holding.percent_change || 0} width={100} height={42} />
                      </div>
                    </div>

                    {/* Analyze with AI */}
                    <button
                      type="button"
                      className="pv-analyze-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeWithAI(holding.symbol);
                      }}
                      disabled={isAnalyzingThis}
                      data-testid={`analyze-ai-btn-${holding.symbol}`}
                      title="Evaluate asset with Agent 3 Strategy Engine"
                    >
                      <Sparkles size={13} />
                      {isAnalyzingThis ? 'Analyzing...' : 'Analyze with AI'}
                    </button>

                    {/* Footer: Date + Action icons */}
                    <div className="pv-watchlist-actions">
                      <span className="pv-watchlist-added">
                        {new Date(holding.created_at).toLocaleDateString()}
                      </span>
                      <div className="pv-action-btns">
                        <button
                          type="button"
                          className="pv-icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal(holding.symbol, holding.price || undefined);
                          }}
                          title="Set price alert"
                        >
                          <Bell size={13} />
                        </button>
                        <button
                          type="button"
                          className="pv-icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectStock) onSelectStock(holding.symbol);
                          }}
                          title="View Trading Chart"
                        >
                          <ExternalLink size={13} />
                        </button>
                        <button
                          type="button"
                          className="pv-icon-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onViewIndicators) onViewIndicators(holding.symbol);
                          }}
                          title="View Technical Indicators"
                        >
                          <Activity size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Dot indicators */}
            {totalPages > 1 && (
              <div className="pv-page-dots">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`pv-page-dot ${i === watchlistPage ? 'active' : ''}`}
                    onClick={() => setWatchlistPage(i)}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* AI STRATEGY SIGNAL MODAL */}
      <AISignalModal
        isOpen={isSignalModalOpen}
        onClose={() => setIsSignalModalOpen(false)}
        signal={activeSignal}
        onProposeTrade={handleProposeTradeFromSignal}
      />

      {/* CREATE TRADE PROPOSAL MODAL */}
      <CreateProposalModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        initialData={draftProposal}
      />

      {/* PRE-RISK REVIEW MODAL */}
      <PreRiskReviewModal
        isOpen={isReviewModalOpen}
        onClose={closeReviewModal}
      />
    </motion.div>
  );
};
