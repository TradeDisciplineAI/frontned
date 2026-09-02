import React from 'react';
import { X, Activity, RefreshCw } from 'lucide-react';
import '@/styles/components/price-alerts.css';

interface IndicatorsDrawerProps {
  symbol: string | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  indicators: {
    symbol: string;
    rsi: number | null;
    macd: number | null;
    sma_20: number | null;
    sma_50: number | null;
  } | null;
}

export const IndicatorsDrawer: React.FC<IndicatorsDrawerProps> = ({
  symbol,
  isOpen,
  onClose,
  isLoading,
  indicators,
}) => {
  if (!isOpen) return null;

  return (
    <div className="vercel-drawer-backdrop" onClick={onClose}>
      <div className="vercel-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="vercel-drawer-header">
          <div className="vercel-drawer-title-group">
            <Activity size={18} strokeWidth={2.5} style={{ color: '#3b82f6' }} />
            <h3 className="vercel-drawer-title">{symbol} Technicals</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="vercel-drawer-close-btn"
              onClick={onClose}
              title="Close Drawer"
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="vercel-drawer-body">
          {isLoading ? (
            <div className="vercel-drawer-empty">
              <RefreshCw size={24} className="spin" style={{ color: '#888', marginBottom: '12px' }} />
              <p style={{ margin: 0, fontWeight: 600, color: '#ededed' }}>Calculating Indicators...</p>
            </div>
          ) : !indicators ? (
            <div className="vercel-drawer-empty">
              <p style={{ margin: 0, fontWeight: 600, color: '#ededed' }}>No data available.</p>
            </div>
          ) : (
            <div className="vercel-alerts-list">
              <div className="vercel-alert-group">
                <h4 className="vercel-group-label">Core Indicators</h4>
                
                {/* RSI */}
                <div className="vercel-alert-item">
                  <div className="vercel-item-left">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="vercel-symbol-name">RSI (14)</span>
                        {indicators.rsi !== null && (
                          <span className={`vercel-condition-badge ${indicators.rsi > 70 ? 'above' : indicators.rsi < 30 ? 'below' : 'neutral'}`}>
                            {indicators.rsi.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="vercel-alert-time">
                        {indicators.rsi !== null 
                          ? (indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral') 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* MACD */}
                <div className="vercel-alert-item">
                  <div className="vercel-item-left">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="vercel-symbol-name">MACD (12, 26, 9)</span>
                        {indicators.macd !== null && (
                          <span className={`vercel-condition-badge ${indicators.macd > 0 ? 'above' : 'below'}`}>
                            {indicators.macd.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="vercel-alert-time">
                        {indicators.macd !== null 
                          ? (indicators.macd > 0 ? 'Bullish Trend' : 'Bearish Trend') 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SMA 20 */}
                <div className="vercel-alert-item">
                  <div className="vercel-item-left">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="vercel-symbol-name">SMA (20)</span>
                        <span className="vercel-condition-badge neutral">
                          {indicators.sma_20 ? indicators.sma_20.toFixed(2) : 'N/A'}
                        </span>
                      </div>
                      <span className="vercel-alert-time">20-day Simple Moving Average</span>
                    </div>
                  </div>
                </div>

                {/* SMA 50 */}
                <div className="vercel-alert-item">
                  <div className="vercel-item-left">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="vercel-symbol-name">SMA (50)</span>
                        <span className="vercel-condition-badge neutral">
                          {indicators.sma_50 ? indicators.sma_50.toFixed(2) : 'N/A'}
                        </span>
                      </div>
                      <span className="vercel-alert-time">50-day Simple Moving Average</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
