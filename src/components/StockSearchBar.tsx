import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, Plus } from 'lucide-react';
import { marketService, type StockSearchResult } from '@/services/market.service';
import '@/styles/components/stock-search-bar.css';

interface StockSearchBarProps {
  onAddStock: (symbol: string) => Promise<void>;
  existingHoldings?: string[];
  placeholder?: string;
}

export const StockSearchBar: React.FC<StockSearchBarProps> = ({
  onAddStock,
  existingHoldings = [],
  placeholder = 'Search stocks by name or ticker...',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [addingSymbol, setAddingSymbol] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search logic (300ms)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const searchResults = await marketService.searchStocks(query);
        setResults(searchResults);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to search stocks:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = async (symbol: string) => {
    setAddingSymbol(symbol);
    try {
      await onAddStock(symbol);
      setIsOpen(false);
      setQuery('');
    } finally {
      setAddingSymbol(null);
    }
  };

  return (
    <div className="stock-search-container" ref={containerRef}>
      <div className="stock-search-input-wrapper">
        <span className="stock-search-icon">
          <Search size={14} strokeWidth={2} />
        </span>
        <input
          type="text"
          className="stock-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {isLoading ? (
          <div className="stock-search-spinner" />
        ) : (
          query && (
            <button
              className="stock-search-clear"
              onClick={() => {
                setQuery('');
                setResults([]);
                setIsOpen(false);
              }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          )
        )}
      </div>

      {isOpen && (
        <div className="stock-search-dropdown">
          {results.length === 0 ? (
            <div className="stock-search-empty">No matching stocks found for "{query}"</div>
          ) : (
            results.map((stock) => {
              const isAdded = existingHoldings.includes(stock.symbol);
              const isAdding = addingSymbol === stock.symbol;

              return (
                <div key={stock.symbol} className="stock-search-item">
                  <div className="stock-search-info">
                    <div className="stock-search-symbol-wrapper">
                      <span className="stock-search-symbol">{stock.symbol}</span>
                      {stock.exchange && (
                        <span className="stock-search-exchange">{stock.exchange}</span>
                      )}
                    </div>
                    <span className="stock-search-name" title={stock.name}>
                      {stock.name}
                    </span>
                  </div>

                  <button
                    className="stock-search-add-btn"
                    disabled={isAdded || isAdding}
                    onClick={() => handleAdd(stock.symbol)}
                  >
                    {isAdding ? (
                      'Adding...'
                    ) : isAdded ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} strokeWidth={3} /> Added
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Plus size={12} strokeWidth={3} /> Add
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
