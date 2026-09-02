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
    });
    useUserStore.setState({
      user: { id: 'user-123', email: 'test@example.com', username: 'testuser', role: 'user', is_active: true, is_verified: true, created_at: '2026-09-02', updated_at: '2026-09-02' },
      accessToken: 'mock-access-token',
    });
  });

  it('A. Existing portfolio: GET /portfolio -> 200 populates portfolio state', async () => {
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

  it('B. New user: GET /portfolio -> 404 calls createPortfolio("My Paper Portfolio") and populates state', async () => {
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

  it('C. Missing token / unauthenticated: skips API request to GET /portfolio', async () => {
    useUserStore.setState({ user: null, accessToken: null });

    await usePortfolioStore.getState().fetchPortfolio();

    expect(portfolioService.getPortfolio).not.toHaveBeenCalled();
    expect(portfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState().portfolio).toBeNull();
    expect(usePortfolioStore.getState().isLoading).toBe(false);
  });

  it('D. Forbidden: 403 error does NOT attempt to create portfolio', async () => {
    vi.mocked(portfolioService.getPortfolio).mockRejectedValueOnce({
      response: { status: 403, data: { detail: 'Forbidden access' } },
    });

    await usePortfolioStore.getState().fetchPortfolio();

    expect(portfolioService.getPortfolio).toHaveBeenCalledTimes(1);
    expect(portfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState().error).toBe('Forbidden access');
    expect(usePortfolioStore.getState().isLoading).toBe(false);
  });

  it('E. Server failure: 500 error does NOT attempt to create portfolio', async () => {
    vi.mocked(portfolioService.getPortfolio).mockRejectedValueOnce({
      response: { status: 500, data: { detail: 'Internal server error' } },
    });

    await usePortfolioStore.getState().fetchPortfolio();

    expect(portfolioService.getPortfolio).toHaveBeenCalledTimes(1);
    expect(portfolioService.createPortfolio).not.toHaveBeenCalled();
    expect(usePortfolioStore.getState().error).toBe('Internal server error');
    expect(usePortfolioStore.getState().isLoading).toBe(false);
  });

  it('F. Duplicate creation protection: repeated 404 calls do NOT create multiple portfolios', async () => {
    vi.mocked(portfolioService.getPortfolio).mockRejectedValue({
      response: { status: 404, data: { detail: 'Portfolio not found' } },
    });
    vi.mocked(portfolioService.createPortfolio).mockRejectedValueOnce({
      response: { status: 500, data: { detail: 'Creation failed' } },
    });

    await usePortfolioStore.getState().fetchPortfolio();
    expect(portfolioService.createPortfolio).toHaveBeenCalledTimes(1);

    // Second call with hasAttemptedAutoCreate set to true
    await usePortfolioStore.getState().fetchPortfolio();
    expect(portfolioService.createPortfolio).toHaveBeenCalledTimes(1);
  });
});
