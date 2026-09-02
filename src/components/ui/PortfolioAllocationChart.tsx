import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Holding } from '@/services/portfolio.service';

interface PortfolioAllocationChartProps {
  holdings: Holding[];
}

const ACCENT_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
];

export const PortfolioAllocationChart: React.FC<PortfolioAllocationChartProps> = ({ holdings }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Circumference for radius R = 50 is 2 * pi * 50 = 314.16
  const R = 50;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  // Calculate weights based on prices (or equal weights if prices are missing)
  const segments = React.useMemo(() => {
    if (holdings.length === 0) return [];

    const values = holdings.map((h) => h.price || 100);
    const total = values.reduce((sum, v) => sum + v, 0);

    let accumulatedPercent = 0;

    return holdings.map((h, idx) => {
      const value = h.price || 100;
      const percentage = (value / total) * 100;
      const strokeLength = (percentage / 100) * CIRCUMFERENCE;
      const strokeOffset = CIRCUMFERENCE - (accumulatedPercent / 100) * CIRCUMFERENCE;

      accumulatedPercent += percentage;

      return {
        symbol: h.symbol,
        percentage,
        strokeLength,
        strokeOffset,
        color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
      };
    });
  }, [holdings, CIRCUMFERENCE]);

  if (holdings.length === 0) {
    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          minHeight: '260px',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            border: '4px dashed rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
          }}
        >
          0%
        </div>
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
          No assets to allocate
        </span>
      </div>
    );
  }

  const activeSegment = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#94a3b8',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        Portfolio Weight Allocation
      </span>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          flexWrap: 'wrap',
        }}
      >
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
          <svg
            width="150"
            height="150"
            viewBox="0 0 120 120"
            style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
          >
            {segments.map((seg, idx) => (
              <motion.circle
                key={seg.symbol}
                cx="60"
                cy="60"
                r={R}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={hoveredIdx === idx ? 12 : 8}
                strokeDasharray={`${seg.strokeLength} ${CIRCUMFERENCE}`}
                strokeDashoffset={seg.strokeOffset}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  cursor: 'pointer',
                  filter: hoveredIdx === idx ? `drop-shadow(0 0 6px ${seg.color}80)` : 'none',
                  transition: 'stroke-width 0.20s ease, filter 0.20s ease',
                }}
                initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}` }}
                animate={{ strokeDasharray: `${seg.strokeLength} ${CIRCUMFERENCE}` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
              />
            ))}
          </svg>

          {/* Center Info Text */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              width: '90px',
            }}
          >
            <AnimatePresence mode="wait">
              {activeSegment ? (
                <motion.div
                  key={activeSegment.symbol}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      display: 'block',
                    }}
                  >
                    {activeSegment.symbol}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: activeSegment.color,
                      fontWeight: 700,
                      display: 'block',
                      marginTop: '2px',
                    }}
                  >
                    {activeSegment.percentage.toFixed(1)}%
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#64748b',
                      display: 'block',
                    }}
                  >
                    Holdings
                  </span>
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      display: 'block',
                      marginTop: '2px',
                    }}
                  >
                    {holdings.length} Total
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Legend List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '120px' }}>
          {segments.map((seg, idx) => (
            <div
              key={seg.symbol}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.45,
                transition: 'opacity 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '3px',
                  background: seg.color,
                  boxShadow: hoveredIdx === idx ? `0 0 6px ${seg.color}` : 'none',
                }}
              />
              <div
                style={{ display: 'flex', justifyContent: 'space-between', flex: 1, gap: '20px' }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>
                  {seg.symbol}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                  {seg.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
