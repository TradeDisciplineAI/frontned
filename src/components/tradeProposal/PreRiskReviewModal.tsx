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
  AlertTriangle,
  XCircle,
  RotateCcw,
  ShieldCheck,
  Zap,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { useUserStore } from '@/stores/userStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
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

  const {
    riskEvaluation,
    riskLoading,
    riskError,
    evaluateProposalRisk,
    fetchProposalRisk,
    executionResult,
    executionLoading,
    executionError,
    executeTradeProposal,
  } = useTradeProposalStore();

  const { user } = useUserStore();
  const { fetchPortfolio } = usePortfolioStore();

  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExecuteConfirm, setShowExecuteConfirm] = useState(false);

  // Auto-trigger or load persisted risk evaluation when modal opens
  React.useEffect(() => {
    if (!isOpen || !proposal?.id) {
      setShowExecuteConfirm(false);
      return;
    }
    const loadRisk = async () => {
      const persisted = await fetchProposalRisk(proposal.id, user?.id);
      if (proposal.status === 'PENDING_RISK' && !persisted) {
        await evaluateProposalRisk(proposal.id, user?.id);
      }
    };
    loadRisk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, proposal?.id, proposal?.status, user?.id]);

  if (!isOpen || !proposal) return null;

  const isBuy = proposal.action === 'BUY';
  const entry = proposal.entry_price || 0;
  const sl = proposal.stop_loss || 0;
  const tp = proposal.take_profit || 0;
  const qty = proposal.requested_quantity || 0;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify({ proposal, riskEvaluation, executionResult }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    console.log('[Agent5] Confirm Execution clicked', { proposalId: proposal?.id, userId: user?.id });
    if (!proposal?.id || !user?.id) {
      console.warn('[Agent5] Missing proposalId or userId. Cannot execute.', { proposalId: proposal?.id, userId: user?.id });
      return;
    }
    setShowExecuteConfirm(false);
    const result = await executeTradeProposal(proposal.id, user.id);
    console.log('[Agent5] executeTradeProposal response:', result);
    if (result) fetchPortfolio();
  };

  const truncateId = (id?: string) => {
    if (!id) return 'N/A';
    if (id.length <= 16) return id;
    return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
  };

  const formatCheckName = (name: string) =>
    name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const severityStyle = (sev: string): React.CSSProperties => {
    const map: Record<string, { color: string; bg: string; border: string }> = {
      CRITICAL: { color: '#f87171', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.20)' },
      HIGH:     { color: '#f87171', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.14)' },
      MEDIUM:   { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
      LOW:      { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.16)' },
    };
    const s = map[sev] ?? { color: '#94a3b8', bg: 'rgba(148,163,184,0.07)', border: 'rgba(148,163,184,0.15)' };
    return {
      display: 'inline-block', fontSize: '0.6rem', fontWeight: 700, color: s.color,
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: 4,
      padding: '0.1rem 0.35rem', marginLeft: '0.45rem',
      verticalAlign: 'middle', letterSpacing: '0.04em',
    };
  };

  const decisionColors: Record<string, { accent: string; bg: string; border: string }> = {
    RISK_APPROVED: { accent: '#10b981', bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.20)' },
    NEEDS_REVIEW:  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.20)' },
    RISK_REJECTED: { accent: '#ef4444', bg: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.20)' },
  };

  const dc = riskEvaluation ? (decisionColors[riskEvaluation.decision] ?? decisionColors.NEEDS_REVIEW) : null;

  // Compute status badge content
  const renderStatusBadge = () => {
    if (executionLoading) return (
      <span className="prm-status-badge pending" data-testid="status-badge-loading">
        <Clock size={12} style={{ animation: 'spin 1s linear infinite' }} />
        EXECUTING…
      </span>
    );
    if (proposal.status === 'EXECUTED') return (
      <span className="prm-status-badge success" data-testid="status-badge-result">
        <CheckCircle2 size={12} />EXECUTED
      </span>
    );
    if (proposal.status === 'EXECUTION_FAILED') return (
      <span className="prm-status-badge danger" data-testid="status-badge-result">
        <XCircle size={12} />EXECUTION FAILED
      </span>
    );
    if (riskLoading) return (
      <span className="prm-status-badge pending" data-testid="status-badge-loading">
        <Clock size={12} style={{ animation: 'spin 1s linear infinite' }} />
        EVALUATING…
      </span>
    );
    if (riskEvaluation) return (
      <span className="prm-status-badge" style={{ background: dc!.bg, color: dc!.accent, border: `1px solid ${dc!.border}` }} data-testid="status-badge-result">
        {riskEvaluation.decision === 'RISK_APPROVED' ? <ShieldCheck size={12} />
          : riskEvaluation.decision === 'RISK_REJECTED' ? <XCircle size={12} />
          : <AlertTriangle size={12} />}
        {riskEvaluation.decision.replace('_', ' ')}
      </span>
    );
    return (
      <span className="prm-status-badge pending" data-testid="status-badge-pending">
        <Clock size={12} />PENDING RISK
      </span>
    );
  };

  const statusSubtext = executionLoading ? 'Executing trade…'
    : proposal.status === 'EXECUTED' ? 'Paper trade completed'
    : proposal.status === 'EXECUTION_FAILED' ? 'Execution failed'
    : riskLoading ? 'Running Agent 4 checks…'
    : riskEvaluation ? `Evaluated ${new Date(riskEvaluation.evaluated_at).toLocaleString()}`
    : 'Waiting for Agent 4 Risk Analysis';

  return (
    <div className="tp-modal-overlay" onClick={onClose} data-testid="review-modal-overlay">
      <motion.div
        className="prm-card"
        onClick={(e) => e.stopPropagation()}
        data-testid="review-modal-card"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative' }}
      >
        {/* ── Header ── */}
        <div className="prm-header">
          <div className="prm-header-grid" aria-hidden="true" />
          <div className="prm-header-left">
            <div className="prm-header-icon">
              <ShieldAlert size={18} color="#f59e0b" />
            </div>
            <div>
              <div className="prm-header-title-row">
                <h2 className="prm-header-title">Pre-Risk Stage</h2>
                <span className="prm-paper-badge">
                  <ShieldCheck size={11} /> PAPER
                </span>
              </div>
              <p className="prm-header-sub">
                <Activity size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Agent 4 Risk Engine
              </p>
            </div>
          </div>
          <button className="prm-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="prm-body">

          {/* Notice */}
          <div className="prm-notice">
            <Info size={13} />
            <span>Simulated trade — no real money involved. Paper trading environment only.</span>
          </div>

          {/* ── Proposal Banner: symbol + status ── */}
          <div className="prm-banner">
            <div className="prm-banner-left">
              <span className="prm-banner-symbol" data-testid="proposal-action-badge">{proposal.symbol}</span>
              <span className={`prm-action-badge ${isBuy ? 'buy' : 'sell'}`}>
                {isBuy ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {proposal.action}
              </span>
            </div>
            <div className="prm-banner-right">
              {renderStatusBadge()}
              <span className="prm-status-subtext">{statusSubtext}</span>
            </div>
          </div>

          {/* ── Trade Inputs grid ── */}
          <div className="prm-section-header">
            <span>Trade Inputs</span>
          </div>
          <div className="prm-inputs-grid">
            {[
              { label: 'Quantity',    value: `${qty} shares`,        cls: '' },
              { label: 'Entry Price', value: `$${entry.toFixed(2)}`, cls: '' },
              { label: 'Stop Loss',   value: `$${sl.toFixed(2)}`,   cls: 'danger' },
              { label: 'Take Profit', value: `$${tp.toFixed(2)}`,   cls: 'success' },
            ].map((m) => (
              <div key={m.label} className="prm-input-cell">
                <span className="prm-input-label">{m.label}</span>
                <span className={`prm-input-value ${m.cls}`}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* ── Strategy & Confidence ── */}
          <div className="prm-section-header">
            <Brain size={13} color="#f59e0b" />
            <span style={{ color: '#f59e0b' }}>Strategy &amp; Confidence</span>
          </div>
          <div className="prm-meta-box">
            <div className="prm-meta-row">
              <span className="prm-meta-label">Primary Strategy</span>
              <span className="prm-meta-value">{proposal.primary_strategy}</span>
            </div>
            <div className="prm-meta-row">
              <span className="prm-meta-label">AI Confidence</span>
              <span className="prm-meta-value" style={{ color: '#c084fc' }}>
                {Math.round((proposal.confidence_score || 0) * 100)}%
              </span>
            </div>
          </div>

          {/* ── Execution Result Panel ── */}
          {proposal.status === 'EXECUTED' && executionResult && (
            <>
              <div className="prm-section-header">
                <Zap size={13} color="#10b981" />
                <span style={{ color: '#10b981' }}>Execution Results</span>
              </div>
              <div className="prm-exec-success-box" data-testid="execution-result-panel">
                <div className="prm-exec-success-title">
                  <CheckCircle2 size={16} color="#10b981" />
                  PAPER TRADE EXECUTED ✓
                </div>
                <div className="prm-exec-prices">
                  <div className="prm-exec-price-cell">
                    <span className="prm-exec-price-label">Proposal Entry</span>
                    <span className="prm-exec-price-val muted">${entry.toFixed(2)}</span>
                  </div>
                  <div className="prm-exec-price-arrow">→</div>
                  <div className="prm-exec-price-cell">
                    <span className="prm-exec-price-label">Execution Price</span>
                    <span className="prm-exec-price-val success">${executionResult.execution_price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="prm-meta-box" style={{ marginTop: 0 }}>
                  <div className="prm-meta-row">
                    <span className="prm-meta-label">Execution ID</span>
                    <span className="prm-meta-value code">{executionResult.execution_id}</span>
                  </div>
                  <div className="prm-meta-row">
                    <span className="prm-meta-label">Filled Quantity</span>
                    <span className="prm-meta-value">{executionResult.filled_quantity} shares</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Execution Failed Panel ── */}
          {proposal.status === 'EXECUTION_FAILED' && executionError && (
            <div className="prm-error-box" data-testid="execution-error-panel">
              <div className="prm-error-title"><XCircle size={16} />Execution Failed</div>
              <p className="prm-error-body">{executionError}</p>
            </div>
          )}

          {/* ── Agent 4 Results Panel ── */}
          {riskLoading ? (
            <div className="prm-loading-box" data-testid="loading-risk-container">
              <div className="prm-spinner" />
              <span>Evaluating Trade Risk…</span>
            </div>
          ) : riskError ? (
            <div className="prm-error-box" data-testid="error-risk-container">
              <div className="prm-error-title"><XCircle size={16} />Risk Evaluation Error</div>
              <p className="prm-error-body">{riskError}</p>
              {proposal.status === 'PENDING_RISK' && (
                <button
                  type="button"
                  className="prm-retry-btn"
                  onClick={() => evaluateProposalRisk(proposal.id, user?.id)}
                  data-testid="retry-evaluation-btn"
                >
                  <RotateCcw size={13} />Retry Evaluation
                </button>
              )}
            </div>
          ) : riskEvaluation ? (
            <>
              {/* Decision card */}
              <div
                className="prm-decision-card"
                style={{ background: dc!.bg, border: `1px solid ${dc!.border}` }}
                data-testid={
                  riskEvaluation.decision === 'RISK_APPROVED' ? 'approved-status-card'
                    : riskEvaluation.decision === 'RISK_REJECTED' ? 'rejected-status-card'
                    : 'needs-review-status-card'
                }
              >
                {riskEvaluation.decision === 'RISK_APPROVED' ? <ShieldCheck size={20} color="#10b981" className="prm-decision-icon" />
                  : riskEvaluation.decision === 'RISK_REJECTED' ? <XCircle size={20} color="#ef4444" className="prm-decision-icon" />
                  : <AlertTriangle size={20} color="#f59e0b" className="prm-decision-icon" />}
                <div>
                  <div className="prm-decision-title" style={{ color: dc!.accent }}>
                    {riskEvaluation.decision === 'RISK_APPROVED' ? 'RISK APPROVED'
                      : riskEvaluation.decision === 'RISK_REJECTED' ? 'RISK REJECTED'
                      : 'NEEDS REVIEW'}
                  </div>
                  <div className="prm-decision-desc">
                    {riskEvaluation.decision === 'RISK_APPROVED'
                      ? 'Proposal fully complies with all portfolio safety parameters. Cleared for execution review.'
                      : riskEvaluation.decision === 'RISK_REJECTED'
                      ? 'One or more critical limits exceeded. Rejection reasons are listed in the checks below.'
                      : 'Moderate risk exceptions detected. Review flagged checks before deciding to proceed.'}
                  </div>
                </div>
              </div>

              {/* Agent 4 Metrics */}
              <div className="prm-section-header">
                <Activity size={13} color="#a855f7" />
                <span style={{ color: '#a855f7' }}>Agent 4 Metrics</span>
              </div>
              <div className="prm-metrics-strip">
                {[
                  { label: 'Risk Score',  value: `${riskEvaluation.risk_score}/100`, color: riskEvaluation.risk_score >= 90 ? '#10b981' : riskEvaluation.risk_score >= 70 ? '#fbbf24' : '#ef4444' },
                  { label: 'Max Risk',    value: `$${riskEvaluation.max_risk.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color: '#ef4444' },
                  { label: 'Est. Reward', value: `$${riskEvaluation.estimated_reward.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color: '#10b981' },
                  { label: 'R:R Ratio',  value: `1 : ${riskEvaluation.risk_reward_ratio}`, color: '#c084fc' },
                  { label: 'Exposure',   value: `$${riskEvaluation.portfolio_exposure.toLocaleString(undefined,{maximumFractionDigits:0})}`, color: '#94a3b8' },
                ].map((m, i, arr) => (
                  <React.Fragment key={m.label}>
                    <div className="prm-metric-cell">
                      <span className="prm-metric-label">{m.label}</span>
                      <span className="prm-metric-val" style={{ color: m.color }}>{m.value}</span>
                    </div>
                    {i < arr.length - 1 && <div className="prm-metric-divider" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Risk Checks */}
              <div className="prm-section-header">
                <ShieldAlert size={13} color="#64748b" />
                <span>Agent 4 Risk Checks</span>
              </div>
              <div className="prm-checks-list">
                {riskEvaluation.checks.map((check) => (
                  <div
                    key={check.check_name}
                    className={`prm-check-row ${check.passed ? 'passed' : 'failed'}`}
                    data-testid={`risk-check-row-${check.check_name}`}
                  >
                    <div className="prm-check-header">
                      <div className="prm-check-title">
                        {check.passed
                          ? <CheckCircle2 size={14} color="#10b981" />
                          : <XCircle size={14} color="#ef4444" />}
                        <span className="prm-check-name">{formatCheckName(check.check_name)}</span>
                        <span style={severityStyle(check.severity)}>{check.severity}</span>
                      </div>
                      <span className={`prm-check-result ${check.passed ? 'passed' : 'failed'}`}>
                        {check.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="prm-check-msg">{check.message}</p>
                    <div className="prm-check-vals">
                      <span><strong>Actual:</strong> {check.actual_value}</span>
                      <span><strong>Limit:</strong> {check.limit_value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rejection Reasons */}
              {riskEvaluation.reasons.length > 0 && (
                <>
                  <div className="prm-section-header">
                    <XCircle size={13} color="#ef4444" />
                    <span style={{ color: '#ef4444' }}>Rejection Reasons</span>
                  </div>
                  <div className="prm-reasons-box">
                    <ul className="prm-reasons-list">
                      {riskEvaluation.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="prm-empty-box" data-testid="no-evaluation-container">
              <Info size={20} color="#475569" />
              <span>No risk evaluation found for this proposal.</span>
            </div>
          )}

          {/* ── Proposal Details ── */}
          <div className="prm-section-header">
            <span>Proposal Details</span>
          </div>
          <div className="prm-meta-box">
            <div className="prm-meta-row">
              <span className="prm-meta-label">Proposal ID</span>
              <span className="prm-meta-value code" title={proposal.id}>{truncateId(proposal.id)}</span>
            </div>
            {proposal.portfolio_id && (
              <div className="prm-meta-row">
                <span className="prm-meta-label">Portfolio ID</span>
                <span className="prm-meta-value code" title={proposal.portfolio_id}>{truncateId(proposal.portfolio_id)}</span>
              </div>
            )}
            {proposal.signal_id && (
              <div className="prm-meta-row">
                <span className="prm-meta-label">Signal ID</span>
                <span className="prm-meta-value code" title={proposal.signal_id}>{truncateId(proposal.signal_id)}</span>
              </div>
            )}
            {proposal.created_at && (
              <div className="prm-meta-row">
                <span className="prm-meta-label">Created At</span>
                <span className="prm-meta-value">{new Date(proposal.created_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* ── Raw JSON Inspector ── */}
          <div className="prm-json-container">
            <div className="prm-json-header">
              <button type="button" className="prm-json-toggle-btn" onClick={() => setShowRawJson(!showRawJson)} data-testid="toggle-json-btn">
                <Code size={13} />
                <span>{showRawJson ? 'Hide Raw API JSON' : 'Inspect Raw API JSON'}</span>
              </button>
              {showRawJson && (
                <button type="button" className="prm-json-copy-btn" onClick={handleCopyJson} title="Copy JSON" data-testid="copy-json-btn">
                  {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                </button>
              )}
            </div>
            {showRawJson && (
              <pre className="prm-json-block" data-testid="raw-json-block">
                {JSON.stringify({ proposal, riskEvaluation, executionResult }, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="prm-footer">
          {proposal.status === 'RISK_APPROVED' && !executionResult && (
            <button
              type="button"
              className="prm-btn-execute"
              onClick={() => setShowExecuteConfirm(true)}
              disabled={executionLoading}
              data-testid="execute-trade-btn"
            >
              {executionLoading ? (
                <><Clock size={15} style={{ animation: 'spin 1s linear infinite' }} />Executing…</>
              ) : (
                <><Zap size={15} />Execute Paper Trade</>
              )}
            </button>
          )}
          <button type="button" className="prm-btn-close" onClick={onClose} data-testid="close-review-modal-btn">
            Close
          </button>
        </div>

        {/* ── Execution Confirmation Overlay ── */}
        {showExecuteConfirm && (
          <motion.div
            className="prm-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="prm-confirm-card"
              data-testid="execution-confirm-dialog"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="prm-confirm-title">
                <AlertTriangle size={18} color="#f59e0b" />
                Confirm Execution
              </div>

              <div className="prm-confirm-details">
                {[
                  { label: 'Symbol', value: proposal.symbol },
                  { label: 'Action', value: proposal.action, cls: isBuy ? 'success' : 'danger' },
                  { label: 'Quantity', value: String(qty) },
                  { label: 'Proposal Entry Price', value: `$${entry.toFixed(2)}` },
                ].map((row) => (
                  <div key={row.label} className="prm-confirm-row">
                    <span className="prm-confirm-label">{row.label}</span>
                    <span className={`prm-confirm-value ${row.cls || ''}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="prm-confirm-warning">
                <strong>Warning:</strong> This will execute the paper trade at the current live market price. The actual execution price may differ from the proposal entry price. No real money is involved.
              </div>

              <div className="prm-confirm-actions">
                <button
                  type="button"
                  className="prm-confirm-cancel"
                  onClick={() => setShowExecuteConfirm(false)}
                  data-testid="cancel-execute-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="prm-confirm-execute"
                  onClick={handleExecute}
                  disabled={executionLoading}
                  data-testid="confirm-execute-btn"
                >
                  {executionLoading ? 'Executing...' : 'Confirm Execution'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
