import React, { useState, useEffect } from 'react';
import { X, Send, AlertTriangle, Sparkles, User, Brain, Info, FolderPlus } from 'lucide-react';
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

  // Load portfolios on modal open
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

    if (!selectedPortfolioId) {
      return;
    }

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
    if (res) {
      onClose();
    }
  };

  return (
    <div className="tp-modal-overlay" onClick={onClose} data-testid="create-modal-overlay">
      <div
        className="tp-modal-card"
        onClick={(e) => e.stopPropagation()}
        data-testid="create-modal-card"
      >
        {/* Header */}
        <div className="tp-modal-header">
          <div className="tp-header-title-group">
            <div className="tp-modal-title">
              <Sparkles size={20} color="#3b82f6" />
              <span>Create Trade Proposal</span>
              <span className="tp-paper-badge">PAPER TRADING</span>
            </div>
            <div className="tp-subtitle">
              Log persistent proposal into AI-Service to stage for Pre-Risk Review
            </div>
          </div>
          <button className="tp-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tp-modal-body">
            {/* Paper Trading Notice */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 8,
                padding: '0.65rem 0.9rem',
                fontSize: '0.8rem',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Info size={15} />
              <span>Simulated trade — no real money is involved. Paper trading environment only.</span>
            </div>

            {error && (
              <div className="tp-error-banner" data-testid="proposal-error-banner">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* SECTION 1: USER CONFIGURATION */}
            <div className="tp-section-divider">
              <User size={14} color="#3b82f6" />
              <span>User Configuration</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Portfolio Selector */}
              <div className="tp-form-group">
                <label className="tp-form-label">Paper Portfolio</label>
                {isLoadingPortfolios ? (
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', padding: '0.5rem 0' }}>
                    Loading Paper Portfolios...
                  </div>
                ) : portfolios.length === 0 ? (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px border-dashed rgba(239, 68, 68, 0.2)',
                      borderRadius: 8,
                      padding: '0.9rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem',
                    }}
                    data-testid="no-portfolio-alert"
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>
                      No Paper Portfolio
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                      Create a Paper Portfolio first to submit a Trade Proposal.
                    </div>
                    <button
                      type="button"
                      className="tp-btn-secondary"
                      onClick={handleCreatePaperPortfolio}
                      disabled={isCreatingPortfolio}
                      style={{ alignSelf: 'flex-start', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      data-testid="create-paper-portfolio-btn"
                    >
                      <FolderPlus size={14} />
                      {isCreatingPortfolio ? 'Creating Portfolio...' : 'Create Paper Portfolio'}
                    </button>
                  </div>
                ) : (
                  <select
                    className="tp-form-select"
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

              {/* Requested Quantity Input */}
              <div
                className="tp-form-group"
                style={{
                  background: 'rgba(59, 130, 246, 0.05)',
                  padding: '0.85rem',
                  borderRadius: 10,
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <label className="tp-form-label" style={{ color: '#60a5fa', fontWeight: 700 }}>
                  Requested Quantity (Shares)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="tp-form-input"
                  value={requestedQuantity}
                  onChange={(e) => setRequestedQuantity(Number(e.target.value))}
                  required
                  style={{ fontSize: '1.05rem', fontWeight: 700 }}
                  data-testid="quantity-input"
                />
                <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                  Total Est. Value: ${(requestedQuantity * entryPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* SECTION 2: AI STRATEGY OUTPUT */}
            <div className="tp-section-divider" style={{ marginTop: '0.75rem' }}>
              <Brain size={14} color="#a855f7" />
              <span>AI Strategy Parameters {isFromSignal ? '(Pre-filled from AI Signal)' : ''}</span>
            </div>

            <div className="tp-form-grid">
              <div className="tp-form-group">
                <label className="tp-form-label">Ticker Symbol</label>
                <input
                  type="text"
                  className="tp-form-input"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. NVDA, AAPL"
                />
              </div>

              <div className="tp-form-group">
                <label className="tp-form-label">Action Side</label>
                <select
                  className="tp-form-select"
                  value={action}
                  onChange={(e) => setAction(e.target.value as TradeAction)}
                >
                  <option value="BUY">BUY (Long)</option>
                  <option value="SELL">SELL (Short)</option>
                </select>
              </div>
            </div>

            <div className="tp-form-grid">
              <div className="tp-form-group">
                <label className="tp-form-label">Entry Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="tp-form-input"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  required
                />
              </div>

              <div className="tp-form-group">
                <label className="tp-form-label">Stop Loss Level ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="tp-form-input"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="tp-form-grid">
              <div className="tp-form-group">
                <label className="tp-form-label">Take Profit Target ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="tp-form-input"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  required
                />
              </div>

              <div className="tp-form-group">
                <label className="tp-form-label">Primary Strategy</label>
                <input
                  type="text"
                  className="tp-form-input"
                  value={primaryStrategy}
                  onChange={(e) => setPrimaryStrategy(e.target.value)}
                  placeholder="Strategy name"
                />
              </div>
            </div>
          </div>

          <div className="tp-modal-footer">
            <button type="button" className="tp-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="tp-btn-primary"
              disabled={isSubmitting || !selectedPortfolioId}
              data-testid="submit-proposal-btn"
            >
              <Send size={15} />
              {isSubmitting ? 'Creating Proposal...' : 'Submit Trade Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
