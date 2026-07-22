import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { portfolioService } from '@/services/portfolio.service';
import { Sidebar } from '@/components/Sidebar';
import { ROUTES } from '@/constants/routes.constants';
import '@/styles/components/live-market.css';

const MARKET_WS_URL = import.meta.env.VITE_MARKET_WS_BASE_URL || 'ws://localhost:8001';

export const LiveMarketDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState({ gainers: [], losers: [] });
  const [activeTab, setActiveTab] = useState('Stocks');
  const [portfolioHoldings, setPortfolioHoldings] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null,
  );

  const { user, logout, isAuthenticated } = useUserStore();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

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

  const dashboardContent = (
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

      {/* Guest Logo Header */}
      {!isAuthenticated && (
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1300px',
            margin: '0 auto 40px auto',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--color-border-subtle, #1e293b)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--color-brand-teal)',
                boxShadow: '0 0 10px var(--color-brand-teal)',
              }}
            />
            <h1
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '0.05em',
                color: '#ffffff',
              }}
            >
              TRADING COPILOT
            </h1>
          </div>
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            style={{
              background: 'var(--color-brand-teal)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '8px 18px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            Login / Signup
          </button>
        </header>
      )}

      <div
        className="top-nav"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1300px',
          margin: '0 auto 40px auto',
        }}
      >
        <div style={{ width: '150px' }} />

        <div className="nav-pills" style={{ margin: 0 }}>
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

        <div style={{ width: '150px', display: 'flex', justifyContent: 'flex-end' }}>
          {isAuthenticated && (
            <button
              onClick={() => navigate(ROUTES.DASHBOARD)}
              style={{
                background: 'transparent',
                border: '1.5px solid #2a2a2a',
                color: '#2a2a2a',
                borderRadius: '40px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#2a2a2a';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#2a2a2a';
              }}
            >
              Dashboard 📊
            </button>
          )}
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
          <div className="market-list">
            {marketData.gainers && marketData.gainers.length > 0 ? (
              marketData.gainers.map((stock: any) => (
                <div key={stock.symbol} className="market-row">
                  <div className="stock-info-col">
                    <div className="stock-icon-circle">{getInitials(stock.symbol)}</div>
                    <div>
                      <div className="stock-ticker">{stock.symbol}</div>
                    </div>
                  </div>
                  <div className="stock-pricing-col">
                    <span className="stock-current-price">{formatPrice(stock.price)}</span>
                    <span className="stock-change-pill positive">
                      +{formatPrice(stock.percent_change)}%
                    </span>
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
          <div className="market-list">
            {marketData.losers && marketData.losers.length > 0 ? (
              marketData.losers.map((stock: any) => (
                <div key={stock.symbol} className="market-row">
                  <div className="stock-info-col">
                    <div className="stock-icon-circle">{getInitials(stock.symbol)}</div>
                    <div>
                      <div className="stock-ticker">{stock.symbol}</div>
                    </div>
                  </div>
                  <div className="stock-pricing-col">
                    <span className="stock-current-price">{formatPrice(stock.price)}</span>
                    <span className="stock-change-pill negative">
                      {formatPrice(stock.percent_change)}%
                    </span>
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

  if (isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: 'var(--color-bg-primary)',
          color: '#f3f4f6',
        }}
      >
        <Sidebar user={user} onLogout={handleLogout} />
        <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>{dashboardContent}</div>
      </div>
    );
  }

  return dashboardContent;
};
