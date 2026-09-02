import React from 'react';
import { Brain, ShieldAlert } from 'lucide-react';
import type { TradeProposal } from '@/types/tradeProposal.types';
import '@/styles/components/tradeProposal.css';

interface TradeProposalCardProps {
  proposal: TradeProposal;
  onReview: (proposal: TradeProposal) => void;
}

export const TradeProposalCard: React.FC<TradeProposalCardProps> = ({ proposal, onReview }) => {
  const isBuy = proposal.action === 'BUY';
  const entry = proposal.entry_price || 0;
  const sl = proposal.stop_loss || 0;
  const tp = proposal.take_profit || 0;
  const qty = proposal.requested_quantity || 0;

  const riskPerShare = isBuy ? Math.max(0, entry - sl) : Math.max(0, sl - entry);
  const rewardPerShare = isBuy ? Math.max(0, tp - entry) : Math.max(0, entry - tp);
  const rrRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : 'N/A';
  const confidencePct = Math.round((proposal.confidence_score || 0) * 100);

  const rawStatus = proposal.status || 'PENDING_RISK';
  const displayStatus = rawStatus.replace(/_/g, ' ');

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
      }}
      className="tp-card-hover"
      data-testid={`trade-proposal-card-${proposal.id}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
            {proposal.symbol}
          </span>
          <span className={isBuy ? 'tp-badge-buy' : 'tp-badge-sell'}>{proposal.action}</span>
          <span className={`tp-status-badge tp-status-${rawStatus.toLowerCase()}`}>
            {displayStatus}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#c084fc' }}>
          <Brain size={14} />
          <span style={{ fontWeight: 700 }}>{confidencePct}% Conf.</span>
        </div>
      </div>

      {/* Key Numbers Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '0.85rem',
          borderRadius: 10,
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Quantity</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{qty.toLocaleString()}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Entry Price</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>${entry.toFixed(2)}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Stop Loss</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ef4444' }}>${sl.toFixed(2)}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Take Profit</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#00e599' }}>${tp.toFixed(2)}</div>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
          <span>Strategy: <strong style={{ color: '#e2e8f0' }}>{proposal.primary_strategy}</strong></span>
          <span>•</span>
          <span>R:R: <strong style={{ color: '#00e599' }}>1:{rrRatio}</strong></span>
        </div>

        <button
          className="tp-btn-secondary"
          onClick={() => onReview(proposal)}
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          data-testid={`review-proposal-btn-${proposal.id}`}
        >
          <ShieldAlert size={14} color="#fbbf24" />
          <span>Pre-Risk Review</span>
        </button>
      </div>
    </div>
  );
};
