import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  TrendingUp,
  TrendingDown,
  Brain,
  CheckCircle2,
  Copy,
  Check,
  Code,
  Info,
  Clock,
} from 'lucide-react';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import type { TradeProposal } from '@/types/tradeProposal.types';
import '@/styles/components/tradeProposal.css';

interface PreRiskReviewModalProps {
  proposal?: TradeProposal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PreRiskReviewModal: React.FC<PreRiskReviewModalProps> = ({
  proposal: propProposal,
  isOpen,
  onClose,
}) => {
  const storeActiveProposal = useTradeProposalStore((state) => state.activeProposal);
  const proposal = propProposal !== undefined ? propProposal : storeActiveProposal;

  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !proposal) return null;

  const isBuy = proposal.action === 'BUY';
  const entry = proposal.entry_price || 0;
  const sl = proposal.stop_loss || 0;
  const tp = proposal.take_profit || 0;
  const qty = proposal.requested_quantity || 0;

  // Exact metrics calculations (Direction-aware)
  const riskAmountPerShare = isBuy ? Math.max(0, entry - sl) : Math.max(0, sl - entry);
  const rewardAmountPerShare = isBuy ? Math.max(0, tp - entry) : Math.max(0, entry - tp);

  let riskRewardRatio = 0;
  if (riskAmountPerShare > 0) {
    riskRewardRatio = Number((rewardAmountPerShare / riskAmountPerShare).toFixed(2));
  }

