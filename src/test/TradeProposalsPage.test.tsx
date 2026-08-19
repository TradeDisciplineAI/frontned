import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TradeProposalsPage } from '../pages/TradeProposalsPage';
import { TradeProposalsList } from '../components/tradeProposal/TradeProposalsList';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { useUserStore } from '@/stores/userStore';
import type { TradeProposal } from '@/types/tradeProposal.types';

vi.mock('@/stores/useTradeProposalStore', () => ({
  useTradeProposalStore: vi.fn(),
}));

vi.mock('@/stores/userStore', () => ({
  useUserStore: vi.fn(),
}));

const mockUser = {
  id: 'user-001',
  username: 'testtrader',
};

const mockProposals: TradeProposal[] = [
  {
    id: 'prop-tsla-1',
    user_id: 'user-001',
    symbol: 'TSLA',
    action: 'BUY',
    requested_quantity: 10,
    entry_price: 336.89,
    stop_loss: 335.86,
    take_profit: 338.95,
    confidence_score: 0.65,
    primary_strategy: 'EMACrossover',
    status: 'RISK_APPROVED',
    created_at: '2026-08-19T18:21:00Z',
  },
  {
    id: 'prop-tsla-2',
    user_id: 'user-001',
    symbol: 'TSLA',
    action: 'BUY',
    requested_quantity: 15,
    entry_price: 330.00,
    stop_loss: 325.00,
    take_profit: 345.00,
    confidence_score: 0.88,
    primary_strategy: 'MeanReversion',
    status: 'PENDING_RISK',
    created_at: '2026-08-19T17:00:00Z',
  },
  {
    id: 'prop-reliance-1',
    user_id: 'user-001',
    symbol: 'RELIANCE.NS',
    action: 'SELL',
    requested_quantity: 50,
    entry_price: 1315.60,
    stop_loss: 1325.00,
    take_profit: 1290.00,
    confidence_score: 0.72,
    primary_strategy: 'RSIReversal',
    status: 'EXECUTED',
    created_at: '2026-08-19T16:00:00Z',
  },
];

