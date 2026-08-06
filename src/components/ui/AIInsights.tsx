import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Holding } from '@/services/portfolio.service';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

interface AIInsightsProps {
  holdings: Holding[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ holdings }) => {
  const { triggerAddHolding } = usePortfolioStore();

  const insights = React.useMemo(() => {
    if (holdings.length === 0) {
      return {
        riskLevel: 'Unknown',
        riskColor: '#64748b',
        diversification: 'Not Evaluated',
        summary:
          'Add assets to generate intelligent real-time AI Risk and Diversification indexes.',
        suggestion: null,
      };
    }

    const symbols = holdings.map((h) => h.symbol.toUpperCase());
    const isTechHeavy = symbols.some(
      (s) => s.includes('AAPL') || s.includes('TSLA') || s.includes('INFY') || s.includes('TCS'),
    );
    const isIndianMarket = symbols.some((s) => s.endsWith('.NS'));

    let riskLevel = 'Moderate';
    let riskColor = '#3b82f6'; // Blue
    let diversification = 'Moderate (2 Sectors)';
    let summary =
      'Your portfolio balance is healthy, but adding commodity or consumer goods assets would reduce global sector correlations.';
    let suggestion: {
      symbol: string;
      name: string;
      reason: string;
      price: number;
      exchange: string;
    } | null = {
      symbol: isIndianMarket ? 'HINDUNILVR.NS' : 'PG',
      name: isIndianMarket ? 'Hindustan Unilever' : 'Procter & Gamble Co.',
      reason: 'Optimize portfolio sector diversification with high-quality consumer defensives.',
      price: isIndianMarket ? 2614.5 : 165.2,
      exchange: isIndianMarket ? 'NSE · FMCG' : 'NYSE · FMCG',
    };

    if (symbols.length === 1) {
      riskLevel = 'High Concentration';
      riskColor = '#f59e0b'; // Orange
      diversification = 'Very Low (1 Asset)';
      summary =
        'Single-asset exposure represents high volatility. Consider adding uncorrelated assets to build portfolio resilience.';
    } else if (isTechHeavy && symbols.length >= 3) {
      riskLevel = 'High Risk';
      riskColor = '#ef4444'; // Red
      diversification = 'Low (Tech Dominated)';
      summary =
        'High technology concentration detected. You are exposed to cyclical market corrections in IT/Tech indices.';
      suggestion = {
        symbol: isIndianMarket ? 'HDFCBANK.NS' : 'JPM',
        name: isIndianMarket ? 'HDFC Bank Ltd.' : 'JPMorgan Chase & Co.',
        reason: 'Hedge high IT volatility with stable banking and finance leaders.',
        price: isIndianMarket ? 1624.1 : 204.8,
        exchange: isIndianMarket ? 'NSE · Financial' : 'NYSE · Financial',
      };
    } else if (symbols.length >= 4) {
      riskLevel = 'Optimal / Conservative';
      riskColor = '#10b981'; // Emerald
      diversification = 'High (Diverse Basket)';
      summary =
        'Excellent asset allocation. The correlation indexes between your holdings are optimally balanced for defense.';
      suggestion = null; // No action needed
    }

    return { riskLevel, riskColor, diversification, summary, suggestion };
  }, [holdings]);

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={16} style={{ color: '#00e599' }} />
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#94a3b8',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          AI Portfolio Insights
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Metric 1: Risk */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Risk Index
          </span>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: insights.riskColor,
              display: 'block',
              marginTop: '6px',
            }}
          >
            {insights.riskLevel}
          </span>
        </div>

        {/* Metric 2: Diversification */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Diversification
          </span>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#ffffff',
              display: 'block',
              marginTop: '6px',
            }}
          >
            {insights.diversification}
          </span>
        </div>
      </div>

      {/* Summary */}
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
        {insights.summary}
      </p>

      {/* Suggested next stock */}
      {insights.suggestion && (
        <div
          style={{
            borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
            paddingTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            AI Optimization Suggestion
          </span>

          <div
            style={{
              background: 'rgba(0, 229, 153, 0.02)',
              border: '1px solid rgba(0, 229, 153, 0.08)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>
                  {insights.suggestion.symbol}
                </strong>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  {insights.suggestion.exchange}
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                {insights.suggestion.reason}
              </span>
            </div>

            <button
              onClick={() =>
                triggerAddHolding(
                  insights.suggestion!.symbol,
                  insights.suggestion!.price,
                  insights.suggestion!.exchange,
                )
              }
              style={{
                background: '#0d9488',
                border: 'none',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
            >
              + Quick Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
