import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, LayoutGrid, AlertTriangle, RefreshCw } from 'lucide-react';
import type { UserResponse } from '@/features/auth/auth.types';
import { PortfolioView } from '@/components/PortfolioView';
import { Sidebar } from '@/components/Sidebar';
import { TradingViewChart } from '@/components/TradingViewChart';
import { usePriceAlertStore } from '@/stores/priceAlertStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { PortfolioAllocationChart } from '@/components/ui/PortfolioAllocationChart';
import { DashboardEmptyState } from '@/components/ui/DashboardEmptyState';
import { StockSearchBar } from '@/components/StockSearchBar';
import { DashboardSkeleton } from '@/components/ui/DashboardSkeleton';
import '@/styles/components/dashboard.css';

interface DashboardPageProps {
  user: UserResponse | null;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { toggleDrawer, alerts, fetchAlerts } = usePriceAlertStore();
  const { portfolio, isLoading, error, fetchPortfolio, triggerAddHolding } = usePortfolioStore();

  const activeAlertsCount = alerts.filter((a) => !a.is_triggered).length;
  const portfolioHoldings = portfolio?.holdings?.map((h) => h.symbol) || [];

  // Fetch initial alerts and portfolio details on mount
  useEffect(() => {
    fetchAlerts();
    fetchPortfolio();
  }, [fetchAlerts, fetchPortfolio]);

  const handleAddStockToPortfolio = (symbol: string, price?: number) => {
    triggerAddHolding(symbol, price || null, 'NYSE / NASDAQ');
  };

  const focusSearchInput = () => {
    const input = document.querySelector('.stock-search-input') as HTMLInputElement;
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Safe parsed metrics values
  const holdingsCount = portfolio?.holdings?.length || 0;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--color-bg-primary, #0b1120)',
        color: '#f3f4f6',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        .dashboard-main-container {
          margin-left: 280px;
          flex: 1;
          padding: 48px;
          box-sizing: border-box;
          transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1), padding 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
        }
        
        .dashboard-max-width-box {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .dashboard-main-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
          align-items: start;
        }

        .main-left-col {
          grid-column: span 8;
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
          min-width: 0;
        }

        .main-right-col {
          grid-column: span 4;
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
          min-width: 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .mobile-top-bar {
          display: none;
          align-items: center;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 8px;
        }

        .widget-card {
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1535px) {
          .dashboard-main-container {
            margin-left: 240px;
            padding: 32px;
          }
        }

        @media (max-width: 1279px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .main-left-col, .main-right-col {
            grid-column: span 12;
          }
        }

        @media (max-width: 1023px) {
          .dashboard-main-container {
            margin-left: 0;
            padding: 24px 16px;
          }
          .mobile-top-bar {
            display: flex;
          }
        }

        @media (max-width: 639px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-main-container {
            padding: 16px 12px;
            gap: 20px;
          }
        }
      `}</style>

      {/* Sidebar Panel - Slides out on mobile */}
      <Sidebar
        user={user}
        onLogout={onLogout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile Drawer Overlay Backdrops */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 2050,
            animation: 'fadeIn 0.2s ease-out forwards',
          }}
        />
      )}

      {/* Main Content Area */}
      <main className="dashboard-main-container">
        <div className="dashboard-max-width-box">
          {/* Mobile Top Navigation Sticky Bar */}
          <div className="mobile-top-bar">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutGrid size={15} />
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Menu</span>
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
              Portfolio Dashboard
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-skeleton"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ width: '100%' }}
              >
                <DashboardSkeleton />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <div
                  className="widget-card"
                  style={{
                    maxWidth: '500px',
                    margin: '80px auto',
                    textAlign: 'center',
                    alignItems: 'center',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    background: 'rgba(239, 68, 68, 0.02)',
                    padding: '40px 32px',
                  }}
                >
                  <AlertTriangle size={44} style={{ color: '#ef4444', marginBottom: '16px' }} />
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: '0 0 8px 0',
                    }}
                  >
                    Unable to load portfolio.
                  </h3>
                  <p
                    style={{
                      color: '#94a3b8',
                      margin: '0 0 24px 0',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                    }}
                  >
                    {error}
                  </p>
                  <button
                    onClick={() => fetchPortfolio()}
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      transition: 'filter 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                  >
                    <RefreshCw size={14} /> Retry Request
                  </button>
                </div>
              </motion.div>
            ) : !portfolio ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <DashboardEmptyState onSearchFocus={focusSearchInput} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontSize: 'clamp(24px, 3vw, 36px)',
                        fontWeight: 900,
                        margin: '0 0 4px 0',
                        color: '#ffffff',
                        letterSpacing: '-0.5px',
                        lineHeight: '1.2',
                      }}
                    >
                      Welcome back, {user?.username || 'Trader'}
                    </h1>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.925rem' }}>
                      Your AI-guided investment portfolio is being audited in real-time.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={toggleDrawer}
                      style={{
                        background: 'rgba(0, 229, 153, 0.08)',
                        border: '1px solid rgba(0, 229, 153, 0.25)',
                        color: '#00e599',
                        padding: '10px 18px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'rgba(0, 229, 153, 0.15)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'rgba(0, 229, 153, 0.08)')
                      }
                      title="View Active Alarms"
                    >
                      <Bell size={15} strokeWidth={2.5} /> Alarms ({activeAlertsCount})
                    </button>
                  </div>
                </div>

                {/* Layout Empty Wizard or Grid */}
                {holdingsCount === 0 ? (
                  <DashboardEmptyState onSearchFocus={focusSearchInput} />
                ) : (
                  <div className="dashboard-main-grid">
                    {/* Left Column (Chart, Holdings) - Spans 8 cols */}
                    <div className="main-left-col">
                      {/* Chart fits properly inside scroll container on tiny screens */}
                      <div
                        style={{
                          width: '100%',
                          overflowX: 'auto',
                          WebkitOverflowScrolling: 'touch',
                          marginBottom: '24px',
                        }}
                      >
                        <div style={{ minWidth: '320px' }}>
                          <TradingViewChart symbol={selectedStock} />
                        </div>
                      </div>

                      {/* Redesigned Holdings Component */}
                      <PortfolioView onSelectStock={setSelectedStock} />
                    </div>

                    {/* Sidebar Column (Search, Allocation) - Spans 4 cols */}
                    <div className="main-right-col">
                      {/* Quick Search Autocomplete Area */}
                      <div className="widget-card" style={{ zIndex: 10, position: 'relative' }}>
                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#94a3b8',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            marginBottom: '-4px',
                          }}
                        >
                          Quick Asset Lookup
                        </span>
                        <div style={{ width: '100%' }}>
                          <StockSearchBar
                            onAddStock={handleAddStockToPortfolio}
                            existingHoldings={portfolioHoldings}
                            placeholder="Search stock ticker to add..."
                          />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '4px',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Shortcut: Press
                          </span>
                          <kbd
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              color: '#cbd5e1',
                              fontFamily: 'monospace',
                            }}
                          >
                            Ctrl + K
                          </kbd>
                        </div>
                      </div>

                      {/* Allocation Weights Doughnut Chart */}
                      <PortfolioAllocationChart holdings={portfolio.holdings} />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
export default DashboardPage;
