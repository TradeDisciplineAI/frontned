import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { portfolioService } from '@/services/portfolio.service';
import '@/styles/components/live-market.css';

const MARKET_WS_URL = import.meta.env.VITE_MARKET_WS_BASE_URL || 'ws://localhost:8001';

export const LiveMarketDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState({ gainers: [], losers: [] });
  const [activeTab, setActiveTab] = useState('Stocks');
  const [portfolioHoldings, setPortfolioHoldings] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null,
  );

  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  // 1. Listen to market data WebSocket
  useEffect(() => {
    const ws = new WebSocket(`${MARKET_WS_URL}/dashboard/ws/market`);

    ws.onmessage = (event) => {
      try {
        const liveData = JSON.parse(event.data);
        console.log('Live Update Received:', liveData);
        setMarketData(liveData);
      } catch (err) {
        console.error('Error parsing websocket message', err);
      }
    };

    return () => ws.close();
  }, []);

  // 2. Fetch user's portfolio holdings if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolioHoldings();
    }
  }, [isAuthenticated]);

  const fetchPortfolioHoldings = async () => {
    try {
      const data = await portfolioService.getPortfolio();
      setPortfolioHoldings(data.holdings.map((h) => h.symbol));
    } catch (err) {
      // 404 is normal if they haven't configured a portfolio yet
    }
  };

  const handleAddStockToPortfolio = async (symbol: string) => {
    setFeedback(null);
    try {
      // Step 1: Create a default portfolio if they don't have one
      try {
        await portfolioService.getPortfolio();
      } catch (err: any) {
        if (err.response?.status === 404) {
          await portfolioService.createPortfolio('My Portfolio');
        } else {
          throw err;
        }
      }

      // Step 2: Add the holding
      await portfolioService.addHolding(symbol);
      setPortfolioHoldings((prev) => [...prev, symbol]);

      setFeedback({ message: `Successfully added ${symbol} to your portfolio!`, type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || `Failed to add ${symbol} to portfolio.`;
      setFeedback({ message: errorMsg, type: 'error' });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return '0.00';
    if (price < 0.01) {
      return price.toExponential(5);
    }
    return price.toFixed(2);
  };

  const getInitials = (symbol: string) => {
    return symbol.substring(0, 2).toUpperCase();
  };

  return (
    <div className="market-dashboard">
      {/* Dynamic Feedback Banner */}
      {feedback && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '16px 24px',
            borderRadius: '8px',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            background: feedback.type === 'success' ? '#10b981' : '#ef4444',
            border:
              feedback.type === 'success'
                ? '1px solid rgba(16, 185, 129, 0.2)'
                : '1px solid rgba(239, 68, 68, 0.2)',
            transition: 'all 0.3s ease',
          }}
        >
          {feedback.type === 'success' ? '✅ ' : '⚠️ '}
          {feedback.message}
        </div>
      )}

      <div className="top-nav">
        <div className="nav-pills">
          {['Stocks', 'Crypto', 'Futures', 'Forex', 'Economy', 'Brokers'].map((tab) => (
            <button
              key={tab}
              className={`nav-pill ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="market-sections">
        {/* Gainers */}
        <div className="market-list-section">
          <div className="section-header">
            <h2>
              {activeTab === 'Stocks' ? 'Stock' : activeTab} gainers
              <span className="heading-arrow">&gt;</span>
            </h2>
          </div>

          <div className="stock-list">
            {marketData.gainers && marketData.gainers.length > 0 ? (
              marketData.gainers.map((stock: any) => (
                <div className="stock-row" key={stock.symbol}>
                  <div className="stock-left">
                    <div className="stock-icon icon-blue">{getInitials(stock.symbol)}</div>
                    <div className="stock-names">
                      <div className="stock-name">{stock.symbol.split('.')[0]}</div>
                      <div className="stock-ticker">{stock.symbol}</div>
                    </div>
                  </div>
                  <div className="stock-middle">
                    <span className="price">{formatPrice(stock.price)}</span>
                    <span className="currency">{stock.currency || 'USD'}</span>
                  </div>
                  <div
                    className="stock-right"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <div className="pill-gain">+{Math.abs(stock.percent_change).toFixed(2)}%</div>

                    {isAuthenticated && (
                      <button
                        onClick={() => handleAddStockToPortfolio(stock.symbol)}
                        disabled={
                          portfolioHoldings.includes(stock.symbol) || portfolioHoldings.length >= 5
                        }
                        style={{
                          background: portfolioHoldings.includes(stock.symbol)
                            ? 'rgba(0, 0, 0, 0.05)'
                            : 'var(--color-brand-teal, #0d9488)',
                          color: portfolioHoldings.includes(stock.symbol) ? '#888' : '#fff',
                          border: portfolioHoldings.includes(stock.symbol)
                            ? '1px solid rgba(0, 0, 0, 0.1)'
                            : 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: portfolioHoldings.includes(stock.symbol)
                            ? 'not-allowed'
                            : 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {portfolioHoldings.includes(stock.symbol) ? '✓ Added' : '+ Add'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="loading-state">Waiting for data...</div>
            )}
          </div>
        </div>

        {/* Losers */}
        <div className="market-list-section">
          <div className="section-header">
            <h2>
              {activeTab === 'Stocks' ? 'Stock' : activeTab} losers
              <span className="heading-arrow">&gt;</span>
            </h2>
          </div>

          <div className="stock-list">
            {marketData.losers && marketData.losers.length > 0 ? (
              marketData.losers.map((stock: any) => (
                <div className="stock-row" key={stock.symbol}>
                  <div className="stock-left">
                    <div className="stock-icon icon-purple">{getInitials(stock.symbol)}</div>
                    <div className="stock-names">
                      <div className="stock-name">{stock.symbol.split('.')[0]}</div>
                      <div className="stock-ticker">{stock.symbol}</div>
                    </div>
                  </div>
                  <div className="stock-middle">
                    <span className="price">{formatPrice(stock.price)}</span>
                    <span className="currency">{stock.currency || 'USD'}</span>
                  </div>
                  <div
                    className="stock-right"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <div className="pill-loss">-{Math.abs(stock.percent_change).toFixed(2)}%</div>

                    {isAuthenticated && (
                      <button
                        onClick={() => handleAddStockToPortfolio(stock.symbol)}
                        disabled={
                          portfolioHoldings.includes(stock.symbol) || portfolioHoldings.length >= 5
                        }
                        style={{
                          background: portfolioHoldings.includes(stock.symbol)
                            ? 'rgba(0, 0, 0, 0.05)'
                            : 'var(--color-brand-teal, #0d9488)',
                          color: portfolioHoldings.includes(stock.symbol) ? '#888' : '#fff',
                          border: portfolioHoldings.includes(stock.symbol)
                            ? '1px solid rgba(0, 0, 0, 0.1)'
                            : 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: portfolioHoldings.includes(stock.symbol)
                            ? 'not-allowed'
                            : 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {portfolioHoldings.includes(stock.symbol) ? '✓ Added' : '+ Add'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="loading-state">Waiting for data...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
