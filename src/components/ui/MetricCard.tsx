import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  subtext?: string;
  delay?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  title,
  value,
  trend,
  trendType = 'neutral',
  subtext,
  delay = 0,
}) => {
  const getTrendColor = () => {
    if (trendType === 'up') return '#10b981'; // Emerald
    if (trendType === 'down') return '#ef4444'; // Red
    return '#9ca3af'; // Gray
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -4,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.5)',
      }}
      style={{
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#94a3b8',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            {value}
          </span>
          {trend && (
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: getTrendColor(),
                background: `${getTrendColor()}15`,
                padding: '2px 8px',
                borderRadius: '6px',
                border: `1px solid ${getTrendColor()}25`,
              }}
            >
              {trend}
            </span>
          )}
        </div>
        {subtext && (
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{subtext}</span>
        )}
      </div>
    </motion.div>
  );
};
