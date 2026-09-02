import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { portfolioService } from '@/services/portfolio.service';
import { useUserStore } from '@/stores/userStore';

vi.mock('@/services/portfolio.service');

describe('usePortfolioStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePortfolioStore.setState({
      portfolio: null,
      isLoading: false,
      isSubmitting: false,
      error: null,
      hasAttemptedAutoCreate: false,
      modal: {
        isOpen: false,
        mode: 'add',
        symbol: '',
        price: null,
        exchange: 'US Market',
      },
      toast: {
        isOpen: false,
        type: 'success',
        title: '',
        symbol: '',
        message: '',
        currentUsage: 0,
      },
    });
    useUserStore.setState({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        is_active: true,
        is_verified: true,
        created_at: '2026-09-02',
        updated_at: '2026-09-02',
      },
      accessToken: 'mock-access-token',
    });
  });

  it('fetchPortfolio A. Existing portfolio: GET /portfolio -> 200 populates portfolio state', async () => {
    const mockPortfolio = {
      id: 'port-1',
      name: 'Existing Portfolio',
      created_at: '2026-09-02',
      updated_at: '2026-09-02',
      holdings: [],
    };
    vi.mocked(portfolioService.getPortfolio).mockResolvedValueOnce(mockPortfolio);

    await usePortfolioStore.getState().fetchPortfolio();

    expect(portfolioService.getPortfolio).toHaveBeenCalledTimes(1);
    expect(usePortfolioStore.getState().portfolio).toEqual(mockPortfolio);
    expect(usePortfolioStore.getState().isLoading).toBe(false);
  });

  it('fetchPortfolio B. New user: GET /portfolio -> 404 calls createPortfolio("My Paper Portfolio") and populates state', async () => {
    vi.mocked(portfolioService.getPortfolio).mockRejectedValueOnce({
      response: { status: 404, data: { detail: 'Portfolio not found' } },
    });
    const newPortfolio = {
      id: 'port-new',
      name: 'My Paper Portfolio',
      created_at: '2026-09-02',
      updated_at: '2026-09-02',
      holdings: [],
    };
    vi.mocked(portfolioService.createPortfolio).mockResolvedValueOnce(newPortfolio);

    await usePortfolioStore.getState().fetchPortfolio();

    expect(portfolioService.getPortfolio).toHaveBeenCalledTimes(1);
    expect(portfolioService.createPortfolio).toHaveBeenCalledWith('My Paper Portfolio');
    expect(usePortfolioStore.getState().portfolio).toEqual(newPortfolio);
    expect(usePortfolioStore.getState().isLoading).toBe(false);
  });

  // --- confirmAction() ADD STOCK TEST CASES ---

  it('confirmAction A. Existing portfolio: addHolding -> 200 success without calling createPortfolio', async () => {
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'RELIANCE.NS', price: 1313, exchange: 'NSE' },
      portfolio: { id: 'port-1', name: 'Existing', created_at: '', updated_at: '', holdings: [] },
    });
    const addedHolding = { id: 'h-1', symbol: 'RELIANCE.NS', created_at: '' };
    vi.mocked(portfolioService.addHolding).mockResolvedValueOnce(addedHolding);

    await usePortfolioStore.getState().confirmAction();

    expect(portfolioService.addHolding).toHaveBeenCalledTimes(1);
    expect(portfolioService.addHolding).toHaveBeenCalledWith('RELIANCE.NS');
    expect(portfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState().portfolio?.holdings).toContainEqual(addedHolding);
    expect(usePortfolioStore.getState().toast.type).toBe('success');
  });

  it('confirmAction B. Missing portfolio: addHolding -> 404 -> createPortfolio("My Paper Portfolio") -> retry addHolding -> 200 success', async () => {
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'RELIANCE.NS', price: 1313, exchange: 'NSE' },
      portfolio: null,
    });
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 404, data: { detail: 'Portfolio not found' } },
    });
    const newPortfolio = { id: 'port-new', name: 'My Paper Portfolio', created_at: '', updated_at: '', holdings: [] };
    vi.mocked(portfolioService.createPortfolio).mockResolvedValueOnce(newPortfolio);
    const addedHolding = { id: 'h-1', symbol: 'RELIANCE.NS', created_at: '' };
    vi.mocked(portfolioService.addHolding).mockResolvedValueOnce(addedHolding);

    await usePortfolioStore.getState().confirmAction();

    expect(portfolioService.addHolding).toHaveBeenCalledTimes(2);
    expect(portfolioService.createPortfolio).toHaveBeenCalledWith('My Paper Portfolio');
    expect(usePortfolioStore.getState().portfolio?.holdings).toContainEqual(addedHolding);
    expect(usePortfolioStore.getState().toast.type).toBe('success');
  });

  it('confirmAction C. Missing portfolio but create fails: addHolding -> 404 -> createPortfolio fails -> resets hasAttemptedAutoCreate to false allowing future retry', async () => {
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'RELIANCE.NS', price: 1313, exchange: 'NSE' },
      portfolio: null,
      hasAttemptedAutoCreate: false,
    });
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 404, data: { detail: 'Portfolio not found' } },
    });
    vi.mocked(portfolioService.createPortfolio).mockRejectedValueOnce({
      response: { status: 500, data: { detail: 'Database error creating portfolio' } },
    });

    await usePortfolioStore.getState().confirmAction();

    expect(portfolioService.addHolding).toHaveBeenCalledTimes(1);
    expect(portfolioService.createPortfolio).toHaveBeenCalledWith('My Paper Portfolio');
    expect(usePortfolioStore.getState().toast.type).toBe('error');
    expect(usePortfolioStore.getState().toast.message).toBe('Database error creating portfolio');
    // Verify flag was reset to false after creation failure
    expect(usePortfolioStore.getState().hasAttemptedAutoCreate).toBe(false);

    // Second attempt after transient failure succeeds
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'RELIANCE.NS', price: 1313, exchange: 'NSE' },
    });
    const newPortfolio = { id: 'port-new', name: 'My Paper Portfolio', created_at: '', updated_at: '', holdings: [] };
    const addedHolding = { id: 'h-1', symbol: 'RELIANCE.NS', created_at: '' };
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 404, data: { detail: 'Portfolio not found' } },
    });
    vi.mocked(portfolioService.createPortfolio).mockResolvedValueOnce(newPortfolio);
    vi.mocked(portfolioService.addHolding).mockResolvedValueOnce(addedHolding);

    await usePortfolioStore.getState().confirmAction();
    expect(portfolioService.createPortfolio).toHaveBeenCalledTimes(2);
    expect(usePortfolioStore.getState().toast.type).toBe('success');
  });

  it('confirmAction D. Missing portfolio but retry fails: addHolding -> 404 -> createPortfolio succeeds -> retry addHolding -> 400 error', async () => {
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'INVALID', price: 0, exchange: 'NSE' },
      portfolio: null,
    });
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 404, data: { detail: 'Portfolio not found' } },
    });
    const newPortfolio = { id: 'port-new', name: 'My Paper Portfolio', created_at: '', updated_at: '', holdings: [] };
    vi.mocked(portfolioService.createPortfolio).mockResolvedValueOnce(newPortfolio);
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 400, data: { detail: "Invalid or unsupported stock symbol 'INVALID'" } },
    });

    await usePortfolioStore.getState().confirmAction();

    expect(portfolioService.addHolding).toHaveBeenCalledTimes(2);
    expect(portfolioService.createPortfolio).toHaveBeenCalledWith('My Paper Portfolio');
    expect(usePortfolioStore.getState().toast.type).toBe('error');
    expect(usePortfolioStore.getState().toast.message).toBe("Invalid or unsupported stock symbol 'INVALID'");
  });

  it('confirmAction E. 401 Unauthorized: addHolding -> 401 -> createPortfolio NOT called', async () => {
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'RELIANCE.NS', price: 1313, exchange: 'NSE' },
    });
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 401, data: { detail: 'Could not validate credentials' } },
    });

    await usePortfolioStore.getState().confirmAction();

    expect(portfolioService.addHolding).toHaveBeenCalledTimes(1);
    expect(portfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState().toast.type).toBe('error');
    expect(usePortfolioStore.getState().toast.message).toBe('Could not validate credentials');
  });

  it('confirmAction F. 403 Forbidden: addHolding -> 403 -> createPortfolio NOT called', async () => {
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'RELIANCE.NS', price: 1313, exchange: 'NSE' },
    });
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 403, data: { detail: 'You do not own this portfolio' } },
    });

    await usePortfolioStore.getState().confirmAction();

    expect(portfolioService.addHolding).toHaveBeenCalledTimes(1);
    expect(portfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState().toast.type).toBe('error');
  });

  it('confirmAction G. 409 Conflict (Duplicate): addHolding -> 409 -> createPortfolio NOT called', async () => {
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'RELIANCE.NS', price: 1313, exchange: 'NSE' },
    });
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 409, data: { detail: 'Stock symbol already exists in portfolio' } },
    });

    await usePortfolioStore.getState().confirmAction();

    expect(portfolioService.addHolding).toHaveBeenCalledTimes(1);
    expect(portfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState().toast.type).toBe('error');
    expect(usePortfolioStore.getState().toast.message).toBe('Stock symbol already exists in portfolio');
  });

  it('confirmAction H. 400 Bad Request (Limit): addHolding -> 400 -> createPortfolio NOT called', async () => {
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'RELIANCE.NS', price: 1313, exchange: 'NSE' },
    });
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 400, data: { detail: 'Portfolio cannot contain more than 5 stocks' } },
    });

    await usePortfolioStore.getState().confirmAction();

    expect(portfolioService.addHolding).toHaveBeenCalledTimes(1);
    expect(portfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState().toast.type).toBe('error');
    expect(usePortfolioStore.getState().toast.message).toBe('Portfolio cannot contain more than 5 stocks');
  });

  it('confirmAction I. 500 Server Error: addHolding -> 500 -> createPortfolio NOT called', async () => {
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'RELIANCE.NS', price: 1313, exchange: 'NSE' },
    });
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 500, data: { detail: 'Internal server error' } },
    });

    await usePortfolioStore.getState().confirmAction();

    expect(portfolioService.addHolding).toHaveBeenCalledTimes(1);
    expect(portfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState().toast.type).toBe('error');
    expect(usePortfolioStore.getState().toast.message).toBe('Internal server error');
  });

  it('confirmAction J. Idempotency: repeated 404 calls do NOT create duplicate portfolios', async () => {
    usePortfolioStore.setState({
      modal: { isOpen: true, mode: 'add', symbol: 'RELIANCE.NS', price: 1313, exchange: 'NSE' },
      hasAttemptedAutoCreate: true,
    });
    vi.mocked(portfolioService.addHolding).mockRejectedValueOnce({
      response: { status: 404, data: { detail: 'Portfolio not found' } },
    });

    await usePortfolioStore.getState().confirmAction();

    expect(portfolioService.addHolding).toHaveBeenCalledTimes(1);
    expect(portfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState().toast.type).toBe('error');
  });
});
