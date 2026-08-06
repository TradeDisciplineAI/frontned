import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Trash2, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { usePriceAlertStore } from '@/stores/priceAlertStore';
import { Sparkline } from '@/components/ui/Sparkline';
import '@/styles/components/portfolio.css';

interface PortfolioViewProps {
  onSelectStock?: (symbol: string) => void;
}

const ACCENT_BG_COLORS = [
  'rgba(16, 185, 129, 0.08)', // Emerald
  'rgba(6, 182, 212, 0.08)', // Cyan
  'rgba(59, 130, 246, 0.08)', // Blue
  'rgba(99, 102, 241, 0.08)', // Indigo
  'rgba(139, 92, 246, 0.08)', // Violet
];

const ACCENT_TEXT_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onSelectStock }) => {
  const { portfolio, isLoading, triggerRemoveHolding } = usePortfolioStore();

  const openModal = usePriceAlertStore((state) => state.openModal);

  const formatPrice = (price?: number) => {
    if (!price) return '0.00';
    if (price < 0.01) {
      return price.toExponential(5);
    }
    return price.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="portfolio-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#9ca3af' }}>Loading portfolio details...</p>
      </div>
    );
  }

  // If no portfolio or no holdings, return null (handled by DashboardEmptyState)
  if (!portfolio || portfolio.holdings.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          Active Holdings ({portfolio.holdings.length})
        </span>
      </div>

      <div className="holdings-grid">
        <style>{`
          .holdings-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          @media (max-width: 767px) {
            .holdings-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
          }
          .asset-card {
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            position: relative;
            cursor: pointer;
            transition: border-color 0.2s ease, background-color 0.2s ease;
          }
          .asset-card:hover {
            border-color: rgba(255, 255, 255, 0.12);
            background-color: rgba(30, 41, 59, 0.3);
          }
          .asset-avatar {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justifyContent: center;
            font-weight: 800;
            font-size: 0.85rem;
            border: 1px solid rgba(255, 255, 255, 0.04);
          }
          .asset-badge-price {
            font-size: 1.15rem;
            fontWeight: 800;
            color: #ffffff;
            letter-spacing: -0.5px;
          }
          .asset-btn-action {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.06);
            color: #cbd5e1;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.75rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .asset-btn-action:hover {
            background: rgba(0, 229, 153, 0.05);
            border-color: rgba(0, 229, 153, 0.25);
            color: #ffffff;
          }
          .asset-delete-btn {
            background: transparent;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 6px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justifyContent: center;
            transition: all 0.15s ease;
          }
          .asset-delete-btn:hover {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
        `}</style>

        {portfolio.holdings.map((holding, idx) => {
          const isPositive = (holding.percent_change || 0) >= 0;
          const statusColor = isPositive ? '#10b981' : '#ef4444';
          const avatarBg = ACCENT_BG_COLORS[idx % ACCENT_BG_COLORS.length];
          const avatarText = ACCENT_TEXT_COLORS[idx % ACCENT_TEXT_COLORS.length];

          return (
            <motion.div
              key={holding.id}
              className="asset-card"
              onClick={() => onSelectStock && onSelectStock(holding.symbol)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: idx * 0.05, ease: 'easeOut' }}
              whileHover={{ y: -5 }}
            >
              {/* Card Top: Avatar, symbol, delete */}
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="asset-avatar" style={{ background: avatarBg, color: avatarText }}>
                    {holding.symbol.substring(0, 2)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                      {holding.symbol}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                      {holding.symbol.endsWith('.NS') ? 'NSE · Equity' : 'US Market'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="asset-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerRemoveHolding(holding.symbol);
                  }}
                  title="Remove Asset"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Card Middle: Price, trend percent, SVG chart */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '4px 0',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="asset-badge-price">${formatPrice(holding.price)}</span>

                  {holding.percent_change !== undefined && holding.percent_change !== null && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: statusColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isPositive ? '+' : ''}
                      {holding.percent_change.toFixed(2)}%
                    </span>
                  )}
                </div>

                {/* SVG sparkline micro-chart */}
                <Sparkline symbol={holding.symbol} change={holding.percent_change || 0} />
              </div>

              {/* Card Bottom: Date & Quick Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  paddingTop: '12px',
                  marginTop: '4px',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                  Added: {new Date(holding.created_at).toLocaleDateString()}
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="asset-btn-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(holding.symbol, holding.price || undefined);
                    }}
                    title="Set price threshold alarm"
                  >
                    <Bell size={12} />
                  </button>

                  <button
                    type="button"
                    className="asset-btn-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectStock) onSelectStock(holding.symbol);
                    }}
                    title="View Trading Chart"
                  >
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
export default PortfolioView;
