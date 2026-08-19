import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PaperPositionsPage } from '../pages/PaperPositionsPage';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { useUserStore } from '@/stores/userStore';

vi.mock('@/stores/usePortfolioStore', () => ({
  usePortfolioStore: vi.fn(),
}));

vi.mock('@/stores/userStore', () => ({
  useUserStore: vi.fn(),
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
  username: 'testtrader',
};

const mockPortfolio = {
  id: 'port-999',
  name: 'My Paper Portfolio',
  holdings: [
    { symbol: 'TSLA', price: 336.87, currency: 'USD' },
    { symbol: 'HCLTECH.NS', price: 1324.80, currency: 'INR' },
  ],
  positions: [
    { id: 'pos-1', symbol: 'TSLA', quantity: 10, average_entry_price: 336.87 },
    { id: 'pos-2', symbol: 'HCLTECH.NS', quantity: 10, average_entry_price: 1311.00 },
  ],
};

describe('PaperPositionsPage', () => {
  const fetchPortfolioMock = vi.fn();

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

    mockStore(usePortfolioStore, {
      portfolio: mockPortfolio,
      isLoading: false,
      fetchPortfolio: fetchPortfolioMock,
    });
  });

  it('renders page header, metadata, summary strip, and paper positions list', () => {
    render(
      <MemoryRouter>
        <PaperPositionsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('PAPER POSITIONS')).toBeInTheDocument();
    expect(screen.getByText('2 positions')).toBeInTheDocument();
    expect(screen.getByTestId('positions-list-table')).toBeInTheDocument();
    expect(screen.getByTestId('position-row-TSLA')).toBeInTheDocument();
    expect(screen.getByTestId('position-row-HCLTECH.NS')).toBeInTheDocument();
  });

  it('filters positions by search input', () => {
    render(
      <MemoryRouter>
        <PaperPositionsPage />
      </MemoryRouter>,
    );

    const searchInput = screen.getByTestId('positions-search-input');
    fireEvent.change(searchInput, { target: { value: 'TSLA' } });

    expect(screen.getByTestId('position-row-TSLA')).toBeInTheDocument();
    expect(screen.queryByTestId('position-row-HCLTECH.NS')).not.toBeInTheDocument();
  });

  it('navigates to position details when View Details button is clicked', () => {
    render(
      <MemoryRouter>
        <PaperPositionsPage />
      </MemoryRouter>,
    );

    const viewBtn = screen.getByTestId('view-position-btn-TSLA');
    fireEvent.click(viewBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/portfolio/positions/TSLA');
  });

  it('navigates back to dashboard when Back to Portfolio is clicked', () => {
    render(
      <MemoryRouter>
        <PaperPositionsPage />
      </MemoryRouter>,
    );

    const backBtn = screen.getByTestId('back-to-dashboard-btn');
    fireEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
