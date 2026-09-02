import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  ShieldAlert,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import type { TradeProposal } from '@/types/tradeProposal.types';
import { ProposalRow } from './ProposalRow';
import '@/styles/components/tradeProposal.css';

interface TradeProposalsListProps {
  proposals: TradeProposal[];
  isLoading: boolean;
  onOpenCreate: () => void;
  onReview: (proposal: TradeProposal) => void;
}

const ITEMS_PER_PAGE = 10;

export const TradeProposalsList: React.FC<TradeProposalsListProps> = ({
  proposals,
  isLoading,
  onOpenCreate,
  onReview,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sideFilter, setSideFilter] = useState<string>('ALL');
  const [strategyFilter, setStrategyFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [page, setPage] = useState(1);

  // Dynamically extract unique strategy names from actual proposal data
  const availableStrategies = useMemo(() => {
    const set = new Set<string>();
    proposals.forEach((p) => {
      if (p.primary_strategy) set.add(p.primary_strategy);
    });
    return Array.from(set).sort();
  }, [proposals]);

  // Reset to page 1 whenever any filter/search/sort changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, sideFilter, strategyFilter, sortBy]);

  // Filter & Sort Logic
  const filteredProposals = useMemo(() => {
    return proposals
      .filter((p) => {
        // Search term filter
        const s = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !s ||
          p.symbol.toLowerCase().includes(s) ||
          (p.primary_strategy && p.primary_strategy.toLowerCase().includes(s)) ||
          (p.id && p.id.toLowerCase().includes(s));

        // Status filter
        const pStatus = p.status || 'PENDING_RISK';
        const matchesStatus = statusFilter === 'ALL' || pStatus === statusFilter;

        // Side filter
        const matchesSide = sideFilter === 'ALL' || p.action === sideFilter;

        // Strategy filter
        const matchesStrategy = strategyFilter === 'ALL' || p.primary_strategy === strategyFilter;

        return matchesSearch && matchesStatus && matchesSide && matchesStrategy;
      })
      .sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;

        const calcRR = (p: TradeProposal) => {
          const isBuy = p.action === 'BUY';
          const entry = p.entry_price || 0;
          const sl = p.stop_loss || 0;
          const tp = p.take_profit || 0;
          const risk = isBuy ? entry - sl : sl - entry;
          const reward = isBuy ? tp - entry : entry - tp;
          return risk > 0 ? reward / risk : 0;
        };

        switch (sortBy) {
          case 'oldest':
            return timeA - timeB;
          case 'conf_desc':
            return (b.confidence_score || 0) - (a.confidence_score || 0);
          case 'conf_asc':
            return (a.confidence_score || 0) - (b.confidence_score || 0);
          case 'rr_desc':
            return calcRR(b) - calcRR(a);
          case 'rr_asc':
            return calcRR(a) - calcRR(b);
          case 'newest':
          default:
            return timeB - timeA;
        }
      });
  }, [proposals, searchTerm, statusFilter, sideFilter, strategyFilter, sortBy]);

  // Pagination slicing
  const totalItems = filteredProposals.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageProposals = filteredProposals.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);

  const isFiltered = searchTerm !== '' || statusFilter !== 'ALL' || sideFilter !== 'ALL' || strategyFilter !== 'ALL' || sortBy !== 'newest';

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSideFilter('ALL');
    setStrategyFilter('ALL');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="tpl-container">
      {/* ─── TERMINAL COMMAND / FILTER BAR ─── */}
      <div className="tpl-command-bar">
        <div className="tpl-command-bar-row">
          {/* Search Box */}
          <div className="tpl-search-box">
            <Search size={14} className="tpl-search-icon" />
            <input
              type="text"
              placeholder="Search symbol, strategy, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tpl-search-input"
              data-testid="proposals-search-input"
            />
          </div>

          {/* Status Filter */}
          <div className="tpl-filter-group">
            <span className="tpl-filter-label"><SlidersHorizontal size={12} /> Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="tpl-select"
              data-testid="proposals-status-filter"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_RISK">Pending Risk</option>
              <option value="RISK_APPROVED">Risk Approved</option>
              <option value="EXECUTED">Executed</option>
              <option value="RISK_REJECTED">Risk Rejected</option>
              <option value="EXECUTION_FAILED">Execution Failed</option>
            </select>
          </div>

          {/* Side Filter */}
          <div className="tpl-filter-group">
            <span className="tpl-filter-label">Side</span>
            <select
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value)}
              className="tpl-select"
              data-testid="proposals-side-filter"
            >
              <option value="ALL">All Sides</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          {/* Strategy Filter */}
          <div className="tpl-filter-group">
            <span className="tpl-filter-label">Strategy</span>
            <select
              value={strategyFilter}
              onChange={(e) => setStrategyFilter(e.target.value)}
              className="tpl-select"
              data-testid="proposals-strategy-filter"
            >
              <option value="ALL">All Strategies</option>
              {availableStrategies.map((strat) => (
                <option key={strat} value={strat}>
                  {strat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="tpl-filter-group">
            <span className="tpl-filter-label"><ArrowUpDown size={12} /> Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="tpl-select"
              data-testid="proposals-sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="conf_desc">Highest Confidence</option>
              <option value="conf_asc">Lowest Confidence</option>
              <option value="rr_desc">Highest R:R Ratio</option>
              <option value="rr_asc">Lowest R:R Ratio</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <button
              type="button"
              className="tpl-reset-btn"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}

          {/* New Proposal Action */}
          <button
            type="button"
            className="tpl-new-btn"
            onClick={onOpenCreate}
            data-testid="open-create-proposal-btn"
          >
            <Plus size={14} /> New Proposal
          </button>
        </div>
      </div>

      {/* ─── PROPOSAL LIST CONTENT / SKELETON / EMPTY ─── */}
      {isLoading ? (
        /* Loading Skeleton Rows */
        <div className="tpl-table-container">
          <div className="tpl-table-header">
            <span className="tpl-col-symbol">SYMBOL</span>
            <span className="tpl-col-side">SIDE</span>
            <span className="tpl-col-status">STATUS</span>
            <span className="tpl-col-price">ENTRY</span>
            <span className="tpl-col-sl">STOP LOSS</span>
            <span className="tpl-col-tp">TAKE PROFIT</span>
            <span className="tpl-col-rr">R:R</span>
            <span className="tpl-col-conf">CONF.</span>
            <span className="tpl-col-time">TIME</span>
            <span className="tpl-col-action">ACTION</span>
          </div>
          <div className="tpl-skeleton-list">
            {[1, 2, 3, 4, 5].map((key) => (
              <div key={key} className="tpl-skeleton-row">
                <div className="tpl-skeleton-pulse" style={{ width: '110px' }} />
                <div className="tpl-skeleton-pulse" style={{ width: '54px' }} />
                <div className="tpl-skeleton-pulse" style={{ width: '90px' }} />
                <div className="tpl-skeleton-pulse" style={{ width: '65px' }} />
                <div className="tpl-skeleton-pulse" style={{ width: '65px' }} />
                <div className="tpl-skeleton-pulse" style={{ width: '65px' }} />
                <div className="tpl-skeleton-pulse" style={{ width: '45px' }} />
                <div className="tpl-skeleton-pulse" style={{ width: '40px' }} />
                <div className="tpl-skeleton-pulse" style={{ width: '50px' }} />
                <div className="tpl-skeleton-pulse" style={{ width: '70px' }} />
              </div>
            ))}
          </div>
        </div>
      ) : filteredProposals.length === 0 ? (
        /* Empty State */
        <div className="tpl-empty-box" data-testid="proposals-empty-state">
          <div className="tpl-empty-icon">
            <ShieldAlert size={24} color="#3b82f6" />
          </div>
          <div>
            <h3 className="tpl-empty-title">
              {proposals.length === 0 ? 'No Trade Proposals Found' : 'No Matching Proposals'}
            </h3>
            <p className="tpl-empty-desc">
              {proposals.length === 0
                ? 'No proposals created in this session. Click "New Proposal" or generate trade setups from Live Market AI signals.'
                : 'No proposals match your search or filter criteria. Try clearing search keywords or resetting active filters.'}
            </p>
          </div>
          {isFiltered ? (
            <button type="button" className="tpl-empty-action" onClick={handleResetFilters}>
              <RotateCcw size={14} /> Clear Active Filters
            </button>
          ) : (
            <button type="button" className="tpl-empty-action" onClick={onOpenCreate}>
              <Sparkles size={14} /> Create First Proposal
            </button>
          )}
        </div>
      ) : (
        /* Dense Terminal Table List */
        <div className="tpl-table-container" data-testid="proposals-grid">
          {/* Table Column Headers */}
          <div className="tpl-table-header">
            <span className="tpl-col-symbol">SYMBOL / STRATEGY</span>
            <span className="tpl-col-side">SIDE</span>
            <span className="tpl-col-status">STATUS</span>
            <span className="tpl-col-price">ENTRY</span>
            <span className="tpl-col-sl">STOP LOSS</span>
            <span className="tpl-col-tp">TAKE PROFIT</span>
            <span className="tpl-col-rr">R:R RATIO</span>
            <span className="tpl-col-conf">AI CONF.</span>
            <span className="tpl-col-time">TIME</span>
            <span className="tpl-col-action">ACTION</span>
          </div>

          {/* Proposal Rows */}
          <div className="tpl-rows-wrap">
            <AnimatePresence mode="popLayout">
              {pageProposals.map((proposal, idx) => (
                <ProposalRow
                  key={proposal.id}
                  proposal={proposal}
                  onReview={onReview}
                  index={idx}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* ─── PAGINATION BAR ─── */}
          <div className="tpl-pagination-bar">
            <div className="tpl-pagination-info">
              Showing <strong>{totalItems === 0 ? 0 : startIdx + 1}–{endIdx}</strong> of <strong>{totalItems}</strong> proposals
            </div>

            {totalPages > 1 && (
              <div className="tpl-pagination-controls">
                <button
                  type="button"
                  className="tpl-page-nav-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} /> Prev
                </button>

                <div className="tpl-page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`tpl-page-num ${pageNum === currentPage ? 'active' : ''}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="tpl-page-nav-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
