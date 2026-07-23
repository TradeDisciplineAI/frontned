import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  SlidersHorizontal,
  LayoutGrid,
  MoreHorizontal,
  CheckCircle2,
  Plus,
  Check,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { portfolioService } from '@/services/portfolio.service';
import { Sidebar } from '@/components/Sidebar';
import { StockSearchBar } from '@/components/StockSearchBar';
import { ROUTES } from '@/constants/routes.constants';
import '@/styles/components/live-market.css';

const MARKET_WS_URL = import.meta.env.VITE_MARKET_WS_BASE_URL || 'ws://localhost:8001';

interface MarketStock {
  symbol: string;
  price: number;
  percent_change: number;
}

export const LiveMarketDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState<{ gainers: MarketStock[]; losers: MarketStock[] }>({
    gainers: [],
    losers: [],
  });
  const [activeMarketTab, setActiveMarketTab] = useState<'gainers' | 'losers' | 'all'>('gainers');
  const [portfolioHoldings, setPortfolioHoldings] = useState<string[]>([]);
  const [searchQuery] = useState('');
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
      // 404 is normal if portfolio is not yet created
    }
  };

  const handleAddStockToPortfolio = async (symbol: string) => {
    setFeedback(null);
    try {
      try {
        await portfolioService.getPortfolio();
      } catch (err: any) {
        if (err.response?.status === 404) {
          await portfolioService.createPortfolio('My Portfolio');
        } else {
          throw err;
        }
      }

      await portfolioService.addHolding(symbol);
      setPortfolioHoldings((prev) => [...prev, symbol]);

      setFeedback({ message: `Successfully added ${symbol} to portfolio!`, type: 'success' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      const errorMsg =
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : err.message || `Failed to add ${symbol} to portfolio.`;
      setFeedback({ message: errorMsg, type: 'error' });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const formatPrice = (price: number) => {
    if (!price) return '0.00';
    return price.toFixed(2);
  };

  const formatPercent = (percent: number) => {
    if (!percent) return '0.00';
    return percent.toFixed(2);
  };

  const filterStocks = (stocks: MarketStock[]) => {
    if (!searchQuery.trim()) return stocks;
    return stocks.filter((s) => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const gainersList = filterStocks(marketData.gainers);
  const losersList = filterStocks(marketData.losers);

  return (
    <div className="vercel-dashboard-wrapper">
      {/* Fixed Vercel Style Sidebar */}
      <Sidebar user={user} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="vercel-dashboard-main">
        {/* Toast Feedback */}
        {feedback && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1000,
              padding: '10px 18px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '13px',
              background: feedback.type === 'success' ? '#00e599' : '#ff4444',
              color: '#000000',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Top Header Bar */}
        <header className="vercel-header-bar">
          <div className="vercel-header-left">
            <button className="vercel-dropdown-trigger">
              <span>All Markets</span>
              <ChevronDown size={14} strokeWidth={2} style={{ color: '#666666' }} />
            </button>
            <span style={{ fontSize: '13px', color: '#666666' }}>Overview</span>
          </div>

          <div className="vercel-header-right">
            <div style={{ width: '280px' }}>
              <StockSearchBar
                onAddStock={handleAddStockToPortfolio}
                existingHoldings={portfolioHoldings}
                placeholder="Search stocks or tickers..."
              />
            </div>
            <button className="vercel-btn-outline" title="Filters">
              <SlidersHorizontal size={14} strokeWidth={2} />
            </button>
            <button className="vercel-btn-outline" title="Grid View">
              <LayoutGrid size={14} strokeWidth={2} />
            </button>
            <button className="vercel-btn-white" onClick={() => navigate(ROUTES.DASHBOARD)}>
              <span>Add New</span>
              <ChevronDown size={13} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Body Content */}
        <div className="vercel-body-content">
          {/* Top Alerts Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <div className="vercel-alert-card">
              <h3 className="vercel-alert-title">Get alerted for anomalies</h3>
              <p className="vercel-alert-desc">
                Automatically monitor market volume and price anomalies and get notified instantly.
              </p>
              <button className="vercel-btn-outline" style={{ marginTop: '8px' }}>
                Upgrade to Pro
              </button>
            </div>

            <div className="vercel-alert-card" style={{ justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#666666' }}>
                Live WebSocket Market Stream Active (NSE / NASDAQ)
              </span>
            </div>
          </div>

          {/* Narrow Line Tab Navigation Bar (Gainers / Losers / All) */}
          <div className="vercel-tabs-line-bar">
            <button
              className={`vercel-tab-line-btn ${activeMarketTab === 'gainers' ? 'active' : ''}`}
              onClick={() => setActiveMarketTab('gainers')}
            >
              <TrendingUp size={15} strokeWidth={2} style={{ color: '#00e599' }} />
              <span>Stock Gainers</span>
              <span className="vercel-tab-badge">{gainersList.length}</span>
            </button>

            <button
              className={`vercel-tab-line-btn ${activeMarketTab === 'losers' ? 'active' : ''}`}
              onClick={() => setActiveMarketTab('losers')}
            >
              <TrendingDown size={15} strokeWidth={2} style={{ color: '#ff4444' }} />
              <span>Stock Losers</span>
              <span className="vercel-tab-badge">{losersList.length}</span>
            </button>

            <button
              className={`vercel-tab-line-btn ${activeMarketTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveMarketTab('all')}
            >
              <span>All Stocks</span>
              <span className="vercel-tab-badge">{gainersList.length + losersList.length}</span>
            </button>
          </div>

          {/* Gainers Cards Grid */}
          {(activeMarketTab === 'gainers' || activeMarketTab === 'all') && (
            <div style={{ marginBottom: activeMarketTab === 'all' ? '32px' : '0' }}>
              {activeMarketTab === 'all' && (
                <h3 className="vercel-grid-section-title">Stock Gainers ({gainersList.length})</h3>
              )}
              <div className="vercel-cards-grid">
                {gainersList.length > 0 ? (
                  gainersList.map((stock) => {
                    const isAdded = portfolioHoldings.includes(stock.symbol);
                    return (
                      <div key={stock.symbol} className="vercel-stock-card">
                        <div className="vercel-card-top">
                          <div className="vercel-card-meta">
                            <div className="vercel-card-icon">
                              {stock.symbol.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="vercel-card-title-group">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <h4 className="vercel-card-name">{stock.symbol}</h4>
                                <CheckCircle2 size={13} className="vercel-verified-badge" />
                              </div>
                              <span className="vercel-card-sub">NSE · Equity</span>
                            </div>
                          </div>
                          <button className="vercel-card-more-btn">
                            <MoreHorizontal size={15} strokeWidth={2} />
                          </button>
                        </div>

                        <div className="vercel-card-middle">
                          <div className="vercel-card-stats">
                            <span className="vercel-price">${formatPrice(stock.price)}</span>
                            <span className="vercel-change-pill positive">
                              +{formatPercent(stock.percent_change)}%
                            </span>
                          </div>
                        </div>

                        <button
                          className="vercel-add-btn"
                          disabled={isAdded}
                          onClick={() => handleAddStockToPortfolio(stock.symbol)}
                        >
                          {isAdded ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Check size={13} strokeWidth={3} /> In Portfolio
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Plus size={13} strokeWidth={3} /> Add Stock
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: '#666666', fontSize: '13px' }}>Streaming gainers...</div>
                )}
              </div>
            </div>
          )}

          {/* Losers Cards Grid */}
          {(activeMarketTab === 'losers' || activeMarketTab === 'all') && (
            <div>
              {activeMarketTab === 'all' && (
                <h3 className="vercel-grid-section-title">Stock Losers ({losersList.length})</h3>
              )}
              <div className="vercel-cards-grid">
                {losersList.length > 0 ? (
                  losersList.map((stock) => {
                    const isAdded = portfolioHoldings.includes(stock.symbol);
                    return (
                      <div key={stock.symbol} className="vercel-stock-card">
                        <div className="vercel-card-top">
                          <div className="vercel-card-meta">
                            <div className="vercel-card-icon" style={{ borderColor: '#331a1a' }}>
                              {stock.symbol.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="vercel-card-title-group">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <h4 className="vercel-card-name">{stock.symbol}</h4>
                                <CheckCircle2 size={13} className="vercel-verified-badge" />
                              </div>
                              <span className="vercel-card-sub">NSE · Equity</span>
                            </div>
                          </div>
                          <button className="vercel-card-more-btn">
                            <MoreHorizontal size={15} strokeWidth={2} />
                          </button>
                        </div>

                        <div className="vercel-card-middle">
                          <div className="vercel-card-stats">
                            <span className="vercel-price">${formatPrice(stock.price)}</span>
                            <span className="vercel-change-pill negative">
                              {formatPercent(stock.percent_change)}%
                            </span>
                          </div>
                        </div>

                        <button
                          className="vercel-add-btn"
                          disabled={isAdded}
                          onClick={() => handleAddStockToPortfolio(stock.symbol)}
                        >
                          {isAdded ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Check size={13} strokeWidth={3} /> In Portfolio
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Plus size={13} strokeWidth={3} /> Add Stock
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: '#666666', fontSize: '13px' }}>Streaming losers...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
