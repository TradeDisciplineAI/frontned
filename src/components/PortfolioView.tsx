import React, { useState, useEffect, useTransition } from 'react';
import { portfolioService } from '@/services/portfolio.service';
import type { Portfolio } from '@/services/portfolio.service';
import '@/styles/components/portfolio.css';

interface PortfolioViewProps {
  onSelectStock?: (symbol: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onSelectStock }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioName, setPortfolioName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await portfolioService.getPortfolio();
      setPortfolio(data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.detail || 'Failed to fetch portfolio details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioName.trim()) return;
    setError(null);
    try {
      const data = await portfolioService.createPortfolio(portfolioName.trim());
      setPortfolio(data);
      setPortfolioName('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create portfolio.');
    }
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSymbol = newSymbol.trim().toUpperCase();
    if (!cleanSymbol) return;
    setError(null);
    try {
      const addedHolding = await portfolioService.addHolding(cleanSymbol);
      if (portfolio) {
        setPortfolio({
          ...portfolio,
          holdings: [...portfolio.holdings, addedHolding],
        });
      }
      setNewSymbol('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add holding.');
    }
  };

  const handleRemoveHolding = async (symbol: string) => {
    setError(null);
    try {
      await portfolioService.removeHolding(symbol);
      if (portfolio) {
        setPortfolio({
          ...portfolio,
          holdings: portfolio.holdings.filter((h) => h.symbol !== symbol),
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove holding.');
    }
  };

  if (isLoading) {
    return (
      <div className="portfolio-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#9ca3af' }}>Loading portfolio details...</p>
      </div>
    );
  }

  const holdingsCount = portfolio?.holdings?.length || 0;
  const isFull = holdingsCount >= 5;

  const formatPrice = (price?: number) => {
    if (!price) return '0.00';
    if (price < 0.01) {
      return price.toExponential(5);
    }
    return price.toFixed(2);
  };

  return (
    <div className="portfolio-card">
      {error && (
        <div className="alert-banner">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* CASE A: No Portfolio Configured */}
      {!portfolio ? (
        <div>
          <div className="portfolio-header">
            <h2 className="portfolio-title">Configure Portfolio</h2>
          </div>
          <p style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '0.95rem' }}>
            You don't have an active portfolio. Create one below to start tracking your stock
            holdings.
          </p>
          <form onSubmit={handleCreatePortfolio} className="portfolio-form">
            <input
              type="text"
              className="portfolio-input"
              placeholder="e.g. My Long Term Stocks"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              maxLength={100}
              required
            />
            <button type="submit" className="portfolio-btn">
              Create Portfolio
            </button>
          </form>
        </div>
      ) : (
        /* CASE B: Active Portfolio & Holdings Display */
        <div>
          <div className="portfolio-header">
            <div>
              <h2 className="portfolio-title">{portfolio.name}</h2>
              <div className="portfolio-date">
                Created: {new Date(portfolio.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="portfolio-date">Active Portfolio</div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="capacity-container">
            <div className="capacity-label">
              <span>Holding Slots</span>
              <span>{holdingsCount} / 5</span>
            </div>
            <div className="capacity-bar-bg">
              <div
                className={`capacity-bar-fill ${holdingsCount >= 4 ? 'warning' : ''}`}
                style={{ width: `${(holdingsCount / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Add Stock Form */}
          <form
            onSubmit={handleAddHolding}
            className="portfolio-form"
            style={{ marginTop: '24px' }}
          >
            <input
              type="text"
              className="portfolio-input"
              placeholder="Enter ticker symbol (e.g. AAPL, TSLA)"
              value={newSymbol}
              onChange={(e) => startTransition(() => setNewSymbol(e.target.value))}
              disabled={isFull}
              maxLength={10}
              required
            />
            <button type="submit" className="portfolio-btn" disabled={isFull || !newSymbol.trim()}>
              Add Stock
            </button>
          </form>
          {isFull && (
            <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '8px', margin: 0 }}>
              💡 Your portfolio capacity is full (5/5 symbols limit). Remove an existing stock to
              add a new one.
            </p>
          )}

          {/* Holdings List */}
          <div className="holdings-list">
            {holdingsCount === 0 ? (
              <div className="empty-state">
                No active holdings. Type a ticker symbol above to add your first stock.
              </div>
            ) : (
              portfolio.holdings.map((holding) => (
                <div 
                  key={holding.id} 
                  className="holding-item"
                  onClick={() => onSelectStock && onSelectStock(holding.symbol)}
                  style={{ cursor: onSelectStock ? 'pointer' : 'default' }}
                >
                  <div className="holding-info">
                    <div className="holding-avatar">{holding.symbol.substring(0, 2)}</div>
                    <div className="holding-details">
                      <span className="holding-symbol">{holding.symbol}</span>
                      <span className="holding-date">
                        Added: {new Date(holding.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Live Rate Info matching Explore page design */}
                  {holding.price !== undefined && holding.price !== null && (
                    <div
                      className="holding-rates"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        marginLeft: 'auto',
                        marginRight: '24px',
                      }}
                    >
                      <div
                        className="holding-price-details"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '1rem', color: '#ffffff' }}>
                          {formatPrice(holding.price)}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#9ca3af',
                            textTransform: 'uppercase',
                          }}
                        >
                          {holding.currency || 'USD'}
                        </span>
                      </div>

                      {holding.percent_change !== undefined && holding.percent_change !== null && (
                        <div
                          className={`percent-badge ${holding.percent_change >= 0 ? 'gain' : 'loss'}`}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            minWidth: '75px',
                            textAlign: 'center',
                            background:
                              holding.percent_change >= 0
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(239, 68, 68, 0.1)',
                            border:
                              holding.percent_change >= 0
                                ? '1px solid rgba(16, 185, 129, 0.2)'
                                : '1px solid rgba(239, 68, 68, 0.2)',
                            color: holding.percent_change >= 0 ? '#10b981' : '#ef4444',
                          }}
                        >
                          {holding.percent_change >= 0 ? '+' : ''}
                          {holding.percent_change.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveHolding(holding.symbol);
                    }}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
