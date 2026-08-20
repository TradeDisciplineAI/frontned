import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, TrendingUp, TrendingDown, Lightbulb, AlertTriangle } from 'lucide-react';
import type { TradeSignal } from '@/services/agent3.service';

interface AISignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: TradeSignal | null;
  onProposeTrade: (signal: TradeSignal) => void;
}

export const AISignalModal: React.FC<AISignalModalProps> = ({
  isOpen,
  onClose,
  signal,
  onProposeTrade,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState<'ENTRY' | 'STOP' | 'TARGET' | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsSubmitting(false);
    setIsExpanded(false);
  }, [isOpen, signal]);

  if (!isOpen || !signal) return null;

  const isBuy = signal.action === 'BUY';
  const isHold = signal.action === 'HOLD';
  const confidencePercent = Math.round((signal.confidence_score || 0) * 100);

  const actionColor = isHold ? '#94a3b8' : isBuy ? '#10b981' : '#ef4444';
  const actionBg = isHold
    ? 'rgba(148, 163, 184, 0.08)'
    : isBuy
    ? 'rgba(16, 185, 129, 0.1)'
    : 'rgba(239, 68, 68, 0.1)';

  const currencySymbol =
    signal.symbol.endsWith('.NS') || signal.symbol.endsWith('.BO') ? '₹' : '$';

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '0.00';
    if (price < 0.01) return price.toExponential(5);
    return price.toFixed(2);
  };

  const handlePropose = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onProposeTrade(signal);
  };

  // Setup Visualizer levels calculations
  const stopVal = signal.stop_loss;
  const entryVal = signal.entry_price;
  const profitVal = signal.take_profit;

  const minVal = Math.min(stopVal, entryVal, profitVal);
  const maxVal = Math.max(stopVal, entryVal, profitVal);
  const range = maxVal - minVal;

  const getPct = (val: number) => {
    if (range <= 0) return 50;
    return ((val - minVal) / range) * 86 + 7;
  };

  const stopPct = getPct(stopVal);
  const entryPct = getPct(entryVal);
  const profitPct = getPct(profitVal);


  const strategyDisplayName =
    !signal.primary_strategy || signal.primary_strategy === 'None'
      ? 'No active strategy'
      : signal.primary_strategy;

  // Extract technical chips from reasons
  const techChips: string[] = [];
  if (signal.reasons) {
    signal.reasons.forEach((r) => {
      const lower = r.toLowerCase();
      if (lower.includes('rsi')) {
        const match = r.match(/rsi\s*(?:is|at)?\s*([0-9.]+)/i);
        techChips.push(`RSI ${match ? match[1] : 'MOMENTUM'}`);
      }
      if (lower.includes('ema')) {
        const match = r.match(/(?:9|21|50|200)\s*ema/i);
        techChips.push(match ? match[0].toUpperCase() : 'EMA CROSS');
      }
      if (lower.includes('macd')) {
        techChips.push('MACD');
      }
    });
  }

  // Handle rationale text list truncation (2 lines max visually by default)
  const reasonsList = signal.reasons || [];
  const showExpander = reasonsList.length > 2;
  const displayedReasons = isExpanded ? reasonsList : reasonsList.slice(0, 2);

  return (
    <AnimatePresence>
      <div
        className="tp-modal-overlay"
        onClick={onClose}
        data-testid="ai-signal-modal-overlay"
        style={{
          background: 'rgba(4, 8, 16, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          padding: '20px',
        }}
      >
        <style>{`
          @keyframes pulseReady {
            0%, 100% { opacity: 0.6; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          @keyframes slideArrowUp {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-2px) translateX(2px); }
          }
          @keyframes slideArrowDown {
            0%, 100% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(2px) translateX(2px); }
          }
          .tp-pulse-ready-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
            animation: pulseReady 2s infinite ease-in-out;
          }
          .tp-terminal-grid {
            display: grid;
            grid-template-columns: 1.15fr 0.85fr;
            gap: 16px;
          }
          .tp-chip-tag {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            color: #cbd5e1;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.2s ease;
          }
          .tp-chip-tag:hover {
            border-color: rgba(255, 255, 255, 0.15);
            background: rgba(255, 255, 255, 0.06);
            color: #ffffff;
          }
          .tp-terminal-metric-card {
            background: rgba(15, 23, 42, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 8px;
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            transition: all 0.2s ease;
          }
          .tp-terminal-metric-card:hover {
            border-color: rgba(59, 130, 246, 0.2);
            background: rgba(15, 23, 42, 0.65);
          }
          @media (max-width: 899px) {
            .tp-terminal-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="tp-modal-card"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '760px',
            maxWidth: '100%',
            height: 'auto',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#090d16',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(168, 85, 247, 0.06)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
          data-testid="ai-signal-modal-card"
        >
          {/* Header (65-75px height target) */}
          <div
            className="tp-modal-header"
            style={{
              padding: '12px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              height: '70px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(168, 85, 247, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                }}
              >
                <Sparkles size={16} color="#c084fc" />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                  AI Trade Signal
                </div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '1px' }}>
                  AI-Powered Trade Analysis
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="tp-pulse-ready-dot" />
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', letterSpacing: '0.5px' }}>
                  AI SIGNAL READY
                </span>
              </div>
              <button
                className="tp-close-btn"
                onClick={onClose}
                aria-label="Close signal"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = '#f3f4f6';
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.transform = 'none';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.96)';
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Scrollable Content (optimized padding to fit without scroll where possible) */}
          <div
            className="tp-modal-body"
            style={{
              padding: '16px 24px',
              overflowY: 'auto',
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Horizontal Hero section */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(15, 23, 42, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                borderRadius: '12px',
                padding: '10px 16px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>
                  {signal.symbol}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Strategy:</span>
                  <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 700 }}>
                    {strategyDisplayName}
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: actionBg,
                  color: actionColor,
                  border: `1px solid ${actionColor}30`,
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: `0 0 10px ${actionColor}10`,
                }}
                data-testid="signal-action-badge"
              >
                <span>{signal.action}</span>
                {isBuy ? (
                  <TrendingUp
                    size={14}
                    style={{ animation: 'slideArrowUp 2s infinite ease-in-out' }}
                  />
                ) : isHold ? null : (
                  <TrendingDown
                    size={14}
                    style={{ animation: 'slideArrowDown 2s infinite ease-in-out' }}
                  />
                )}
              </div>
            </div>

            {/* Context sentence */}
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.08)', padding: '8px 12px', borderRadius: '8px' }}>
              Review the setup before creating a trade proposal.
            </div>

            {/* TWO COLUMN GRID */}
            <div className="tp-terminal-grid">
              {/* LEFT COLUMN: TRADE SETUP */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Trade Setup
                    </span>
                  </div>

                  {!isHold && (
                    <>
                      {/* Metric cards grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <div
                          className="tp-terminal-metric-card"
                          style={{
                            borderColor: hoveredLevel === 'ENTRY' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                            padding: '8px 10px',
                          }}
                          onMouseEnter={() => setHoveredLevel('ENTRY')}
                          onMouseLeave={() => setHoveredLevel(null)}
                        >
                          <span className="tp-metric-label">Entry Price</span>
                          <span className="tp-metric-value" style={{ color: '#60a5fa', fontSize: '1rem', margin: '2px 0' }}>
                            {currencySymbol}{formatPrice(signal.entry_price)}
                          </span>
                        </div>

                        <div
                          className="tp-terminal-metric-card"
                          style={{
                            borderColor: hoveredLevel === 'STOP' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                            padding: '8px 10px',
                          }}
                          onMouseEnter={() => setHoveredLevel('STOP')}
                          onMouseLeave={() => setHoveredLevel(null)}
                        >
                          <span className="tp-metric-label">Stop Loss</span>
                          <span className="tp-metric-value" style={{ color: '#f87171', fontSize: '1rem', margin: '2px 0' }}>
                            {currencySymbol}{formatPrice(signal.stop_loss)}
                          </span>
                        </div>

                        <div
                          className="tp-terminal-metric-card"
                          style={{
                            borderColor: hoveredLevel === 'TARGET' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                            padding: '8px 10px',
                          }}
                          onMouseEnter={() => setHoveredLevel('TARGET')}
                          onMouseLeave={() => setHoveredLevel(null)}
                        >
                          <span className="tp-metric-label">Take Profit</span>
                          <span className="tp-metric-value" style={{ color: '#34d399', fontSize: '1rem', margin: '2px 0' }}>
                            {currencySymbol}{formatPrice(signal.take_profit)}
                          </span>
                        </div>
                      </div>

                      {/* Setup levels range visuals */}
                      <div style={{ position: 'relative', height: '36px', display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                        {/* Range track */}
                        <div style={{ position: 'absolute', left: 0, right: 0, height: '4px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '2px' }} />

                        {/* Reward track */}
                        <div
                          style={{
                            position: 'absolute',
                            left: `${Math.min(entryPct, profitPct)}%`,
                            width: `${Math.abs(profitPct - entryPct)}%`,
                            height: '4px',
                            background: 'rgba(16, 185, 129, 0.35)',
                          }}
                        />

                        {/* Risk track */}
                        <div
                          style={{
                            position: 'absolute',
                            left: `${Math.min(entryPct, stopPct)}%`,
                            width: `${Math.abs(stopPct - entryPct)}%`,
                            height: '4px',
                            background: 'rgba(239, 68, 68, 0.35)',
                          }}
                        />

                        {/* Stop Loss marker */}
                        <motion.div
                          initial={{ left: '50%' }}
                          animate={{ left: `${stopPct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          style={{
                            position: 'absolute',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            zIndex: hoveredLevel === 'STOP' ? 10 : 1,
                          }}
                          onMouseEnter={() => setHoveredLevel('STOP')}
                          onMouseLeave={() => setHoveredLevel(null)}
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', border: '2px solid #090d16', transition: 'transform 0.1s', transform: hoveredLevel === 'STOP' ? 'scale(1.3)' : 'none' }} />
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: hoveredLevel === 'STOP' ? '#f87171' : '#cbd5e1', marginTop: '1px' }}>
                            {formatPrice(signal.stop_loss)}
                          </span>
                        </motion.div>

                        {/* Entry Price marker */}
                        <motion.div
                          initial={{ left: '50%' }}
                          animate={{ left: `${entryPct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          style={{
                            position: 'absolute',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            zIndex: hoveredLevel === 'ENTRY' ? 10 : 2,
                          }}
                          onMouseEnter={() => setHoveredLevel('ENTRY')}
                          onMouseLeave={() => setHoveredLevel(null)}
                        >
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', border: '2.5px solid #090d16', transition: 'transform 0.1s', transform: hoveredLevel === 'ENTRY' ? 'scale(1.3)' : 'none' }} />
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: hoveredLevel === 'ENTRY' ? '#60a5fa' : '#cbd5e1', marginTop: '1px' }}>
                            {formatPrice(signal.entry_price)}
                          </span>
                        </motion.div>

                        {/* Target Marker */}
                        <motion.div
                          initial={{ left: '50%' }}
                          animate={{ left: `${profitPct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          style={{
                            position: 'absolute',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            zIndex: hoveredLevel === 'TARGET' ? 10 : 1,
                          }}
                          onMouseEnter={() => setHoveredLevel('TARGET')}
                          onMouseLeave={() => setHoveredLevel(null)}
                        >
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', border: '2px solid #090d16', transition: 'transform 0.1s', transform: hoveredLevel === 'TARGET' ? 'scale(1.3)' : 'none' }} />
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: hoveredLevel === 'TARGET' ? '#34d399' : '#cbd5e1', marginTop: '1px' }}>
                            {formatPrice(signal.take_profit)}
                          </span>
                        </motion.div>
                      </div>
                    </>
                  )}

                  {isHold && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>HOLD Setup: No range visualization required.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: AI SIGNAL QUALITY */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    height: '100%',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        AI Confidence
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c084fc' }}>
                        {confidencePercent}%
                      </span>
                    </div>
                    {/* Confidence progress bar */}
                    <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden', boxShadow: '0 0 4px rgba(168, 85, 247, 0.1)' }}>
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${confidencePercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', background: '#a855f7', borderRadius: '3px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Risk / Reward
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 800 }}>
                      1 : {(signal.risk_reward_ratio || 2.0).toFixed(1)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Trading Strategy
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#f8fafc', fontWeight: 700 }}>
                      {signal.primary_strategy}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* WHY THIS TRADE? */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Why This Trade?
              </div>

              {techChips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {techChips.map((chip, idx) => (
                    <span key={idx} className="tp-chip-tag">
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              {signal.reasons && signal.reasons.length > 0 && (
                <div
                  style={{
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lightbulb size={12} />
                    <span>Why the AI generated this signal</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.35 }}>
                    {displayedReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>

                  {/* Truncation Expander button */}
                  {showExpander && (
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#a855f7',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '0',
                        marginTop: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        width: 'fit-content',
                      }}
                    >
                      {isExpanded ? 'Collapse analysis' : 'View analysis'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* HOLD oportunidade banner */}
            {isHold && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.04)',
                  border: '1px solid rgba(245, 158, 11, 0.15)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
                data-testid="hold-opportunity-card"
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={15} />
                  <span>No Trade Opportunity</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.35 }}>
                  Agent 3 did not generate an executable BUY or SELL signal for this asset.
                </p>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  This asset is currently on HOLD. A Trade Proposal can only be created from a BUY or SELL signal.
                </div>
              </div>
            )}
          </div>

          {/* Footer (Sticky / Fixed 58px target) */}
          <div
            className="tp-modal-footer"
            style={{
              padding: '10px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              background: 'rgba(10, 15, 28, 0.4)',
              flexShrink: 0,
              height: '58px',
            }}
          >
            <button
              type="button"
              className="tp-btn-secondary"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              Close
            </button>

            <button
              type="button"
              className="tp-btn-primary"
              disabled={isHold || isSubmitting}
              onClick={handlePropose}
              style={{
                background: isHold ? 'rgba(255, 255, 255, 0.02)' : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                border: 'none',
                color: isHold ? '#475569' : '#ffffff',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: isHold || isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isHold ? 'none' : '0 4px 14px rgba(168, 85, 247, 0.3)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isHold && !isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(168, 85, 247, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isHold && !isSubmitting) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(168, 85, 247, 0.3)';
                }
              }}
              data-testid="propose-trade-btn"
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'pulseReady 1s infinite linear',
                    }}
                  />
                  <span>Creating Proposal...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Propose Trade</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
