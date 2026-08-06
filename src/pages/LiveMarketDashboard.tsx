import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
  Bell,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { usePriceAlertStore } from '@/stores/priceAlertStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { Sidebar } from '@/components/Sidebar';
import { StockSearchBar } from '@/components/StockSearchBar';
import { PriceAlertModal } from '@/components/PriceAlertModal';
import { ActiveAlertsDrawer } from '@/components/ActiveAlertsDrawer';
import { ExploreSkeleton } from '@/components/ui/ExploreSkeleton';
import { ROUTES } from '@/constants/routes.constants';
import '@/styles/components/live-market.css';

const playAlertChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.error('Audio chime error:', e);
  }
};

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
  const [isConnected, setIsConnected] = useState(false);
  const [activeMarketTab, setActiveMarketTab] = useState<'gainers' | 'losers' | 'all'>('gainers');
  const [searchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const { user, logout, isAuthenticated } = useUserStore();
  const { openModal, toggleDrawer, fetchAlerts, alerts } = usePriceAlertStore();
  const { portfolio, fetchPortfolio, triggerAddHolding, isSubmitting, modal, showToast } =
    usePortfolioStore();

  const activeAlertsCount = alerts.filter((a) => !a.is_triggered).length;
  const portfolioHoldings = portfolio?.holdings?.map((h) => h.symbol) || [];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  // Fetch initial user alerts when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
    }
  }, [isAuthenticated, fetchAlerts]);

  // Fetch initial portfolio holdings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolio();
    }
  }, [isAuthenticated, fetchPortfolio]);

  // Orchestrate minimum loading duration of 800ms to allow skeleton to animate smoothly
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 800);

    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (minTimeElapsed && hasData) {
      setIsLoading(false);
    }
  }, [minTimeElapsed, hasData]);

  // 1. Listen to market data WebSocket
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_DELAY = 10000;
    let isComponentMounted = true;

    const connect = () => {
      ws = new WebSocket(`${MARKET_WS_URL}/dashboard/ws/market`);

      ws.onopen = () => {
        if (isComponentMounted) {
          setIsConnected(true);
          reconnectAttempts = 0;
        }
      };

      ws.onmessage = (event) => {
        try {
          const liveData = JSON.parse(event.data);
          if (liveData && liveData.type === 'PRICE_ALERT_TRIGGERED') {
            playAlertChime();
            showToast(
              'success',
              'Price Alert Triggered',
              liveData.symbol,
              `Hit target price $${liveData.target_price}!`,
              portfolioHoldings.length,
            );
            fetchAlerts();
          } else if (
            liveData &&
            Array.isArray(liveData.gainers) &&
            Array.isArray(liveData.losers)
          ) {
            setMarketData(liveData);
            if (liveData.gainers.length > 0 || liveData.losers.length > 0) {
              setHasData(true);
            }
          }
        } catch (err) {
          console.error('Error parsing websocket message', err);
        }
      };

      ws.onclose = () => {
        if (isComponentMounted) {
          setIsConnected(false);
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
          reconnectAttempts++;
          reconnectTimeout = setTimeout(connect, delay);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
    };

    connect();

    return () => {
      isComponentMounted = false;
      clearTimeout(reconnectTimeout);
      if (ws) {
        ws.close();
      }
    };
  }, [portfolioHoldings.length, showToast, fetchAlerts]);

  const handleAddStockToPortfolio = (symbol: string, price: number) => {
    // If no portfolio object existed yet, we'll auto create it on confirm, trigger modal first
    const exchangeLabel = activeMarketTab === 'losers' ? 'NSE · Losers' : 'NSE · Gainers';
    triggerAddHolding(symbol, price, exchangeLabel);
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
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="explore-skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ width: '100%', padding: '24px 32px', boxSizing: 'border-box' }}
            >
              <ExploreSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="explore-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            >
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
                  <button
                    className="vercel-btn-outline"
                    onClick={() => toggleDrawer()}
                    title="Price Target Alarms"
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Bell
                      size={14}
                      strokeWidth={2}
                      style={{ color: activeAlertsCount > 0 ? '#00e599' : 'inherit' }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>
                      Alarms ({activeAlertsCount})
                    </span>
                  </button>
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
                    <h3 className="vercel-alert-title">Smart Price Target Alerts</h3>
                    <p className="vercel-alert-desc">
                      Monitor market thresholds and receive instant Web Audio & Resend email alarms.
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <button
                        className="vercel-btn-outline"
                        onClick={() => openModal()}
                        style={{ color: '#00e599', borderColor: 'rgba(0,229,153,0.3)' }}
                      >
                        + Set Price Alarm 🔔
                      </button>
                      <button className="vercel-btn-outline" onClick={() => toggleDrawer()}>
                        View Active ({activeAlertsCount})
                      </button>
                    </div>
                  </div>

                  <div
                    className="vercel-alert-card"
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                  >
                    <span style={{ fontSize: '13px', color: isConnected ? '#666666' : '#ff4444' }}>
                      {isConnected
                        ? 'Live WebSocket Market Stream Active (NSE / NASDAQ)'
                        : 'Live WebSocket Market Stream Disconnected. Reconnecting...'}
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
                    <span className="vercel-tab-badge">
                      {gainersList.length + losersList.length}
                    </span>
                  </button>
                </div>

                {/* Gainers Cards Grid */}
                {(activeMarketTab === 'gainers' || activeMarketTab === 'all') && (
                  <div style={{ marginBottom: activeMarketTab === 'all' ? '32px' : '0' }}>
                    {activeMarketTab === 'all' && (
                      <h3 className="vercel-grid-section-title">
                        Stock Gainers ({gainersList.length})
                      </h3>
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
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                      }}
                                    >
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

                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="vercel-add-btn"
                                  disabled={
                                    isAdded ||
                                    (isSubmitting &&
                                      modal.isOpen &&
                                      modal.symbol === stock.symbol &&
                                      modal.mode === 'add')
                                  }
                                  onClick={() =>
                                    handleAddStockToPortfolio(stock.symbol, stock.price)
                                  }
                                  style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check size={13} strokeWidth={3} /> In Portfolio
                                    </>
                                  ) : isSubmitting &&
                                    modal.isOpen &&
                                    modal.symbol === stock.symbol &&
                                    modal.mode === 'add' ? (
                                    <>
                                      <div className="spinner" style={{ marginRight: '4px' }} />{' '}
                                      Adding...
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={13} strokeWidth={3} /> Add Stock
                                    </>
                                  )}
                                </button>

                                <button
                                  className="vercel-btn-outline"
                                  onClick={() => openModal(stock.symbol, stock.price)}
                                  style={{
                                    padding: '0 12px',
                                    color: '#00e599',
                                    borderColor: 'rgba(0,229,153,0.3)',
                                  }}
                                  title="Set Target Alarm"
                                >
                                  <Bell size={13} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ color: '#666666', fontSize: '13px' }}>
                          Streaming gainers...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Losers Cards Grid */}
                {(activeMarketTab === 'losers' || activeMarketTab === 'all') && (
                  <div>
                    {activeMarketTab === 'all' && (
                      <h3 className="vercel-grid-section-title">
                        Stock Losers ({losersList.length})
                      </h3>
                    )}
                    <div className="vercel-cards-grid">
                      {losersList.length > 0 ? (
                        losersList.map((stock) => {
                          const isAdded = portfolioHoldings.includes(stock.symbol);
                          return (
                            <div key={stock.symbol} className="vercel-stock-card">
                              <div className="vercel-card-top">
                                <div className="vercel-card-meta">
                                  <div
                                    className="vercel-card-icon"
                                    style={{ borderColor: '#331a1a' }}
                                  >
                                    {stock.symbol.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="vercel-card-title-group">
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                      }}
                                    >
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

                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="vercel-add-btn"
                                  disabled={
                                    isAdded ||
                                    (isSubmitting &&
                                      modal.isOpen &&
                                      modal.symbol === stock.symbol &&
                                      modal.mode === 'add')
                                  }
                                  onClick={() =>
                                    handleAddStockToPortfolio(stock.symbol, stock.price)
                                  }
                                  style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check size={13} strokeWidth={3} /> In Portfolio
                                    </>
                                  ) : isSubmitting &&
                                    modal.isOpen &&
                                    modal.symbol === stock.symbol &&
                                    modal.mode === 'add' ? (
                                    <>
                                      <div className="spinner" style={{ marginRight: '4px' }} />{' '}
                                      Adding...
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={13} strokeWidth={3} /> Add Stock
                                    </>
                                  )}
                                </button>

                                <button
                                  className="vercel-btn-outline"
                                  onClick={() => openModal(stock.symbol, stock.price)}
                                  style={{
                                    padding: '0 12px',
                                    color: '#00e599',
                                    borderColor: 'rgba(0,229,153,0.3)',
                                  }}
                                  title="Set Target Alarm"
                                >
                                  <Bell size={13} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ color: '#666666', fontSize: '13px' }}>
                          Streaming losers...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Price Alert Modal & Active Alerts Drawer */}
      <PriceAlertModal />
      <ActiveAlertsDrawer />
    </div>
  );
};