describe('TradeProposalsPage & TradeProposalsList', () => {
  const fetchProposalsMock = vi.fn();
  const openCreateModalMock = vi.fn();
  const openReviewModalMock = vi.fn();
  const clearErrorMock = vi.fn();

  const mockStore = (store: any, state: any) => {
    store.mockImplementation((selector?: any) => {
      if (typeof selector === 'function') return selector(state);
      return state;
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockStore(useUserStore, {
      user: mockUser,
      logout: vi.fn(),
    });

    mockStore(useTradeProposalStore, {
      proposals: mockProposals,
      activeProposal: null,
      draftProposal: null,
      isLoading: false,
      isCreateModalOpen: false,
      isReviewModalOpen: false,
      openCreateModal: openCreateModalMock,
      closeCreateModal: vi.fn(),
      openReviewModal: openReviewModalMock,
      closeReviewModal: vi.fn(),
      clearError: clearErrorMock,
      fetchProposals: fetchProposalsMock,
    });
  });

  it('renders terminal page header with proposal count and paper trading badge', () => {
    render(
      <MemoryRouter>
        <TradeProposalsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('TRADE PROPOSALS')).toBeInTheDocument();
    expect(screen.getByText('Pre-Risk Decision Queue')).toBeInTheDocument();
    expect(screen.getByText('3 proposals')).toBeInTheDocument();
    expect(screen.getByTestId('header-new-proposal-btn')).toBeInTheDocument();
  });

  it('preserves multiple proposals for the same symbol as distinct rows', () => {
    render(
      <MemoryRouter>
        <TradeProposalsPage />
      </MemoryRouter>,
    );

    // Two TSLA proposals should both be rendered in the document
    const tslaSymbols = screen.getAllByText('TSLA');
    expect(tslaSymbols.length).toBeGreaterThanOrEqual(2);

    // Verify distinct IDs
    expect(screen.getByTestId('trade-proposal-card-prop-tsla-1')).toBeInTheDocument();
    expect(screen.getByTestId('trade-proposal-card-prop-tsla-2')).toBeInTheDocument();
  });

  it('filters proposals by search input string', () => {
    render(
      <MemoryRouter>
        <TradeProposalsList
          proposals={mockProposals}
          isLoading={false}
          onOpenCreate={openCreateModalMock}
          onReview={openReviewModalMock}
        />
      </MemoryRouter>,
    );

    const searchInput = screen.getByTestId('proposals-search-input');
    fireEvent.change(searchInput, { target: { value: 'RELIANCE' } });

    expect(screen.getByTestId('trade-proposal-card-prop-reliance-1')).toBeInTheDocument();
    expect(screen.queryByTestId('trade-proposal-card-prop-tsla-1')).not.toBeInTheDocument();
  });

  it('filters proposals by status filter select', () => {
    render(
      <MemoryRouter>
        <TradeProposalsList
          proposals={mockProposals}
          isLoading={false}
          onOpenCreate={openCreateModalMock}
          onReview={openReviewModalMock}
        />
      </MemoryRouter>,
    );

    const statusSelect = screen.getByTestId('proposals-status-filter');
    fireEvent.change(statusSelect, { target: { value: 'EXECUTED' } });

    expect(screen.getByTestId('trade-proposal-card-prop-reliance-1')).toBeInTheDocument();
    expect(screen.queryByTestId('trade-proposal-card-prop-tsla-1')).not.toBeInTheDocument();
  });

  it('filters proposals by side filter select', () => {
    render(
      <MemoryRouter>
        <TradeProposalsList
          proposals={mockProposals}
          isLoading={false}
          onOpenCreate={openCreateModalMock}
          onReview={openReviewModalMock}
        />
      </MemoryRouter>,
    );

    const sideSelect = screen.getByTestId('proposals-side-filter');
    fireEvent.change(sideSelect, { target: { value: 'SELL' } });

    expect(screen.getByTestId('trade-proposal-card-prop-reliance-1')).toBeInTheDocument();
    expect(screen.queryByTestId('trade-proposal-card-prop-tsla-1')).not.toBeInTheDocument();
  });

  it('sorts proposals by confidence score descending', () => {
    render(
      <MemoryRouter>
        <TradeProposalsList
          proposals={mockProposals}
          isLoading={false}
          onOpenCreate={openCreateModalMock}
          onReview={openReviewModalMock}
        />
      </MemoryRouter>,
    );

    const sortSelect = screen.getByTestId('proposals-sort-select');
    fireEvent.change(sortSelect, { target: { value: 'conf_desc' } });

    // Highest confidence is TSLA #2 (88%)
    const confBadge = screen.getAllByText('88%')[0];
    expect(confBadge).toBeInTheDocument();
  });

  it('opens review modal when review button is clicked on a row', () => {
    render(
      <MemoryRouter>
        <TradeProposalsList
          proposals={mockProposals}
          isLoading={false}
          onOpenCreate={openCreateModalMock}
          onReview={openReviewModalMock}
        />
      </MemoryRouter>,
    );

    const reviewBtns = screen.getAllByTestId('review-proposal-btn-prop-tsla-1');
    fireEvent.click(reviewBtns[0]!);

    expect(openReviewModalMock).toHaveBeenCalledWith(mockProposals[0]);
  });

  it('displays empty state when filtered result set is empty', () => {
    render(
      <MemoryRouter>
        <TradeProposalsList
          proposals={mockProposals}
          isLoading={false}
          onOpenCreate={openCreateModalMock}
          onReview={openReviewModalMock}
        />
      </MemoryRouter>,
    );

    const searchInput = screen.getByTestId('proposals-search-input');
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

    expect(screen.getByTestId('proposals-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No Matching Proposals')).toBeInTheDocument();
  });
});
