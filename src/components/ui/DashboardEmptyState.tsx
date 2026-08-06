import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Search, TrendingUp } from 'lucide-react';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

interface DashboardEmptyStateProps {
  onSearchFocus?: () => void;
}

const TRENDING_STICKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 219.86, exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 231.25, exchange: 'NASDAQ' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2985.4, exchange: 'NSE' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', price: 2614.5, exchange: 'NSE' },
];

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({ onSearchFocus }) => {
  const { portfolio, createPortfolio, triggerAddHolding, isSubmitting } = usePortfolioStore();
  const [portfolioName, setPortfolioName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioName.trim()) return;
    await createPortfolio(portfolioName.trim());
    setPortfolioName('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '640px',
        margin: '40px auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Icon Graphic */}
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'rgba(0, 229, 153, 0.05)',
          border: '1px solid rgba(0, 229, 153, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00e599',
          marginBottom: '24px',
          boxShadow: '0 0 20px rgba(0, 229, 153, 0.1)',
        }}
      >
        <Briefcase size={32} strokeWidth={1.5} />
      </div>

      {!portfolio ? (
        /* Case A: Create Portfolio */
        <div style={{ width: '100%' }}>
          <h2
            style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0' }}
          >
            Configure Your AI Portfolio
          </h2>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.95rem',
              margin: '0 0 32px 0',
              lineHeight: '1.5',
            }}
          >
            Create an active portfolio container to start monitoring your risk indices, tracking
            weights, and configuring target price alarms.
          </p>

          <form
            onSubmit={handleCreate}
            style={{
              display: 'flex',
              gap: '12px',
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
            }}
          >
            <input
              type="text"
              placeholder="e.g. My Growth Stocks"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              required
              disabled={isSubmitting}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '14px 18px',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(0, 229, 153, 0.4)')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            />
            <button
              type="submit"
              disabled={isSubmitting || !portfolioName.trim()}
              style={{
                background: 'linear-gradient(135deg, #0d9488, #0f766e)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0 24px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            >
              {isSubmitting ? 'Creating...' : 'Create Portfolio'}
            </button>
          </form>
        </div>
      ) : (
        /* Case B: Add Holdings */
        <div style={{ width: '100%' }}>
          <h2
            style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0' }}
          >
            Portfolio Ready. Add Your First Stock!
          </h2>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.95rem',
              margin: '0 0 24px 0',
              lineHeight: '1.5',
            }}
          >
            Search for stocks using the ticker input at the top right, or click on a trending asset
            below to populate your portfolio slots.
          </p>

          {/* Quick Search Action */}
          {onSearchFocus && (
            <button
              onClick={onSearchFocus}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '40px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 229, 153, 0.3)';
                e.currentTarget.style.background = 'rgba(0, 229, 153, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              <Search size={14} /> Search tickers or assets...
            </button>
          )}

          {/* Trending Assets Header */}
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <TrendingUp size={14} style={{ color: '#00e599' }} />
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Quick Add Trending Assets
              </span>
            </div>

            {/* Trending Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                width: '100%',
              }}
            >
              {TRENDING_STICKS.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => triggerAddHolding(stock.symbol, stock.price, stock.exchange)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 229, 153, 0.2)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                      {stock.symbol}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{stock.name}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00e599' }}>
                    + Quick Add
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
export default DashboardEmptyState;
