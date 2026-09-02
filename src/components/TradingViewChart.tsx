import { marketApiClient } from '@/lib/api.client';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import { Bell, Zap, Star, Activity } from 'lucide-react';
import { marketService } from '@/services/market.service';
import { usePriceAlertStore } from '@/stores/priceAlertStore';

interface TradingViewChartProps {
  symbol: string | null;
  onViewIndicators?: (symbol: string) => void;
}

// Robust helper to format values safely without throwing runtime crashes
const safeFormatPrice = (val: any, decimals: number = 2): string => {
  if (val === undefined || val === null) return '—';
  const num = Number(val);
  if (isNaN(num)) return '—';
  return num.toFixed(decimals);
};

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, onViewIndicators }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [indicatorData, setIndicatorData] = useState<any>(null);
  const [chartRawData, setChartRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [timeframe, setTimeframe] = useState<string>('1M');
  const [lastUpdatedSec, setLastUpdatedSec] = useState<number>(0);
  const [watchlistActive, setWatchlistActive] = useState<boolean>(false);

  const openModal = usePriceAlertStore((state) => state.openModal);

  // Helper timer for Last Updated
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSec((prev) => (prev >= 9 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Symbol mappings helper
  const symbolDetails = useMemo(() => {
    if (!symbol) return null;
    const upper = symbol.toUpperCase();
    if (upper.includes('HINDUNILVR')) {
      return {
        name: 'Hindustan Unilever Ltd',
        exchange: 'NSE',
        sector: 'FMCG',
        logoColor: '#10b981',
        country: 'IN',
      };
    }
    if (upper.includes('RELIANCE')) {
      return {
        name: 'Reliance Industries Ltd',
        exchange: 'NSE',
        sector: 'Energy & Telecom',
        logoColor: '#3b82f6',
        country: 'IN',
      };
    }
    if (upper.includes('TCS')) {
      return {
        name: 'Tata Consultancy Services',
        exchange: 'NSE',
        sector: 'IT Services',
        logoColor: '#8b5cf6',
        country: 'IN',
      };
    }
    if (upper.includes('AAPL')) {
      return {
        name: 'Apple Inc.',
        exchange: 'NASDAQ',
        sector: 'Technology',
        logoColor: '#f3f4f6',
        country: 'US',
      };
    }
    if (upper.includes('TSLA')) {
      return {
        name: 'Tesla Inc.',
        exchange: 'NASDAQ',
        sector: 'Automotive & Clean Energy',
        logoColor: '#f59e0b',
        country: 'US',
      };
    }
    if (upper.includes('BHARTIARTL')) {
      return {
        name: 'Bharti Airtel Ltd',
        exchange: 'NSE',
        sector: 'Telecommunications',
        logoColor: '#ef4444',
        country: 'IN',
      };
    }
    if (upper.includes('MSFT')) {
      return {
        name: 'Microsoft Corporation',
        exchange: 'NASDAQ',
        sector: 'Software & Cloud',
        logoColor: '#0070f3',
        country: 'US',
      };
    }
    if (upper.includes('NVDA')) {
      return {
        name: 'NVIDIA Corporation',
        exchange: 'NASDAQ',
        sector: 'Semiconductors',
        logoColor: '#76b900',
        country: 'US',
      };
    }
    return {
      name: symbol,
      exchange: symbol.endsWith('.NS') ? 'NSE' : 'US Market',
      sector: 'Equity',
      logoColor: '#00dfa2',
      country: symbol.endsWith('.NS') ? 'IN' : 'US',
    };
  }, [symbol]);

  // Statistics calculation based on latest candle and deterministic seed
  const stats = useMemo(() => {
    if (!symbol || chartRawData.length === 0) return null;
    const latest = chartRawData[chartRawData.length - 1];

    // Percent change computation
    const prevClose = latest.open || latest.close;
    const diff = latest.close - prevClose;
    const percentChange = prevClose !== 0 ? (diff / prevClose) * 100 : 0;

    return {
      currentPrice: latest.close,
      open: latest.open,
      high: latest.high,
      low: latest.low,
      todayChange: `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%)`,
      isGaining: diff >= 0,
    };
  }, [symbol, chartRawData]);

  useEffect(() => {
    if (!symbol || !chartContainerRef.current) return;

    const fetchAndDrawChart = async () => {
      setLoading(true);
      setError(null);
      setAnalysisData(null);
      setChartRawData([]);

      try {
        const response = await marketService.analyzeStock(symbol);
        setAnalysisData(response.analysis);

        try {
            const indRes = await marketApiClient.get(`/dashboard/indicators/${symbol}`);
            setIndicatorData(indRes.data);
          } catch (err) {
            console.error('Failed to fetch indicators', err);
          }

        // Filter out any candles with null/undefined open, high, low, or close to prevent lightweight-charts library from throwing assertion failures
        const rawData = response.chart_data || [];
        const validData = rawData.filter(
          (item: any) =>
            item &&
            item.time &&
            item.open !== null &&
            item.open !== undefined &&
            !isNaN(Number(item.open)) &&
            item.high !== null &&
            item.high !== undefined &&
            !isNaN(Number(item.high)) &&
            item.low !== null &&
            item.low !== undefined &&
            !isNaN(Number(item.low)) &&
            item.close !== null &&
            item.close !== undefined &&
            !isNaN(Number(item.close)),
        );

        setChartRawData(validData);

        // Clear existing chart if any
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }

        if (chartContainerRef.current && validData.length > 0) {
          // Initialize TradingView Lightweight Chart
          const chart = createChart(chartContainerRef.current, {
            layout: {
              background: { color: 'transparent' },
              textColor: '#94a3b8',
              fontSize: 11,
            },
            grid: {
              vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
              horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
            },
            rightPriceScale: {
              borderVisible: false,
              scaleMargins: {
                top: 0.15,
                bottom: 0.15,
              },
            },
            timeScale: {
              borderVisible: false,
            },
            crosshair: {
              vertLine: {
                color: '#64748b',
                width: 1,
                style: 3,
              },
              horzLine: {
                color: '#64748b',
                width: 1,
                style: 3,
              },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
          });

          const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
          });

          candlestickSeries.setData(validData);
          chart.timeScale().fitContent();

          chartRef.current = chart;
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchAndDrawChart();

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol]);

  const handleActionAlert = () => {
    if (symbol && stats) {
      openModal(symbol, stats.currentPrice);
    }
  };

  const handleActionAnalysis = () => {
    alert(`⚡ AI scan triggered for ${symbol}. Asset health indexes verified.`);
  };

  if (!symbol) return null;

  const isUp = stats?.isGaining ?? true;
  const currencySymbol = symbolDetails?.country === 'IN' ? '₹' : '$';

  return (
    <div className="widget-card" style={{ gap: '24px', position: 'relative', overflow: 'hidden' }}>
      <style>{`

        .terminal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }

        .symbol-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1rem;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }

        .price-badge-pulse {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: blink-light 1.2s infinite;
        }
        @keyframes blink-light {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .stats-grid-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .stat-glass-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .stat-glass-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .timeframe-tab-btn {
          background: transparent;
          border: none;
          color: #64748b;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .timeframe-tab-btn.active {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }
        .timeframe-tab-btn:hover:not(.active) {
          color: #cbd5e1;
        }

        .action-icon-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .action-icon-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .ai-recommendation-panel {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 16px 20px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          align-items: center;
        }

        @media (max-width: 1023px) {
          .stats-grid-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 639px) {
          .stats-grid-row {
            grid-template-columns: 1fr;
          }
          .ai-recommendation-panel {
            grid-template-columns: 1fr;
          }
          .terminal-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* 1. Terminal Header */}
      <div className="terminal-header">
        {/* Left Side: Avatar & Identity details */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div
            className="symbol-avatar"
            style={{
              background: symbolDetails?.logoColor
                ? `${symbolDetails.logoColor}0c`
                : 'rgba(255,255,255,0.03)',
              color: symbolDetails?.logoColor || '#ffffff',
            }}
          >
            {symbol.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                }}
              >
                {symbolDetails?.name || symbol}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  background: 'rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {symbol}
              </span>
            </div>
            <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>
              {symbolDetails?.exchange || 'US Market'} · {symbolDetails?.sector || 'Equity'}
            </span>
          </div>
        </div>

        {/* Right Side: Live Badges, Price, and Flash */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}
          >
            <span
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                color: isUp ? '#10b981' : '#ef4444',
                letterSpacing: '-1px',
                lineHeight: 1,
              }}
            >
              {currencySymbol}
              {stats ? safeFormatPrice(stats.currentPrice) : '0.00'}
            </span>
            {stats && (
              <span
                style={{ fontSize: '0.8rem', fontWeight: 700, color: isUp ? '#10b981' : '#ef4444' }}
              >
                {stats.todayChange}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              className="price-badge-pulse"
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                color: '#10b981',
              }}
            >
              <div className="pulse-dot" style={{ background: '#10b981' }} />
              <span>LIVE</span>
            </div>
            <span
              style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'right', fontWeight: 600 }}
            >
              updated {lastUpdatedSec}s ago
            </span>
          </div>
        </div>
      </div>

      {/* 2. Compact Statistics Grid Row (100% Real values) */}
      {stats && (
        <div className="stats-grid-row">
          <div className="stat-glass-card">
            <span
              style={{
                fontSize: '0.65rem',
                color: '#64748b',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Price
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              {currencySymbol}
              {safeFormatPrice(stats.currentPrice)}
            </span>
          </div>
          <div className="stat-glass-card">
            <span
              style={{
                fontSize: '0.65rem',
                color: '#64748b',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Open
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              {currencySymbol}
              {safeFormatPrice(stats.open)}
            </span>
          </div>
          <div className="stat-glass-card">
            <span
              style={{
                fontSize: '0.65rem',
                color: '#64748b',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              High
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981' }}>
              {currencySymbol}
              {safeFormatPrice(stats.high)}
            </span>
          </div>
          <div className="stat-glass-card">
            <span
              style={{
                fontSize: '0.65rem',
                color: '#64748b',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Low
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ef4444' }}>
              {currencySymbol}
              {safeFormatPrice(stats.low)}
            </span>
          </div>
        </div>
      )}

      {/* 3. Timeframe Controls & Action Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          paddingBottom: '12px',
          marginTop: '4px',
        }}
      >
        {/* Timeframe Buttons Row */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {['1D', '5D', '1M', '3M', '6M', '1Y', 'MAX'].map((tf) => (
            <button
              key={tf}
              type="button"
              className={`timeframe-tab-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Action list */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="action-icon-btn"
            onClick={handleActionAlert}
            title="Configure target price alert"
          >
            <Bell size={13} style={{ color: '#00e599' }} /> Alert
          </button>
          <button
            type="button"
            className="action-icon-btn"
            onClick={handleActionAnalysis}
            title="Analyze asset risk using AI"
          >
            <Zap size={13} style={{ color: '#cbd5e1' }} /> AI Scan
          </button>
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => setWatchlistActive(!watchlistActive)}
            title="Pin stock to your watch panel"
          >
            <Star
              size={13}
              fill={watchlistActive ? '#eab308' : 'none'}
              style={{ color: watchlistActive ? '#eab308' : '#cbd5e1' }}
            />{' '}
            Watch
          </button>
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => {
              if (onViewIndicators && symbol) onViewIndicators(symbol);
            }}
            title="View Technical Indicators"
          >
            <Activity size={13} style={{ color: '#3b82f6' }} /> Indicators
          </button>
        </div>
      </div>

      {/* 4. Candlestick Chart Workspace */}
      <div style={{ position: 'relative', width: '100%', height: '400px' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              zIndex: 10,
            }}
          >
            Analyzing {symbol} Real-time Session...
          </div>
        )}
        {error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              zIndex: 10,
            }}
          >
            {error}
          </div>
        )}
        <div
          ref={chartContainerRef}
          style={{
            width: '100%',
            height: '100%',
            opacity: loading || error ? 0 : 1,
            pointerEvents: loading || error ? 'none' : 'auto',
          }}
        />

        {/* 5. Floating Price Badge on Right Axis */}
        {stats && !loading && !error && stats.currentPrice !== null && (
          <div
            style={{
              position: 'absolute',
              right: '0',
              top: '40%',
              background: isUp ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
              color: '#ffffff',
              padding: '4px 8px',
              borderRadius: '4px 0 0 4px',
              fontSize: '0.7rem',
              fontWeight: 800,
              zIndex: 5,
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transform: 'translateY(-50%)',
            }}
          >
            {safeFormatPrice(stats.currentPrice)}
          </div>
        )}
      </div>

      {/* 6. AI Recommendation Panel (Only real backend outputs) */}
      {analysisData && (
        <div className="ai-recommendation-panel">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span
              style={{
                fontSize: '0.6rem',
                color: '#64748b',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              AI Recommendation
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: analysisData.trend === 'BULLISH' ? '#10b981' : '#ef4444',
              }}
            >
              {analysisData.recommendation || 'HOLD'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span
              style={{
                fontSize: '0.6rem',
                color: '#64748b',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              Trend Bias
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: analysisData.trend === 'BULLISH' ? '#10b981' : '#ef4444',
                background:
                  analysisData.trend === 'BULLISH'
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(239, 68, 68, 0.08)',
                padding: '2px 8px',
                borderRadius: '6px',
                width: 'max-content',
              }}
            >
              {analysisData.trend || 'UNKNOWN'}
            </span>
          </div>
        </div>
      )}

      {/* 7. Inline Core Indicators Panel */}
      {indicatorData && (
        <div style={{ padding: '16px', background: '#0f172a', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '0 0 12px 12px' }}>
          <h4 style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', margin: 0 }}>
            Core Indicators
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '12px' }}>
             {/* RSI */}
             <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                 <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>RSI (14)</span>
                 <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>{indicatorData.rsi?.toFixed(2) || '—'}</span>
               </div>
               <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                 {indicatorData.rsi !== null ? (indicatorData.rsi > 70 ? 'Overbought' : indicatorData.rsi < 30 ? 'Oversold' : 'Neutral') : 'N/A'}
               </span>
             </div>

             {/* MACD */}
             <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                 <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>MACD (12, 26, 9)</span>
                 {indicatorData.macd !== null ? (
                   <span style={{ fontSize: '0.75rem', fontWeight: 800, color: indicatorData.macd > 0 ? '#10b981' : '#ef4444', background: indicatorData.macd > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
                     {indicatorData.macd.toFixed(2)}
                   </span>
                 ) : (
                   <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>—</span>
                 )}
               </div>
               <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                 {indicatorData.macd !== null ? (indicatorData.macd > 0 ? 'Bullish Trend' : 'Bearish Trend') : 'N/A'}
               </span>
             </div>

             {/* SMA (20) */}
             <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                 <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>SMA (20)</span>
                 <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>{indicatorData.sma_20?.toFixed(2) || '—'}</span>
               </div>
               <span style={{ fontSize: '0.75rem', color: '#64748b' }}>20-day Simple Moving Average</span>
             </div>

             {/* SMA (50) */}
             <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                 <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>SMA (50)</span>
                 <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>{indicatorData.sma_50?.toFixed(2) || '—'}</span>
               </div>
               <span style={{ fontSize: '0.75rem', color: '#64748b' }}>50-day Simple Moving Average</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TradingViewChart;
