import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import { Bell } from 'lucide-react';
import { marketService } from '@/services/market.service';
import { usePriceAlertStore } from '@/stores/priceAlertStore';

interface TradingViewChartProps {
  symbol: string | null;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const openModal = usePriceAlertStore((state) => state.openModal);

  useEffect(() => {
    if (!symbol || !chartContainerRef.current) return;

    const fetchAndDrawChart = async () => {
      setLoading(true);
      setError(null);
      setAnalysisData(null);
      
      try {
        const response = await marketService.analyzeStock(symbol);
        setAnalysisData(response.analysis);

        // Clear existing chart if any
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }

        if (chartContainerRef.current && response.chart_data && response.chart_data.length > 0) {
          // Initialize TradingView Lightweight Chart
          const chart = createChart(chartContainerRef.current, {
            layout: {
              background: { color: '#0b1120' }, // Match Vercel dark theme
              textColor: '#d1d5db',
            },
            grid: {
              vertLines: { color: '#1f2937' },
              horzLines: { color: '#1f2937' },
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

          // Lightweight charts requires time to be YYYY-MM-DD
          candlestickSeries.setData(response.chart_data);
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

  if (!symbol) return null;

  return (
    <div style={{ marginTop: '32px', padding: '24px', background: '#111827', borderRadius: '12px', border: '1px solid #1f2937' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{symbol} Chart Analysis</h2>
          {symbol && (
            <button
              onClick={() => openModal(symbol)}
              style={{
                padding: '6px 12px',
                fontSize: '0.85rem',
                borderRadius: '6px',
                background: 'rgba(0, 229, 153, 0.1)',
                border: '1px solid rgba(0, 229, 153, 0.3)',
                color: '#00e599',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title={`Set Price Target Alarm for ${symbol}`}
            >
              <Bell size={13} strokeWidth={2.5} /> Set Target Alarm 🔔
            </button>
          )}
        </div>
        
        {analysisData && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              background: analysisData.trend === 'BULLISH' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: analysisData.trend === 'BULLISH' ? '#10b981' : '#ef4444',
              fontWeight: 'bold',
              border: `1px solid ${analysisData.trend === 'BULLISH' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              TREND: {analysisData.trend}
            </span>
            <span style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              background: '#374151',
              color: '#f3f4f6',
              fontWeight: 'bold'
            }}>
              {analysisData.recommendation}
            </span>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', width: '100%', height: '400px' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', zIndex: 10 }}>
            Analyzing {symbol} Data...
          </div>
        )}
        {error && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', zIndex: 10 }}>
            {error}
          </div>
        )}
        <div 
          ref={chartContainerRef} 
          style={{ 
            width: '100%', 
            height: '100%', 
            opacity: (loading || error) ? 0 : 1, 
            pointerEvents: (loading || error) ? 'none' : 'auto'
          }} 
        />
      </div>
    </div>
  );
};
