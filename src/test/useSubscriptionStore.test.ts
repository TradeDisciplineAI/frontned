import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { authService } from '@/features/auth/auth.service';

vi.mock('@/features/auth/auth.service', () => ({
  authService: {
    getSubscriptionStatus: vi.fn(),
    subscribeToPro: vi.fn(),
  },
}));

describe('useSubscriptionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSubscriptionStore.setState({
      status: null,
      isLoading: false,
      isUpgrading: false,
      isPaywallOpen: false,
      paywallReason: null,
      error: null,
    });
  });

  it('should initialize with default state', () => {
    const state = useSubscriptionStore.getState();
    expect(state.status).toBeNull();
    expect(state.isPaywallOpen).toBe(false);
  });

  it('should open and close paywall modal with reason', () => {
    useSubscriptionStore.getState().openPaywall('trade_limit');
    let state = useSubscriptionStore.getState();
    expect(state.isPaywallOpen).toBe(true);
    expect(state.paywallReason).toBe('trade_limit');

    useSubscriptionStore.getState().closePaywall();
    state = useSubscriptionStore.getState();
    expect(state.isPaywallOpen).toBe(false);
    expect(state.paywallReason).toBeNull();
  });

  it('should fetch subscription status successfully', async () => {
    const mockStatus = {
      user_id: 'usr-123',
      username: 'trader1',
      subscription_tier: 'FREE',
      trades_count: 4,
      max_free_trades: 6,
      remaining_free_trades: 2,
      is_pro: false,
    };

    vi.mocked(authService.getSubscriptionStatus).mockResolvedValueOnce(mockStatus as any);

    await useSubscriptionStore.getState().fetchSubscriptionStatus();

    const state = useSubscriptionStore.getState();
    expect(state.status).toEqual(mockStatus);
    expect(state.isLoading).toBe(false);
  });

  it('should upgrade to pro successfully', async () => {
    const mockProStatus = {
      user_id: 'usr-123',
      username: 'trader1',
      subscription_tier: 'PRO',
      trades_count: 4,
      max_free_trades: 6,
      remaining_free_trades: 999999,
      is_pro: true,
    };

    vi.mocked(authService.subscribeToPro).mockResolvedValueOnce({} as any);
    vi.mocked(authService.getSubscriptionStatus).mockResolvedValueOnce(mockProStatus as any);

    useSubscriptionStore.setState({ isPaywallOpen: true, paywallReason: 'trade_limit' });

    const success = await useSubscriptionStore.getState().upgradeToPro('tok_test', 'annual');

    expect(success).toBe(true);
    const state = useSubscriptionStore.getState();
    expect(state.status?.is_pro).toBe(true);
  });

  it('should upgrade to pro successfully even if status refresh rejects', async () => {
    vi.mocked(authService.subscribeToPro).mockResolvedValueOnce({} as any);
    vi.mocked(authService.getSubscriptionStatus).mockRejectedValueOnce(new Error('Network error'));

    useSubscriptionStore.setState({ isPaywallOpen: true, paywallReason: 'trade_limit' });

    const success = await useSubscriptionStore.getState().upgradeToPro('tok_test', 'annual');

    expect(success).toBe(true);
    const state = useSubscriptionStore.getState();
    expect(state.isUpgrading).toBe(false);
  });
});
