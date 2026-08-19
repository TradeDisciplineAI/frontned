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
} from 'lucide-react';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { useUserStore } from '@/stores/userStore';
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
  } = useTradeProposalStore();

  const { user } = useUserStore();

  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-trigger or load persisted risk evaluation when modal opens
  React.useEffect(() => {
    if (!isOpen || !proposal?.id) return;
    const loadRisk = async () => {
      const persisted = await fetchProposalRisk(proposal.id, user?.id);
      // Only call POST evaluation for PENDING_RISK proposals with no existing evaluation
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
    navigator.clipboard.writeText(JSON.stringify({ proposal, riskEvaluation }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      display: 'inline-block',
      fontSize: '0.6rem',
      fontWeight: 700,
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 4,
      padding: '0.1rem 0.35rem',
      marginLeft: '0.45rem',
      verticalAlign: 'middle',
      letterSpacing: '0.04em',
    };
  };

  const decisionColors: Record<string, { accent: string; bg: string; border: string }> = {
    RISK_APPROVED: { accent: '#10b981', bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.20)' },
    NEEDS_REVIEW:  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.20)' },
    RISK_REJECTED: { accent: '#ef4444', bg: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.20)' },
  };

  const dc = riskEvaluation ? (decisionColors[riskEvaluation.decision] ?? decisionColors.NEEDS_REVIEW) : null;

  return (
    <div className="tp-modal-overlay" onClick={onClose} data-testid="review-modal-overlay">
      <div
        className="tp-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '660px' }}
        data-testid="review-modal-card"
      >
        {/* ── Header ── */}
        <div className="tp-modal-header">
          <div className="tp-header-title-group">
            <div className="tp-modal-title">
              <ShieldAlert size={20} color="#f59e0b" />
              <span>Pre-Risk Stage</span>
              <span className="tp-paper-badge">PAPER TRADING</span>
            </div>
            <div className="tp-subtitle">Agent 4 Risk Engine</div>
          </div>
          <button className="tp-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="tp-modal-body">
          {/* Paper Trading Notice */}
          <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:8, padding:'0.6rem 0.9rem', fontSize:'0.8rem', color:'#fbbf24', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <Info size={15} />
            <span>Simulated trade — no real money involved. Paper trading environment only.</span>
          </div>

          {/* ── Proposal Summary Banner ── */}
          <div className="tp-review-summary-banner">
            <div className="tp-banner-symbol-group">
              <span className="tp-banner-symbol">{proposal.symbol}</span>
              <span className={`tp-banner-action-badge ${isBuy ? 'buy' : 'sell'}`} data-testid="proposal-action-badge">
                {isBuy ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{proposal.action}</span>
              </span>
            </div>

            <div className="tp-banner-status-group">
              {riskLoading ? (
                <span className="tp-banner-status-badge pending" data-testid="status-badge-loading">
                  <Clock size={13} style={{ animation:'spin 1s linear infinite' }} />
                  <span>EVALUATING…</span>
                </span>
              ) : riskEvaluation ? (
                <span
                  className="tp-banner-status-badge"
                  style={{ background: dc!.bg, color: dc!.accent, border: `1px solid ${dc!.border}` }}
                  data-testid="status-badge-result"
                >
                  {riskEvaluation.decision === 'RISK_APPROVED' ? <ShieldCheck size={13} />
                    : riskEvaluation.decision === 'RISK_REJECTED' ? <XCircle size={13} />
                    : <AlertTriangle size={13} />}
                  <span>{riskEvaluation.decision.replace('_', ' ')}</span>
                </span>
              ) : (
                <span className="tp-banner-status-badge pending" data-testid="status-badge-pending">
                  <Clock size={13} /><span>PENDING RISK</span>
                </span>
              )}
              <span className="tp-status-subtext">
                {riskLoading ? 'Running Agent 4 checks…'
                  : riskEvaluation ? `Evaluated ${new Date(riskEvaluation.evaluated_at).toLocaleString()}`
                  : 'Waiting for Agent 4 Risk Analysis'}
              </span>
            </div>
          </div>

          {/* ── Trade Inputs ── */}
          <div className="tp-section-divider"><span>Trade Inputs</span></div>
          <div className="tp-metrics-grid" style={{ gridTemplateColumns:'repeat(4,1fr)', marginTop:'0.5rem' }}>
            {[
              { label: 'Quantity',    value: `${qty} shares`,   cls: '' },
              { label: 'Entry Price', value: `$${entry.toFixed(2)}`, cls: '' },
              { label: 'Stop Loss',   value: `$${sl.toFixed(2)}`,   cls: 'danger' },
              { label: 'Take Profit', value: `$${tp.toFixed(2)}`,   cls: 'success' },
            ].map((m) => (
              <div key={m.label} className="tp-metric-card" style={{ padding:'0.75rem' }}>
                <div className="tp-metric-label" style={{ fontSize:'0.65rem' }}>{m.label}</div>
                <div className={`tp-metric-value ${m.cls}`} style={{ fontSize:'1.05rem' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* ── Strategy & Confidence ── */}
          <div className="tp-section-divider">
            <Brain size={14} color="#f59e0b" /><span>Strategy &amp; Confidence</span>
          </div>
          <div className="tp-metadata-list" style={{ marginTop:'0.5rem' }}>
            <div className="tp-metadata-row">
              <span className="tp-meta-label">Primary Strategy:</span>
              <span className="tp-meta-value" style={{ fontWeight:700 }}>{proposal.primary_strategy}</span>
            </div>
            <div className="tp-metadata-row">
              <span className="tp-meta-label">AI Confidence:</span>
              <span className="tp-meta-value" style={{ fontWeight:700, color:'#c084fc' }}>
                {Math.round((proposal.confidence_score || 0) * 100)}%
              </span>
            </div>
          </div>

          {/* ── Agent 4 Results Panel ── */}
          {riskLoading ? (
            <div
              style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3rem 1rem', gap:'1rem', background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px dashed rgba(255,255,255,0.07)', marginTop:'1.25rem' }}
              data-testid="loading-risk-container"
            >
              <div style={{ width:34, height:34, border:'3px solid rgba(245,158,11,0.12)', borderTop:'3px solid #f59e0b', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              <span style={{ fontSize:'0.875rem', color:'#94a3b8', fontWeight:600 }}>Evaluating Trade Risk…</span>
            </div>

          ) : riskError ? (
            <div
              style={{ background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.18)', borderRadius:12, padding:'1.25rem', marginTop:'1.25rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}
              data-testid="error-risk-container"
            >
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', color:'#ef4444', fontWeight:700, fontSize:'0.875rem' }}>
                <XCircle size={18} /><span>Risk Evaluation Error</span>
              </div>
              <p style={{ margin:0, fontSize:'0.8rem', color:'#94a3b8', lineHeight:1.5 }}>{riskError}</p>
              {proposal.status === 'PENDING_RISK' && (
                <button
                  type="button"
                  className="tp-btn-primary"
                  style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.4rem 0.85rem', fontSize:'0.775rem' }}
                  onClick={() => evaluateProposalRisk(proposal.id, user?.id)}
                  data-testid="retry-evaluation-btn"
                >
                  <RotateCcw size={13} /><span>Retry Evaluation</span>
                </button>
              )}
            </div>

          ) : riskEvaluation ? (
            <>
              {/* Decision Result Card */}
              <div
                style={{ background: dc!.bg, border:`1px solid ${dc!.border}`, borderRadius:12, padding:'1rem 1.25rem', marginTop:'1.25rem', display:'flex', alignItems:'flex-start', gap:'0.75rem' }}
                data-testid={
                  riskEvaluation.decision === 'RISK_APPROVED' ? 'approved-status-card'
                  : riskEvaluation.decision === 'RISK_REJECTED' ? 'rejected-status-card'
                  : 'needs-review-status-card'
                }
              >
                {riskEvaluation.decision === 'RISK_APPROVED' ? <ShieldCheck size={20} color="#10b981" style={{ marginTop:'0.15rem', flexShrink:0 }} />
                  : riskEvaluation.decision === 'RISK_REJECTED' ? <XCircle size={20} color="#ef4444" style={{ marginTop:'0.15rem', flexShrink:0 }} />
                  : <AlertTriangle size={20} color="#f59e0b" style={{ marginTop:'0.15rem', flexShrink:0 }} />}
                <div>
                  <h4 style={{ margin:'0 0 0.2rem 0', fontSize:'0.875rem', fontWeight:700, color: dc!.accent }}>
                    {riskEvaluation.decision === 'RISK_APPROVED' ? 'RISK APPROVED'
                      : riskEvaluation.decision === 'RISK_REJECTED' ? 'RISK REJECTED'
                      : 'NEEDS REVIEW'}
                  </h4>
                  <p style={{ margin:0, fontSize:'0.775rem', color:'#94a3b8', lineHeight:1.5 }}>
                    {riskEvaluation.decision === 'RISK_APPROVED'
                      ? 'Proposal fully complies with all portfolio safety parameters. Cleared for execution review.'
                      : riskEvaluation.decision === 'RISK_REJECTED'
                      ? 'One or more critical limits exceeded. Rejection reasons are listed in the checks below.'
                      : 'Moderate risk exceptions detected. Review flagged checks before deciding to proceed.'}
                  </p>
                </div>
              </div>

              {/* Agent 4 Calculation Metrics */}
              <div className="tp-section-divider"><span>Agent 4 Metrics</span></div>
              <div className="tp-metrics-grid" style={{ gridTemplateColumns:'repeat(5,1fr)', gap:'0.45rem', marginTop:'0.5rem' }}>
                {[
                  { label:'Risk Score',   value:`${riskEvaluation.risk_score}/100`, color: riskEvaluation.risk_score >= 90 ? '#10b981' : riskEvaluation.risk_score >= 70 ? '#fbbf24' : '#ef4444' },
                  { label:'Max Risk',     value:`$${riskEvaluation.max_risk.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color:'#ef4444' },
                  { label:'Est. Reward',  value:`$${riskEvaluation.estimated_reward.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color:'#10b981' },
                  { label:'R:R Ratio',    value:`1 : ${riskEvaluation.risk_reward_ratio}`, color:'#c084fc' },
                  { label:'Exposure',     value:`$${riskEvaluation.portfolio_exposure.toLocaleString(undefined,{maximumFractionDigits:0})}`, color:'#f8fafc' },
                ].map((m) => (
                  <div key={m.label} className="tp-metric-card" style={{ padding:'0.55rem 0.4rem', alignItems:'center', textAlign:'center' }}>
                    <div className="tp-metric-label" style={{ fontSize:'0.52rem' }}>{m.label}</div>
                    <div className="tp-metric-value" style={{ fontSize:'0.95rem', color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Dynamic Risk Checks List */}
              <div className="tp-section-divider"><span>Agent 4 Risk Checks</span></div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.55rem', marginTop:'0.5rem' }}>
                {riskEvaluation.checks.map((check) => (
                  <div
                    key={check.check_name}
                    style={{
                      background: check.passed ? 'rgba(255,255,255,0.01)' : 'rgba(239,68,68,0.025)',
                      border:`1px solid ${check.passed ? 'rgba(255,255,255,0.04)' : 'rgba(239,68,68,0.14)'}`,
                      borderRadius:10,
                      padding:'0.75rem 1rem',
                    }}
                    data-testid={`risk-check-row-${check.check_name}`}
                  >
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.35rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                        {check.passed
                          ? <CheckCircle2 size={15} color="#10b981" />
                          : <XCircle size={15} color="#ef4444" />}
                        <span style={{ fontSize:'0.825rem', fontWeight:700, color:'#f8fafc' }}>
                          {formatCheckName(check.check_name)}
                        </span>
                        <span style={severityStyle(check.severity)}>{check.severity}</span>
                      </div>
                      <span style={{ fontSize:'0.7rem', fontWeight:700, color: check.passed ? '#10b981' : '#ef4444' }}>
                        {check.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <p style={{ margin:'0.3rem 0 0.15rem 0', fontSize:'0.775rem', color:'#94a3b8', lineHeight:1.45 }}>
                      {check.message}
                    </p>
                    <div style={{ display:'flex', gap:'1.25rem', fontSize:'0.7rem', color:'#64748b' }}>
                      <span><strong style={{ color:'#94a3b8' }}>Actual:</strong> {check.actual_value}</span>
                      <span><strong style={{ color:'#94a3b8' }}>Limit:</strong>  {check.limit_value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rejection reasons (if any) */}
              {riskEvaluation.reasons.length > 0 && (
                <>
                  <div className="tp-section-divider"><span>Rejection Reasons</span></div>
                  <div style={{ background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.12)', borderRadius:10, padding:'0.85rem 1rem', marginTop:'0.5rem' }}>
                    <ul style={{ margin:0, padding:'0 0 0 1rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                      {riskEvaluation.reasons.map((r, i) => (
                        <li key={i} style={{ fontSize:'0.8rem', color:'#fca5a5', lineHeight:1.4 }}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </>

          ) : (
            <div
              style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'2.5rem 1rem', gap:'0.5rem', background:'rgba(255,255,255,0.01)', borderRadius:12, border:'1px dashed rgba(255,255,255,0.05)', marginTop:'1.25rem' }}
              data-testid="no-evaluation-container"
            >
              <Info size={20} color="#94a3b8" />
              <span style={{ fontSize:'0.825rem', color:'#94a3b8' }}>No risk evaluation found for this proposal.</span>
            </div>
          )}

          {/* ── Proposal Details ── */}
          <div className="tp-section-divider"><span>Proposal Details</span></div>
          <div className="tp-metadata-list" style={{ marginTop:'0.5rem' }}>
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
                <span className="tp-meta-value">{new Date(proposal.created_at).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* ── Raw JSON Inspector ── */}
          <div className="tp-raw-json-container">
            <div className="tp-json-header">
              <button type="button" className="tp-btn-text" onClick={() => setShowRawJson(!showRawJson)} data-testid="toggle-json-btn">
                <Code size={14} />
                <span>{showRawJson ? 'Hide Raw API JSON' : 'Inspect Raw API JSON'}</span>
              </button>
              {showRawJson && (
                <button type="button" className="tp-btn-icon" onClick={handleCopyJson} title="Copy JSON" data-testid="copy-json-btn">
                  {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                </button>
              )}
            </div>
            {showRawJson && (
              <pre className="tp-json-block" data-testid="raw-json-block">
                {JSON.stringify({ proposal, riskEvaluation }, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="tp-modal-footer">
          <button type="button" className="tp-btn-secondary" onClick={onClose} data-testid="close-review-modal-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


