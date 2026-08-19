import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Loader2 } from 'lucide-react';
import { newsService, type StockNewsResponse } from '@/services/news.service';
import '@/styles/components/stock-news.css';

interface StockNewsProps {
  symbol: string | null;
}

export const StockNews: React.FC<StockNewsProps> = ({ symbol }) => {
  const [newsData, setNewsData] = useState<StockNewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setNewsData(null);
      return;
    }

    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await newsService.getStockNews(symbol);
        setNewsData(data);
      } catch (err: any) {
        console.error('Error fetching news:', err);
        setError('Failed to load latest news for this asset.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [symbol]);

  if (!symbol) {
    return null;
  }

  return (
    <div className="stock-news-container">
      <div className="stock-news-header">
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6',
          }}
        >
          <Newspaper size={18} />
        </div>
        <div className="stock-news-title">Latest {symbol} News</div>
      </div>

      {isLoading ? (
        <div className="stock-news-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 size={24} className="lucide-spin" style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
          <span>Curating latest headlines...</span>
        </div>
      ) : error ? (
        <div className="stock-news-empty" style={{ color: '#ef4444' }}>
          {error}
        </div>
      ) : (
        <div className="stock-news-content">
          {Array.isArray(newsData?.headlines) && newsData.headlines.length > 0 ? (
            newsData.headlines.map((headline, idx) => {
              const title = typeof headline === 'string' ? headline : headline.title || headline.text || 'News Update';
              const link = typeof headline === 'object' && headline.url ? headline.url : `https://finance.yahoo.com/quote/${symbol}/news`;

              return (
                <a 
                  key={idx} 
                  href={link}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="stock-news-item"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="stock-news-item-title">{title}</div>
                  <div className="stock-news-item-meta">
                    <span>{typeof headline === 'object' && headline.source ? headline.source : 'Market News'}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6' }}>
                      Read article <ExternalLink size={10} />
                    </span>
                  </div>
                </a>
              );
            })
          ) : (
            <div className="stock-news-empty">
              No recent news found for {symbol}.
            </div>
          )}
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
