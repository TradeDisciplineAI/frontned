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
  Lock,
  ShieldAlert,
  Bot,
  Zap,
  LineChart,
  PieChart,
  Users,
  Activity,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { usePriceAlertStore } from '@/stores/priceAlertStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { Sidebar } from '@/components/Sidebar';
import { StockSearchBar } from '@/components/StockSearchBar';
import { PriceAlertModal } from '@/components/PriceAlertModal';
import { ActiveAlertsDrawer } from '@/components/ActiveAlertsDrawer';
import { ExploreSkeleton } from '@/components/ui/ExploreSkeleton';
import { Sparkline } from '@/components/ui/Sparkline';
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

const MARKET_WS_URL = import.meta.env.VITE_MARKET_WS_BASE_URL || 'ws://127.0.0.1:8001';

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
      const token = useUserStore.getState().accessToken;
      const wsEndpoint = token
        ? `${MARKET_WS_URL}/dashboard/ws/market?token=${token}`
        : `${MARKET_WS_URL}/dashboard/ws/market`;

      ws = new WebSocket(wsEndpoint);

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
              usePortfolioStore.getState().portfolio?.holdings?.length || 0,
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
  }, [showToast, fetchAlerts]);

  const handleAddStockToPortfolio = (symbol: string, price?: number) => {
    // If no portfolio object existed yet, we'll auto create it on confirm, trigger modal first
    const exchangeLabel = activeMarketTab === 'losers' ? 'NSE · Losers' : 'NSE · Gainers';
    triggerAddHolding(symbol, price ?? 0, exchangeLabel);
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
                    onClick={isAuthenticated ? () => toggleDrawer() : () => useUserStore.getState().openGuestModal()}
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
                  {isAuthenticated && (
                    <button className="vercel-btn-white" onClick={() => navigate(ROUTES.DASHBOARD)}>
                      <span>Add New</span>
                      <ChevronDown size={13} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </header>

              {/* Body Content */}
              <div className="vercel-body-content">
                {/* Top Alerts Card / Promo Card */}
                {isAuthenticated ? (
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
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', margin: '40px 0 80px 0' }}>
                    {/* Hero Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.10fr 0.90fr', gap: '48px', alignItems: 'center' }}>
                      {/* Left Column: Headline, Subtitle, CTA */}
                      <div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: '1.15', margin: '0 0 20px 0', color: '#fff' }}>
                          Trade Smarter.<br />
                          <span style={{ background: 'linear-gradient(to right, #00e599, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Invest With Discipline.</span>
                        </h1>
                        <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: '1.6', margin: '0 0 36px 0', maxWidth: '580px' }}>
                          Real-time market intelligence, AI-powered portfolio analysis, price alerts, behavioral coaching, live charts, and intelligent trading insights in one platform.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => navigate(ROUTES.LOGIN)}
                            className="vercel-btn-white"
                            style={{ background: '#00e599', color: '#0b1120', fontWeight: 700, border: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0, 229, 153, 0.3)' }}
                          >
                            Create Free Account
                          </button>
                          <button
                            onClick={() => {
                              const el = document.getElementById('live-markets-anchor');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="vercel-btn-outline"
                            style={{ padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 600, borderColor: 'rgba(255,255,255,0.1)' }}
                          >
                            Explore Live Markets
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Premium Dashboard Preview Cards */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Portfolio Preview Card */}
                        <motion.div
                          whileHover={{ y: -5 }}
                          style={{
                            background: 'linear-gradient(135deg, rgba(22, 32, 50, 0.6) 0%, rgba(11, 17, 32, 0.8) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)',
                            position: 'relative',
                          }}
                        >
                          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e599', display: 'inline-block', boxShadow: '0 0 8px #00e599' }} />
                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>PORTFOLIO PREVIEW</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Portfolio Value</div>
                          <div style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>₹2,45,230</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                            <div>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>Today's Gain</span>
                              <span style={{ fontSize: '14px', color: '#00e599', fontWeight: 700, marginLeft: '8px' }}>+₹3,421</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <span style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>LOW RISK</span>
                              <span style={{ background: 'rgba(0, 229, 153, 0.12)', color: '#00e599', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(0, 229, 153, 0.2)' }}>AI SCORE: 92</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* AI Analysis Preview Card */}
                        <motion.div
                          whileHover={{ y: -5 }}
                          style={{
                            background: 'linear-gradient(135deg, rgba(22, 32, 50, 0.6) 0%, rgba(11, 17, 32, 0.8) 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: 'rgba(0, 229, 153, 0.1)', color: '#00e599', padding: '6px', borderRadius: '8px', display: 'flex' }}><Bot size={16} /></span>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>RELIANCE.NS AI Signals</span>
                            </div>
                            <span style={{ background: 'rgba(0, 229, 153, 0.15)', color: '#00e599', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(0, 229, 153, 0.2)' }}>BUY RECOMMENDED</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Confidence</div>
                              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>87%</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Support</div>
                              <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9' }}>2045</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Resistance</div>
                              <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9' }}>2130</div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Stats Counter Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', width: '100%' }}>
                      {[
                        { val: '5,000+', label: 'Live Stocks', sub: 'Real-time quotes', icon: <Activity size={16} /> },
                        { val: 'NSE + NASDAQ', label: 'Markets', sub: 'Global coverage', icon: <Zap size={16} /> },
                        { val: '125K+', label: 'AI Insights Generated', sub: 'Daily analysis', icon: <Bot size={16} /> },
                        { val: '2.4M+', label: 'Alerts Delivered', sub: 'SMS & Email alerts', icon: <Bell size={16} /> },
                        { val: 'Growing Daily', label: 'Active Users', sub: 'Global community', icon: <Users size={16} /> },
                      ].map((stat, i) => (
                        <div key={i} style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                          <div style={{ background: 'rgba(255,255,255,0.03)', color: '#00e599', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', marginBottom: '10px', justifyContent: 'center' }}>
                            {stat.icon}
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: 900, color: '#00e599', marginBottom: '4px' }}>{stat.val}</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', marginBottom: '2px' }}>{stat.label}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{stat.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Features Grid Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Platform Capabilities</h2>
                        <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>Discover the tools built to optimize your trading discipline and behavior.</p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {[
                          { icon: <LayoutGrid size={20} />, title: 'Live Market Dashboard', desc: 'Real-time prices, gainers, losers, candlestick charts, and WebSocket updates.' },
                          { icon: <PieChart size={20} />, title: 'Portfolio Management', desc: 'Create your own portfolio, track holdings, weight allocation, performance, and portfolio analytics.' },
                          { icon: <Bot size={20} />, title: 'AI Portfolio Analysis', desc: 'Receive intelligent recommendations, risk score, support, resistance, market sentiment, and behavior coaching.' },
                          { icon: <Bell size={20} />, title: 'Smart Price Alerts', desc: 'Configure instant browser notifications, email alerts, target prices, and real-time monitoring.' },
                          { icon: <ShieldAlert size={20} />, title: 'Behavioral Trading Coach', desc: 'Detect emotional trading, track discipline, prevent revenge trading, and receive AI coaching.' },
                          { icon: <LineChart size={20} />, title: 'Advanced Analytics', desc: 'Analyze portfolio performance, daily returns, risk metrics, sector allocation, and data history.' }
                        ].map((f, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ y: -6, borderColor: 'rgba(0, 229, 153, 0.25)' }}
                            style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '16px',
                              padding: '24px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              transition: 'border-color 0.2s',
                              cursor: 'pointer',
                            }}
                            onClick={() => useUserStore.getState().openGuestModal()}
                          >
                            <div style={{ background: 'rgba(0, 229, 153, 0.1)', color: '#00e599', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {f.icon}
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f1f5f9', margin: 0 }}>{f.title}</h3>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{f.desc}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Why Choose Us Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Why Choose TradeDisciplineAI?</h2>
                        <p style={{ fontSize: '16px', color: '#94a3b8', margin: 0 }}>Experience a state-of-the-art SaaS terminal built for the modern investor.</p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                        {[
                          { title: 'AI-Powered Investing', desc: 'Intelligent trade recommendations and automated risk analysis.' },
                          { title: 'Live WebSocket Markets', desc: 'Zero latency live NSE and NASDAQ gainers/losers streaming.' },
                          { title: 'Portfolio Analytics', desc: 'In-depth performance breakdown and sector allocations.' },
                          { title: 'Smart Alerts', desc: 'Highly customizable price alerts via web browser & email.' },
                          { title: 'Behavioral Coaching', desc: 'Identify emotional trading mistakes before they cost capital.' },
                          { title: 'Fast & Secure', desc: 'Built on high performance infrastructure with absolute data privacy.' }
                        ].map((b, idx) => (
                          <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '20px', display: 'flex', gap: '12px' }}>
                            <span style={{ color: '#00e599', fontSize: '16px', fontWeight: 'bold' }}>✓</span>
                            <div>
                              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px 0' }}>{b.title}</h4>
                              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{b.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Anchor point to navigate directly to interactive tables */}
                    <div id="live-markets-anchor" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '60px' }}>
                      <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>Live Market Terminal</h2>
                      <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Explore real-time gainers and losers. Sign in to add quotes to your watchlist and create price alerts.</p>
                    </div>
                  </div>
                )}

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

                              <div className="vercel-card-middle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minHeight: '40px' }}>
                                <div className="vercel-card-stats">
                                  <span className="vercel-price">${formatPrice(stock.price)}</span>
                                  <span className="vercel-change-pill positive">
                                    +{formatPercent(stock.percent_change)}%
                                  </span>
                                </div>
                                <Sparkline symbol={stock.symbol} change={stock.percent_change} />
                              </div>

                              {isAuthenticated ? (
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
                              ) : (
                                <button
                                  className="vercel-add-btn"
                                  onClick={() => useUserStore.getState().openGuestModal()}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    borderColor: 'rgba(255, 255, 255, 0.08)',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    color: '#888',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    height: '36px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <Lock size={12} style={{ color: '#00e599' }} />
                                  <span>Sign in to unlock</span>
                                </button>
                              )}
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

                              <div className="vercel-card-middle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minHeight: '40px' }}>
                                <div className="vercel-card-stats">
                                  <span className="vercel-price">${formatPrice(stock.price)}</span>
                                  <span className="vercel-change-pill negative">
                                    {formatPercent(stock.percent_change)}%
                                  </span>
                                </div>
                                <Sparkline symbol={stock.symbol} change={stock.percent_change} />
                              </div>

                              {isAuthenticated ? (
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
                              ) : (
                                <button
                                  className="vercel-add-btn"
                                  onClick={() => useUserStore.getState().openGuestModal()}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    borderColor: 'rgba(255, 255, 255, 0.08)',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    color: '#888',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    height: '36px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <Lock size={12} style={{ color: '#00e599' }} />
                                  <span>Sign in to unlock</span>
                                </button>
                              )}
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