  const stopLossPercent = entry > 0 ? Number(((isBuy ? (entry - sl) : (sl - entry)) / entry * 100).toFixed(2)) : 0;
  const takeProfitPercent = entry > 0 ? Number(((isBuy ? (tp - entry) : (entry - tp)) / entry * 100).toFixed(2)) : 0;
  const estimatedPositionValue = Number((qty * entry).toFixed(2));
  const maxTotalRiskDollars = Number((qty * riskAmountPerShare).toFixed(2));

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(proposal, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to truncate IDs cleanly
  const truncateId = (id?: string) => {
    if (!id) return 'N/A';
    if (id.length <= 16) return id;
    return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
  };

  return (
    <div className="tp-modal-overlay" onClick={onClose} data-testid="review-modal-overlay">
      <div
        className="tp-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
        data-testid="review-modal-card"
      >
        {/* Modal Header */}
        <div className="tp-modal-header">
          <div className="tp-header-title-group">
            <div className="tp-modal-title">
              <ShieldAlert size={20} color="#f59e0b" />
              <span>Pre-Risk Stage</span>
              <span className="tp-paper-badge">PAPER TRADING</span>
            </div>
            <div className="tp-subtitle">
              Proposal awaiting Agent 4 Risk Evaluation
            </div>
          </div>
          <button className="tp-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

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

          {/* Proposal Summary Header Banner */}
          <div className="tp-review-summary-banner">
            <div className="tp-banner-symbol-group">
              <span className="tp-banner-symbol">{proposal.symbol}</span>
              <span
                className={`tp-banner-action-badge ${isBuy ? 'buy' : 'sell'}`}
                data-testid="proposal-action-badge"
              >
                {isBuy ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{proposal.action}</span>
              </span>
            </div>

            <div className="tp-banner-status-group">
              <span className="tp-banner-status-badge pending">
                <Clock size={13} />
                <span>PENDING RISK</span>
              </span>
              <span className="tp-status-subtext">Waiting for Agent 4 Risk Analysis</span>
            </div>
          </div>

          {/* Strategy & Confidence Section */}
          <div className="tp-section-divider">
            <Brain size={14} color="#f59e0b" />
            <span>Strategy & Confidence</span>
          </div>
          <div className="tp-metadata-list" style={{ marginTop: '0.5rem' }}>
            <div className="tp-metadata-row">
              <span className="tp-meta-label">Primary Strategy:</span>
              <span className="tp-meta-value" style={{ fontWeight: 700 }}>{proposal.primary_strategy}</span>
            </div>
            <div className="tp-metadata-row">
              <span className="tp-meta-label">AI Confidence:</span>
              <span className="tp-meta-value" style={{ fontWeight: 700, color: '#c084fc' }}>
                {Math.round((proposal.confidence_score || 0) * 100)}%
              </span>
            </div>
          </div>

          {/* Trade Parameters Section */}
          <div className="tp-section-divider">
            <span>Trade Parameters</span>
          </div>
          <div className="tp-metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '0.5rem' }}>
            <div className="tp-metric-card" style={{ padding: '0.75rem' }}>
              <div className="tp-metric-label" style={{ fontSize: '0.65rem' }}>Entry Price</div>
              <div className="tp-metric-value" style={{ fontSize: '1.05rem' }}>${entry.toFixed(2)}</div>
            </div>
            <div className="tp-metric-card" style={{ padding: '0.75rem' }}>
              <div className="tp-metric-label" style={{ fontSize: '0.65rem' }}>Stop Loss</div>
              <div className="tp-metric-value danger" style={{ fontSize: '1.05rem' }}>${sl.toFixed(2)}</div>
              <div className="tp-metric-subtext">Level: ${sl.toFixed(2)}</div>
            </div>
            <div className="tp-metric-card" style={{ padding: '0.75rem' }}>
              <div className="tp-metric-label" style={{ fontSize: '0.65rem' }}>Take Profit</div>
              <div className="tp-metric-value success" style={{ fontSize: '1.05rem' }}>${tp.toFixed(2)}</div>
              <div className="tp-metric-subtext">Level: ${tp.toFixed(2)}</div>
            </div>
            <div className="tp-metric-card" style={{ padding: '0.75rem' }}>
              <div className="tp-metric-label" style={{ fontSize: '0.65rem' }}>Risk / Reward</div>
              <div className="tp-metric-value highlight" style={{ fontSize: '1.05rem' }}>1 : {riskRewardRatio}</div>
            </div>
          </div>


          {/* Position Section */}
          <div className="tp-section-divider">
            <span>Position</span>
          </div>
          <div className="tp-metrics-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '0.5rem' }}>
            <div className="tp-metric-card">
              <div className="tp-metric-label">Quantity</div>
              <div className="tp-metric-value">{qty} shares</div>
            </div>
            <div className="tp-metric-card">
              <div className="tp-metric-label">Position Value</div>
              <div className="tp-metric-value">${estimatedPositionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>

          {/* Risk Metrics Section */}
          <div className="tp-section-divider">
            <span>Risk Metrics</span>
          </div>
          <div className="tp-metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '0.5rem' }}>
            <div className="tp-metric-card" style={{ padding: '0.75rem' }}>
              <div className="tp-metric-label" style={{ fontSize: '0.65rem' }}>Max Risk</div>
              <div className="tp-metric-value danger" style={{ fontSize: '1.05rem' }}>
                ${maxTotalRiskDollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="tp-metric-card" style={{ padding: '0.75rem' }}>
              <div className="tp-metric-label" style={{ fontSize: '0.65rem' }}>Risk / Share</div>
              <div className="tp-metric-value danger" style={{ fontSize: '1.05rem' }}>
                ${riskAmountPerShare.toFixed(2)}
              </div>
            </div>
            <div className="tp-metric-card" style={{ padding: '0.75rem' }}>
              <div className="tp-metric-label" style={{ fontSize: '0.65rem' }}>Stop Distance</div>
              <div className="tp-metric-value" style={{ fontSize: '1.05rem', color: '#cbd5e1' }}>
                {stopLossPercent}%
              </div>
            </div>
            <div className="tp-metric-card" style={{ padding: '0.75rem' }}>
              <div className="tp-metric-label" style={{ fontSize: '0.65rem' }}>Take Profit Distance</div>
              <div className="tp-metric-value" style={{ fontSize: '1.05rem', color: '#cbd5e1' }}>
                {takeProfitPercent}%
              </div>
            </div>
          </div>

          {/* Agent 4 Status Banner */}
          <div className="tp-stage-info-card">
            <div className="tp-info-title">
              <CheckCircle2 size={16} color="#34d399" />
              <span>LOGGED & STAGED FOR AGENT 4</span>
            </div>
            <p className="tp-info-body">
              Proposal has been successfully stored in AI-Service and is awaiting Agent 4 Risk Evaluation.
            </p>
          </div>

          {/* Proposal Details Section */}
          <div className="tp-section-divider">
            <span>Proposal Details</span>
          </div>
          <div className="tp-metadata-list" style={{ marginTop: '0.5rem' }}>
            <div className="tp-metadata-row">
              <span className="tp-meta-label">Proposal ID:</span>
              <span className="tp-meta-value code" title={proposal.id}>{truncateId(proposal.id)}</span>
            </div>
            {proposal.portfolio_id && (
              <div className="tp-metadata-row">
                <span className="tp-meta-label">Portfolio ID:</span>
                <span className="tp-meta-value code" title={proposal.portfolio_id}>{truncateId(proposal.portfolio_id)}</span>
              </div>
            )}
            {proposal.signal_id && (
              <div className="tp-metadata-row">
                <span className="tp-meta-label">Signal ID:</span>
                <span className="tp-meta-value code" title={proposal.signal_id}>{truncateId(proposal.signal_id)}</span>
              </div>
            )}
            {proposal.created_at && (
              <div className="tp-metadata-row">
                <span className="tp-meta-label">Created At:</span>
                <span className="tp-meta-value">
                  {new Date(proposal.created_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Raw JSON Inspect Toggle */}
          <div className="tp-raw-json-container">
            <div className="tp-json-header">
              <button
                type="button"
                className="tp-btn-text"
                onClick={() => setShowRawJson(!showRawJson)}
                data-testid="toggle-json-btn"
              >
                <Code size={14} />
                <span>{showRawJson ? 'Hide Raw API JSON' : 'Inspect Raw API JSON'}</span>
              </button>

              {showRawJson && (
                <button
                  type="button"
                  className="tp-btn-icon"
                  onClick={handleCopyJson}
                  title="Copy JSON"
                  data-testid="copy-json-btn"
                >
                  {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                </button>
              )}
            </div>

            {showRawJson && (
              <pre className="tp-json-block" data-testid="raw-json-block">
                {JSON.stringify(proposal, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="tp-modal-footer">
          <button type="button" className="tp-btn-secondary" onClick={onClose} data-testid="close-review-modal-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

