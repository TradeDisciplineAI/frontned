import React, { useState } from 'react';
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
} from 'lucide-react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { usePriceAlertStore } from '@/stores/priceAlertStore';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { agent3Service, type TradeSignal } from '@/services/agent3.service';
import { AISignalModal } from '@/components/tradeProposal/AISignalModal';
import { CreateProposalModal } from '@/components/tradeProposal/CreateProposalModal';
import { PreRiskReviewModal } from '@/components/tradeProposal/PreRiskReviewModal';
import { Sparkline } from '@/components/ui/Sparkline';
import '@/styles/components/portfolio.css';

interface PortfolioViewProps {
  onSelectStock?: (symbol: string) => void;
  onViewIndicators?: (symbol: string) => void;
}

const ACCENT_BG_COLORS = [
  'rgba(16, 185, 129, 0.08)', // Emerald
  'rgba(6, 182, 212, 0.08)', // Cyan
  'rgba(59, 130, 246, 0.08)', // Blue
  'rgba(99, 102, 241, 0.08)', // Indigo
  'rgba(139, 92, 246, 0.08)', // Violet
];

const ACCENT_TEXT_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onSelectStock, onViewIndicators }) => {
  const { portfolio, isLoading, triggerRemoveHolding } = usePortfolioStore();
  const openModal = usePriceAlertStore((state) => state.openModal);

  const {
    isCreateModalOpen,
    isReviewModalOpen,
    draftProposal,
    openCreateModal,
    closeCreateModal,
    closeReviewModal,
  } = useTradeProposalStore();

  const [analyzingSymbol, setAnalyzingSymbol] = useState<string | null>(null);
  const [activeSignal, setActiveSignal] = useState<TradeSignal | null>(null);
  const [isSignalModalOpen, setIsSignalModalOpen] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const formatPrice = (price?: number) => {
    if (!price) return '0.00';
    if (price < 0.01) {
      return price.toExponential(5);
    }
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

  if (isLoading) {
    return (
      <div className="portfolio-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#9ca3af' }}>Loading portfolio details...</p>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  const positions = portfolio.positions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Analysis Error Alert */}
      {analysisError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          data-testid="ai-analysis-error-banner"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span>{analysisError}</span>
          </div>
          <button
            onClick={() => setAnalysisError(null)}
            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Portfolio Header with Paper Trading Badge */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 14,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Briefcase size={22} color="#3b82f6" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              {portfolio.name || 'My Paper Portfolio'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Portfolio ID: {portfolio.id}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            <ShieldCheck size={14} />
            PAPER TRADING
          </span>
        </div>
      </div>

      {/* PAPER POSITIONS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#3b82f6',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            Paper Positions ({positions.length})
          </span>
        </div>

        {positions.length === 0 ? (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.3)',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: '20px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.875rem',
            }}
            data-testid="empty-paper-positions"
          >
            No paper positions yet.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {positions.map((pos) => (
              <div
                key={pos.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: 12,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                    {pos.symbol}
                  </span>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {pos.quantity} shares
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Avg Entry: <strong style={{ color: '#cbd5e1' }}>${pos.average_entry_price.toFixed(2)}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Position Value: <strong style={{ color: '#60a5fa' }}>${(pos.quantity * pos.average_entry_price).toFixed(2)}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WATCHLIST / ACTIVE HOLDINGS SECTION */}
      {portfolio.holdings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#94a3b8',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Watchlist Holdings ({portfolio.holdings.length})
            </span>
          </div>

          <div className="holdings-grid">
            <style>{`
              .holdings-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 24px;
              }
              @media (max-width: 767px) {
                .holdings-grid {
                  grid-template-columns: 1fr;
                  gap: 16px;
                }
              }
              .asset-card {
                background: rgba(15, 23, 42, 0.45);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 16px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
                position: relative;
                cursor: pointer;
                transition: border-color 0.2s ease, background-color 0.2s ease;
              }
              .asset-card:hover {
                border-color: rgba(255, 255, 255, 0.12);
                background-color: rgba(30, 41, 59, 0.3);
              }
            `}</style>

            {portfolio.holdings.map((holding, idx) => {
              const bgAccent = ACCENT_BG_COLORS[idx % ACCENT_BG_COLORS.length];
              const textAccent = ACCENT_TEXT_COLORS[idx % ACCENT_TEXT_COLORS.length];
              const isPositive = (holding.percent_change || 0) >= 0;
              const statusColor = isPositive ? '#10b981' : '#ef4444';
              const isAnalyzingThis = analyzingSymbol === holding.symbol;

              return (
                <motion.div
                  key={holding.id || holding.symbol}
                  className="asset-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  onClick={() => {
                    if (onSelectStock) onSelectStock(holding.symbol);
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        className="asset-avatar"
                        style={{ background: bgAccent, color: textAccent }}
                      >
                        {holding.symbol.substring(0, 2)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="asset-title">{holding.symbol}</span>
                        <span className="asset-subtitle">
                          {holding.currency || 'USD'} • US Market
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Analyze with AI Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnalyzeWithAI(holding.symbol);
                        }}
                        disabled={isAnalyzingThis}
                        style={{
                          background: 'rgba(168, 85, 247, 0.12)',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          color: '#c084fc',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        data-testid={`analyze-ai-btn-${holding.symbol}`}
                        title="Evaluate asset with Agent 3 Strategy Engine"
                      >
                        <Sparkles size={13} color="#c084fc" />
                        <span>{isAnalyzingThis ? 'Analyzing...' : 'Analyze with AI'}</span>
                      </button>

                      <button
                        type="button"
                        className="asset-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerRemoveHolding(holding.symbol);
                        }}
                        title="Remove from portfolio"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      margin: '4px 0',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="asset-badge-price">${formatPrice(holding.price)}</span>

                      {holding.percent_change !== undefined && holding.percent_change !== null && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: statusColor,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {isPositive ? '+' : ''}
                          {holding.percent_change.toFixed(2)}%
                        </span>
                      )}
                    </div>

                    <Sparkline symbol={holding.symbol} change={holding.percent_change || 0} />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      paddingTop: '12px',
                      marginTop: '4px',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                      Added: {new Date(holding.created_at).toLocaleDateString()}
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="asset-btn-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(holding.symbol, holding.price || undefined);
                        }}
                        title="Set price threshold alarm"
                      >
                        <Bell size={12} />
                      </button>

                      <button
                        type="button"
                        className="asset-btn-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectStock) onSelectStock(holding.symbol);
                        }}
                        title="View Trading Chart"
                      >
                        <ExternalLink size={12} />
                      </button>

                      <button
                        type="button"
                        className="asset-btn-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewIndicators) onViewIndicators(holding.symbol);
                        }}
                        title="View Technical Indicators"
                      >
                        <Activity size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

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
    </div>
  );
};

export default PortfolioView;
