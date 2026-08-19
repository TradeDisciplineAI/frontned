import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  AlertTriangle,
  Sparkles,
  User,
  Brain,
  Info,
  FolderPlus,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { useUserStore } from '@/stores/userStore';
import { portfolioService, type Portfolio } from '@/services/portfolio.service';
import type { TradeAction, CreateTradeProposalDTO } from '@/types/tradeProposal.types';
import '@/styles/components/tradeProposal.css';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<CreateTradeProposalDTO> | null;
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { user } = useUserStore();
  const { createProposal, isSubmitting, error, clearError } = useTradeProposalStore();

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('');
  const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(false);
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);

  const [symbol, setSymbol] = useState('AAPL');
  const [action, setAction] = useState<TradeAction>('BUY');
  const [requestedQuantity, setRequestedQuantity] = useState(10);
  const [entryPrice, setEntryPrice] = useState(185.5);
  const [stopLoss, setStopLoss] = useState(178.0);
  const [takeProfit, setTakeProfit] = useState(205.0);
  const [primaryStrategy, setPrimaryStrategy] = useState('AI Momentum Breakout');
  const [confidenceScore, setConfidenceScore] = useState(0.88);
  const [signalId, setSignalId] = useState<string | undefined>(undefined);

  const isFromSignal = !!initialData?.signal_id || !!initialData?.symbol;
  const isBuy = action === 'BUY';
  const estimatedValue = requestedQuantity * entryPrice;
  const riskPerShare = isBuy ? entryPrice - stopLoss : stopLoss - entryPrice;
  const rewardPerShare = isBuy ? takeProfit - entryPrice : entryPrice - takeProfit;
  const rrRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : '—';

  useEffect(() => {
    if (!isOpen) return;
    const fetchUserPortfolios = async () => {
      setIsLoadingPortfolios(true);
      try {
        const p = await portfolioService.getPortfolio();
        if (p && p.id) {
          setPortfolios([p]);
          setSelectedPortfolioId(p.id);
        } else {
          setPortfolios([]);
          setSelectedPortfolioId('');
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setPortfolios([]);
          setSelectedPortfolioId('');
        }
      } finally {
        setIsLoadingPortfolios(false);
      }
    };
    fetchUserPortfolios();
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      if (initialData.symbol) setSymbol(initialData.symbol.toUpperCase());
      if (initialData.action) setAction(initialData.action);
      if (initialData.requested_quantity) setRequestedQuantity(initialData.requested_quantity);
      if (initialData.entry_price) setEntryPrice(initialData.entry_price);
      if (initialData.stop_loss) setStopLoss(initialData.stop_loss);
      if (initialData.take_profit) setTakeProfit(initialData.take_profit);
      if (initialData.primary_strategy) setPrimaryStrategy(initialData.primary_strategy);
      if (initialData.confidence_score !== undefined) setConfidenceScore(initialData.confidence_score);
      if (initialData.signal_id) setSignalId(initialData.signal_id);
    } else {
      setSymbol('AAPL');
      setAction('BUY');
      setRequestedQuantity(10);
      setEntryPrice(185.5);
      setStopLoss(178.0);
      setTakeProfit(205.0);
      setPrimaryStrategy('AI Momentum Breakout');
      setConfidenceScore(0.88);
      setSignalId(undefined);
    }
    clearError();
  }, [initialData, isOpen, clearError]);

  if (!isOpen) return null;

  const handleCreatePaperPortfolio = async () => {
    setIsCreatingPortfolio(true);
    try {
      const newPortfolio = await portfolioService.createPortfolio('My Paper Portfolio');
      if (newPortfolio && newPortfolio.id) {
        setPortfolios([newPortfolio]);
        setSelectedPortfolioId(newPortfolio.id);
      }
    } catch (err: any) {
      console.error('Failed to create paper portfolio', err);
    } finally {
      setIsCreatingPortfolio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolioId) return;

    const payload: CreateTradeProposalDTO = {
      user_id: user?.id || '00000000-0000-0000-0000-000000000001',
      portfolio_id: selectedPortfolioId,
      signal_id: signalId && signalId.startsWith('SIG-') ? signalId : `SIG-PROP-${Date.now()}`,
      symbol: symbol.trim().toUpperCase(),
      action,
      requested_quantity: Number(requestedQuantity),
      entry_price: Number(entryPrice),
      stop_loss: Number(stopLoss),
      take_profit: Number(takeProfit),
      confidence_score: Number(confidenceScore),
      primary_strategy: primaryStrategy.trim(),
    };

    const res = await createProposal(payload);
    if (res) onClose();
  };

  return (
    <div className="tp-modal-overlay" onClick={onClose} data-testid="create-modal-overlay">
      <motion.div
        className="cpm-card"
        onClick={(e) => e.stopPropagation()}
        data-testid="create-modal-card"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Header ── */}
        <div className="cpm-header">
          <div className="cpm-header-grid" aria-hidden="true" />
          <div className="cpm-header-left">
            <div className="cpm-header-icon">
              <Sparkles size={18} color="#3b82f6" />
            </div>
            <div>
              <div className="cpm-header-title-row">
                <h2 className="cpm-header-title">Create Trade Proposal</h2>
                <span className="cpm-paper-badge">
                  <ShieldCheck size={11} />
                  PAPER
                </span>
                {isFromSignal && (
                  <span className="cpm-ai-badge">
                    <Brain size={11} />
                    AI SIGNAL
                  </span>
                )}
              </div>
              <p className="cpm-header-sub">Stage a paper trade for Pre-Risk Review</p>
            </div>
          </div>
          <button className="cpm-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="cpm-body">

            {/* Simulated trade notice */}
            <div className="cpm-notice">
              <Info size={13} />
              <span>Simulated trade — no real money is involved. Paper trading environment only.</span>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="cpm-error-banner"
                  data-testid="proposal-error-banner"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertTriangle size={14} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── SECTION 1: User Config ── */}
            <div className="cpm-section-header">
              <User size={13} color="#3b82f6" />
              <span>User Configuration</span>
            </div>

            <div className="cpm-section-body">
              {/* Portfolio Selector */}
              <div className="cpm-form-group">
                <label className="cpm-label">Paper Portfolio</label>
                {isLoadingPortfolios ? (
                  <div className="cpm-loading-text">Loading portfolios…</div>
                ) : portfolios.length === 0 ? (
                  <div className="cpm-no-portfolio-box" data-testid="no-portfolio-alert">
                    <div className="cpm-no-portfolio-title">No Paper Portfolio Found</div>
                    <div className="cpm-no-portfolio-desc">
                      Create a Paper Portfolio first to submit a Trade Proposal.
                    </div>
                    <button
                      type="button"
                      className="cpm-btn-create-portfolio"
                      onClick={handleCreatePaperPortfolio}
                      disabled={isCreatingPortfolio}
                      data-testid="create-paper-portfolio-btn"
                    >
                      <FolderPlus size={13} />
                      {isCreatingPortfolio ? 'Creating...' : 'Create Paper Portfolio'}
                    </button>
                  </div>
                ) : (
                  <select
                    className="cpm-select"
                    value={selectedPortfolioId}
                    onChange={(e) => setSelectedPortfolioId(e.target.value)}
                    required
                    data-testid="portfolio-select"
                  >
                    {portfolios.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.type || 'PAPER'}) — ID: {p.id.substring(0, 8)}...
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Quantity */}
              <div className="cpm-qty-box">
                <div className="cpm-qty-header">
                  <label className="cpm-qty-label">Requested Quantity (Shares)</label>
                  <span className="cpm-est-value">
                    Est. ${estimatedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="cpm-qty-input"
                  value={requestedQuantity}
                  onChange={(e) => setRequestedQuantity(Number(e.target.value))}
                  required
                  data-testid="quantity-input"
                />
              </div>
            </div>

            {/* ── SECTION 2: AI Strategy Parameters ── */}
            <div className="cpm-section-header" style={{ marginTop: '4px' }}>
              <Brain size={13} color="#a855f7" />
              <span style={{ color: '#a855f7' }}>
                AI Strategy Parameters
                {isFromSignal && <span className="cpm-prefill-note"> · Pre-filled from AI Signal</span>}
              </span>
            </div>

            <div className="cpm-section-body">
              <div className="cpm-form-grid">
                <div className="cpm-form-group">
                  <label className="cpm-label">Ticker Symbol</label>
                  <input
                    type="text"
                    className="cpm-input"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    required
                    placeholder="e.g. NVDA, AAPL"
                  />
                </div>
                <div className="cpm-form-group">
                  <label className="cpm-label">Action Side</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      className={`cpm-select ${isBuy ? 'cpm-select-buy' : 'cpm-select-sell'}`}
                      value={action}
                      onChange={(e) => setAction(e.target.value as TradeAction)}
                    >
                      <option value="BUY">BUY (Long)</option>
                      <option value="SELL">SELL (Short)</option>
                    </select>
                    <div className="cpm-action-icon">
                      {isBuy
                        ? <TrendingUp size={13} color="#10b981" />
                        : <TrendingDown size={13} color="#ef4444" />
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="cpm-form-grid">
                <div className="cpm-form-group">
                  <label className="cpm-label">Entry Price ($)</label>
                  <input
                    type="number" step="0.01" min="0.01"
                    className="cpm-input"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="cpm-form-group">
                  <label className="cpm-label cpm-label-danger">Stop Loss ($)</label>
                  <input
                    type="number" step="0.01" min="0.01"
                    className="cpm-input cpm-input-danger"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="cpm-form-grid">
                <div className="cpm-form-group">
                  <label className="cpm-label cpm-label-success">Take Profit ($)</label>
                  <input
                    type="number" step="0.01" min="0.01"
                    className="cpm-input cpm-input-success"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="cpm-form-group">
                  <label className="cpm-label">Primary Strategy</label>
                  <input
                    type="text"
                    className="cpm-input"
                    value={primaryStrategy}
                    onChange={(e) => setPrimaryStrategy(e.target.value)}
                    placeholder="Strategy name"
                  />
                </div>
              </div>

              {/* R/R Summary strip */}
              <div className="cpm-rr-strip">
                <div className="cpm-rr-cell">
                  <span className="cpm-rr-label">Risk/Share</span>
                  <span className="cpm-rr-val danger">${Math.abs(riskPerShare).toFixed(2)}</span>
                </div>
                <div className="cpm-rr-divider" />
                <div className="cpm-rr-cell">
                  <span className="cpm-rr-label">Reward/Share</span>
                  <span className="cpm-rr-val success">${Math.abs(rewardPerShare).toFixed(2)}</span>
                </div>
                <div className="cpm-rr-divider" />
                <div className="cpm-rr-cell">
                  <span className="cpm-rr-label">R/R Ratio</span>
                  <span className="cpm-rr-val highlight">1 : {rrRatio}</span>
                </div>
                <div className="cpm-rr-divider" />
                <div className="cpm-rr-cell">
                  <span className="cpm-rr-label">Confidence</span>
                  <span className="cpm-rr-val">{(confidenceScore * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="cpm-footer">
            <button type="button" className="cpm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="cpm-btn-submit"
              disabled={isSubmitting || !selectedPortfolioId}
              data-testid="submit-proposal-btn"
            >
              <Send size={14} />
              {isSubmitting ? 'Creating…' : 'Submit Trade Proposal'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
