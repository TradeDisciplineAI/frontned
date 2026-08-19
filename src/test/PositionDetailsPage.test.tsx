import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PositionDetailsPage } from '../pages/PositionDetailsPage';
import { PortfolioView } from '../components/PortfolioView';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { useUserStore } from '@/stores/userStore';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import type { TradeProposal } from '@/types/tradeProposal.types';

// Mock Zustand stores
vi.mock('@/stores/useTradeProposalStore', () => ({
  useTradeProposalStore: vi.fn(),
}));

vi.mock('@/stores/userStore', () => ({
  useUserStore: vi.fn(),
}));

vi.mock('@/stores/usePortfolioStore', () => ({
  usePortfolioStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUser = {
  id: 'user-001',
  username: 'testuser',
};

const mockPortfolio = {
  id: 'port-123',
  name: 'My Paper Portfolio',
  holdings: [
    {
      id: 'h-1',
      symbol: 'HCLTECH.NS',
      price: 1319.10,
      percent_change: 0.62,
      currency: 'INR',
    },
  ],
  positions: [
    {
      id: 'pos-1',
      portfolio_id: 'port-123',
      symbol: 'HCLTECH.NS',
      quantity: 10,
      average_entry_price: 1311.00,
      created_at: '2026-08-18T10:00:00Z',
      updated_at: '2026-08-18T10:00:00Z',
    },
  ],
};

const mockExecutedProposal: TradeProposal = {
  id: 'prop-abc',
  user_id: 'user-001',
  portfolio_id: 'port-123',
  symbol: 'HCLTECH.NS',
  action: 'BUY',
  requested_quantity: 10,
  entry_price: 1310.90, // Proposal Entry Price
  stop_loss: 1300.00,
  take_profit: 1335.00,
  confidence_score: 0.85,
  primary_strategy: 'EMACrossover',
  status: 'EXECUTED',
  created_at: '2026-08-18T09:59:00Z',
  updated_at: '2026-08-18T10:00:00Z',
};

describe('PositionDetailsPage & Portfolio Refactoring Tests', () => {
  const fetchPortfolioMock = vi.fn();
  const fetchProposalsMock = vi.fn();
  const triggerRemoveHoldingMock = vi.fn();

  const mockStore = (store: any, state: any) => {
    store.mockImplementation((selector?: any) => {
      if (typeof selector === 'function') return selector(state);
      return state;
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    mockStore(useUserStore, {
      user: mockUser,
      logout: vi.fn(),
    });

    mockStore(usePortfolioStore, {
      portfolio: mockPortfolio,
      isLoading: false,
      fetchPortfolio: fetchPortfolioMock,
      triggerRemoveHolding: triggerRemoveHoldingMock,
    });

    mockStore(useTradeProposalStore, {
      proposals: [mockExecutedProposal],
      isLoading: false,
      fetchProposals: fetchProposalsMock,
      isCreateModalOpen: false,
      isReviewModalOpen: false,
      draftProposal: null,
      openCreateModal: vi.fn(),
      closeCreateModal: vi.fn(),
      closeReviewModal: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('renders Portfolio position summary card with correct details', () => {
    render(
      <MemoryRouter>
        <PortfolioView />
      </MemoryRouter>,
    );

    // Verify card rendering
    expect(screen.getAllByText('HCLTECH.NS')[0]).toBeInTheDocument();
    expect(screen.getAllByText('PAPER')[0]).toBeInTheDocument();
    expect(screen.getByText('10 shares')).toBeInTheDocument();

    // Verify compact summary metrics are displayed with new labels
    expect(screen.getByText(/Avg Entry/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1311.00/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Current/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1319.10/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Value/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/13191.00/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/P&L/i)).toBeInTheDocument();
    expect(screen.getAllByText(/81.00/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/0.62%/i)[0]).toBeInTheDocument();

    // Accordion details should not exist
    expect(screen.queryByText(/Hide Details/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Show Details/i)).not.toBeInTheDocument();
  });

  it('navigates to details view when position card is clicked', () => {
    render(
      <MemoryRouter>
        <PortfolioView />
      </MemoryRouter>,
    );

    const card = screen.getByTestId('position-card-HCLTECH.NS');
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/portfolio/positions/HCLTECH.NS');
  });

  it('renders PositionDetailsPage elements correctly', () => {
    render(
      <MemoryRouter initialEntries={['/portfolio/positions/HCLTECH.NS']}>
        <Routes>
          <Route path="/portfolio/positions/:symbol" element={<PositionDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Header metrics
    expect(screen.getByTestId('position-symbol')).toHaveTextContent('HCLTECH.NS');
    expect(screen.getByTestId('position-quantity')).toHaveTextContent('10 shares held');
    expect(screen.getByTestId('current-position-value')).toHaveTextContent('₹13191.00');
    expect(screen.getByTestId('unrealized-pnl-header')).toHaveTextContent('+₹81.00(+0.62%)');

    // Position Details Card
    expect(screen.getByTestId('detail-average-entry')).toHaveTextContent('₹1311.00');
    expect(screen.getByTestId('detail-current-price')).toHaveTextContent('₹1319.10');
    expect(screen.getByTestId('detail-quantity')).toHaveTextContent('10 shares');
    expect(screen.getByTestId('detail-position-value')).toHaveTextContent('₹13191.00');

    // Performance Card
    expect(screen.getByTestId('detail-cost-basis')).toHaveTextContent('₹13110.00');
    expect(screen.getByTestId('detail-current-value')).toHaveTextContent('₹13191.00');
    expect(screen.getByTestId('detail-unrealized-pnl')).toHaveTextContent('+₹81.00');
    expect(screen.getByTestId('detail-return-percent')).toHaveTextContent('+0.62%');

    // Risk Management Card
    expect(screen.getByTestId('detail-stop-loss')).toHaveTextContent('₹1300.00');
    expect(screen.getByTestId('detail-take-profit')).toHaveTextContent('₹1335.00');
    expect(screen.getByTestId('detail-risk-per-share')).toHaveTextContent('₹11.00');
    expect(screen.getByTestId('detail-potential-reward')).toHaveTextContent('₹24.00');
    expect(screen.getByTestId('detail-risk-reward-ratio')).toHaveTextContent('2.18');

    // Strategy Details Card
    expect(screen.getByTestId('detail-primary-strategy')).toHaveTextContent('EMACrossover');
    expect(screen.getByTestId('detail-ai-confidence')).toHaveTextContent('85%');
    expect(screen.getByTestId('detail-strategy-rationale')).toBeInTheDocument();

    // Execution Details Logs
    expect(screen.getByTestId('exec-action-0')).toHaveTextContent('BUY');
    expect(screen.getByTestId('exec-quantity-0')).toHaveTextContent('10 / 10 shares');
    expect(screen.getByTestId('exec-proposal-price-0')).toHaveTextContent('₹1310.90'); // Proposal Entry Price
    expect(screen.getByTestId('exec-execution-price-0')).toHaveTextContent('₹1311.00'); // Execution price (pos average_entry)
    expect(screen.getByTestId('exec-id-0')).toHaveTextContent('Execution ID: EXE-PROP-ABC');
  });

  it('handles invalid or missing symbol routing gracefully', () => {
    render(
      <MemoryRouter initialEntries={['/portfolio/positions/INVALID']}>
        <Routes>
          <Route path="/portfolio/positions/:symbol" element={<PositionDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Position Not Found')).toBeInTheDocument();
    expect(screen.getByText(/No active paper position found for symbol: INVALID/i)).toBeInTheDocument();
  });
});
