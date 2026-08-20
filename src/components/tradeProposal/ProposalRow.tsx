import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { TradeProposal } from '@/types/tradeProposal.types';

interface ProposalRowProps {
  proposal: TradeProposal;
  onReview: (proposal: TradeProposal) => void;
  index: number;
}

export const ProposalRow: React.FC<ProposalRowProps> = ({ proposal, onReview, index }) => {
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);

  const isBuy = proposal.action === 'BUY';
  const entry = proposal.entry_price || 0;
  const sl = proposal.stop_loss || 0;
  const tp = proposal.take_profit || 0;
  const qty = proposal.requested_quantity || 0;

  // Currency formatting: Indian symbols (.NS, .BO, INR, ₹) get ₹, others get $
  const isIndian =
    proposal.symbol.endsWith('.NS') ||
    proposal.symbol.endsWith('.BO');
  const currencySymbol = isIndian ? '₹' : '$';

  const formatPrice = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    if (Math.abs(val) < 0.0001) return '0.00';
    return val.toFixed(2);
  };

  // Risk & Reward Ratio calculation
  const riskPerShare = isBuy ? Math.max(0, entry - sl) : Math.max(0, sl - entry);
  const rewardPerShare = isBuy ? Math.max(0, tp - entry) : Math.max(0, entry - tp);
  const rrRatio = riskPerShare > 0 ? (rewardPerShare / riskPerShare).toFixed(2) : 'N/A';
  const confidencePct = Math.round((proposal.confidence_score || 0) * 100);

  const rawStatus = proposal.status || 'PENDING_RISK';

  // Short ID display (e.g. PROP-1234...)
  const shortId = proposal.id ? (proposal.id.length > 12 ? `PROP-${proposal.id.substring(0, 6)}` : proposal.id) : 'N/A';

  // Timestamp formatting
  const formattedTime = proposal.created_at
    ? new Date(proposal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  // Status Badge Helper
  const renderStatusBadge = () => {
    switch (rawStatus) {
      case 'RISK_APPROVED':
        return (
          <span className="tpl-status-badge approved">
            <ShieldCheck size={11} /> RISK APPROVED
          </span>
        );
      case 'EXECUTED':
        return (
          <span className="tpl-status-badge executed">
            <Zap size={11} /> EXECUTED
          </span>
        );
      case 'RISK_REJECTED':
      case 'REJECTED':
        return (
          <span className="tpl-status-badge rejected">
            <XCircle size={11} /> REJECTED
          </span>
        );
      case 'EXECUTION_FAILED':
        return (
          <span className="tpl-status-badge failed">
            <AlertTriangle size={11} /> FAILED
          </span>
        );
      default:
        return (
          <span className="tpl-status-badge pending">
            <Clock size={11} /> PENDING RISK
          </span>
        );
    }
  };

  return (
    <motion.div
      className={`tpl-row ${isBuy ? 'tpl-row-buy' : 'tpl-row-sell'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
      data-testid={`trade-proposal-card-${proposal.id}`}
    >
      {/* ── DESKTOP TABLE ROW LAYOUT ── */}
      <div className="tpl-desktop-row">
        {/* Symbol & Metadata */}
        <div className="tpl-col tpl-col-symbol">
          <div className="tpl-symbol-header">
            <span className="tpl-symbol-name">{proposal.symbol}</span>
            <span className="tpl-id-tag">{shortId}</span>
          </div>
          <span className="tpl-strategy-name" title={proposal.primary_strategy}>
            {proposal.primary_strategy || 'AI Strategy'}
          </span>
        </div>

        {/* Action Side */}
        <div className="tpl-col tpl-col-side">
          <span className={`tpl-side-badge ${isBuy ? 'buy' : 'sell'}`}>
            {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {proposal.action}
          </span>
        </div>

        {/* Status */}
        <div className="tpl-col tpl-col-status">
          {renderStatusBadge()}
        </div>

        {/* Entry Price */}
        <div className="tpl-col tpl-col-price">
          <span className="tpl-mono-val">{currencySymbol}{formatPrice(entry)}</span>
          <span className="tpl-sub-label">{qty} sh.</span>
        </div>

        {/* Stop Loss */}
        <div className="tpl-col tpl-col-sl">
          <span className="tpl-mono-val danger">{sl > 0 ? `${currencySymbol}${formatPrice(sl)}` : '—'}</span>
        </div>

        {/* Take Profit */}
        <div className="tpl-col tpl-col-tp">
          <span className="tpl-mono-val success">{tp > 0 ? `${currencySymbol}${formatPrice(tp)}` : '—'}</span>
        </div>

        {/* Risk / Reward */}
        <div className="tpl-col tpl-col-rr">
          <span className="tpl-mono-val highlight">{rrRatio !== 'N/A' ? `1:${rrRatio}` : '—'}</span>
        </div>

        {/* AI Confidence */}
        <div className="tpl-col tpl-col-conf">
          <div className="tpl-conf-cell">
            <Brain size={12} color="#a855f7" />
            <span className="tpl-conf-val">{confidencePct}%</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="tpl-col tpl-col-time">
          <span className="tpl-time-text">{formattedTime}</span>
        </div>

        {/* Action Button */}
        <div className="tpl-col tpl-col-action">
          <button
            type="button"
            className="tpl-action-btn"
            onClick={() => onReview(proposal)}
            data-testid={`review-proposal-btn-${proposal.id}`}
          >
            Review
          </button>
        </div>
      </div>

      {/* ── MOBILE COMPACT CARD LAYOUT ── */}
      <div className="tpl-mobile-card">
        <div className="tpl-mobile-header" onClick={() => setIsExpandedMobile(!isExpandedMobile)}>
          <div className="tpl-mobile-header-left">
            <span className="tpl-symbol-name">{proposal.symbol}</span>
            <span className={`tpl-side-badge ${isBuy ? 'buy' : 'sell'}`}>{proposal.action}</span>
            {renderStatusBadge()}
          </div>
          <div className="tpl-mobile-header-right">
            <span className="tpl-mono-val">{currencySymbol}{formatPrice(entry)}</span>
            <button type="button" className="tpl-expand-btn" aria-label="Toggle details">
              {isExpandedMobile ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Expanded Details */}
        {isExpandedMobile && (
          <div className="tpl-mobile-body">
            <div className="tpl-mobile-grid">
              <div>
                <span className="tpl-mobile-label">Strategy</span>
                <span className="tpl-mobile-val">{proposal.primary_strategy}</span>
              </div>
              <div>
                <span className="tpl-mobile-label">Stop Loss</span>
                <span className="tpl-mobile-val danger">{sl > 0 ? `${currencySymbol}${formatPrice(sl)}` : '—'}</span>
              </div>
              <div>
                <span className="tpl-mobile-label">Take Profit</span>
                <span className="tpl-mobile-val success">{tp > 0 ? `${currencySymbol}${formatPrice(tp)}` : '—'}</span>
              </div>
              <div>
                <span className="tpl-mobile-label">R:R Ratio</span>
                <span className="tpl-mobile-val highlight">{rrRatio !== 'N/A' ? `1:${rrRatio}` : '—'}</span>
              </div>
              <div>
                <span className="tpl-mobile-label">AI Confidence</span>
                <span className="tpl-mobile-val purple">{confidencePct}%</span>
              </div>
              <div>
                <span className="tpl-mobile-label">Quantity</span>
                <span className="tpl-mobile-val">{qty} shares</span>
              </div>
            </div>

            <div className="tpl-mobile-footer">
              <span className="tpl-id-tag">{shortId} • {formattedTime}</span>
              <button
                type="button"
                className="tpl-action-btn"
                onClick={() => onReview(proposal)}
                data-testid={`review-proposal-btn-${proposal.id}`}
              >
                Review Proposal
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
