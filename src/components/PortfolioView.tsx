import React, { useState, useEffect, useTransition } from 'react';
import { portfolioService, Portfolio } from '@/services/portfolio.service';
import '@/styles/components/portfolio.css';

export const PortfolioView: React.FC = () => {
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
            <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '8px', marginContent: 0 }}>
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
                <div key={holding.id} className="holding-item">
                  <div className="holding-info">
                    <div className="holding-avatar">{holding.symbol.substring(0, 2)}</div>
                    <div className="holding-details">
                      <span className="holding-symbol">{holding.symbol}</span>
                      <span className="holding-date">
                        Added: {new Date(holding.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveHolding(holding.symbol)}
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
