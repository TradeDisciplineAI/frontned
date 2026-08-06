import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SparklineProps {
  symbol: string;
  change: number;
  width?: number;
  height?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  symbol,
  change,
  width = 120,
  height = 40,
}) => {
  const isPositive = change >= 0;
  const color = isPositive ? '#10b981' : '#ef4444';

  const { linePath, areaPath, uniqueId } = useMemo(() => {
    // Generate deterministic wave points based on symbol characters
    const points: { x: number; y: number }[] = [];
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const steps = 10;
    const direction = isPositive ? 1 : -1;

    for (let i = 0; i < steps; i++) {
      const x = (i / (steps - 1)) * width;
      // Synthesize a wavy path that finishes positive or negative
      const progress = i / (steps - 1);
      const wave = Math.sin((i + seed) * 1.3) * 6 + Math.cos((i - seed) * 0.7) * 3;
      const trend = progress * 10 * direction;
      // Keeps the line centered in the box (between 5 and height - 5)
      const centerY = height / 2;
      const y = Math.max(5, Math.min(height - 5, centerY - trend - wave));

      points.push({ x, y });
    }

    // Build SVG path strings
    const lineD = points
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');
    const areaD = `${lineD} L ${width} ${height} L 0 ${height} Z`;
    const randId = `gradient-${symbol}-${seed}`;

    return { linePath: lineD, areaPath: areaD, uniqueId: randId };
  }, [symbol, width, height, isPositive]);

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Filled Area */}
      <motion.path
        d={areaPath}
        fill={`url(#${uniqueId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />

      {/* Stroke Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      />
    </svg>
  );
};
export default Sparkline;
