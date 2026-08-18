import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { tradeProposalService } from '@/services/tradeProposal.service';
import type { TradeProposal } from '@/types/tradeProposal.types';

vi.mock('@/services/tradeProposal.service', () => ({
  tradeProposalService: {
    createProposal: vi.fn(),
    getProposalById: vi.fn(),
    getProposals: vi.fn(),
  },
}));

describe('useTradeProposalStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTradeProposalStore.setState({
      proposals: [],
      activeProposal: null,
      draftProposal: null,
      isLoading: false,
      isSubmitting: false,
      error: null,
      isCreateModalOpen: false,
      isReviewModalOpen: false,
    });
  });

  it('creates proposal via POST and fetches via GET, opening review modal automatically on success', async () => {
    const mockCreatedProposal: TradeProposal = {
      id: 'prop-999',
      symbol: 'NVDA',
      action: 'BUY',
      requested_quantity: 20,
      entry_price: 120,
      stop_loss: 110,
      take_profit: 150,
      confidence_score: 0.92,
      primary_strategy: 'AI Momentum',
      status: 'PENDING_RISK',
    };

    vi.mocked(tradeProposalService.createProposal).mockResolvedValueOnce(mockCreatedProposal);
    vi.mocked(tradeProposalService.getProposalById).mockResolvedValueOnce(mockCreatedProposal);

    const store = useTradeProposalStore.getState();
    const result = await store.createProposal({
      symbol: 'NVDA',
      action: 'BUY',
      requested_quantity: 20,
      entry_price: 120,
      stop_loss: 110,
      take_profit: 150,
    });

    expect(tradeProposalService.createProposal).toHaveBeenCalled();
    expect(tradeProposalService.getProposalById).toHaveBeenCalledWith('prop-999');
    expect(result).toEqual(mockCreatedProposal);

    const updatedState = useTradeProposalStore.getState();
    expect(updatedState.proposals).toHaveLength(1);
    expect(updatedState.activeProposal).toEqual(mockCreatedProposal);
    expect(updatedState.isCreateModalOpen).toBe(false);
    expect(updatedState.isReviewModalOpen).toBe(true);
  });

  it('sets error on createProposal failure', async () => {
    vi.mocked(tradeProposalService.createProposal).mockRejectedValueOnce({
      response: { data: { detail: 'Invalid parameters for proposal' } },
    });

    const store = useTradeProposalStore.getState();
    const result = await store.createProposal({
      symbol: 'INVALID',
      action: 'BUY',
      requested_quantity: 0,
      entry_price: -5,
      stop_loss: 0,
      take_profit: 0,
    });

    expect(result).toBeNull();
    const updatedState = useTradeProposalStore.getState();
    expect(updatedState.error).toBe('Invalid parameters for proposal');
    expect(updatedState.isSubmitting).toBe(false);
  });

  it('fetches proposal by ID and stores activeProposal with PENDING_RISK status', async () => {
    const mockProposal: TradeProposal = {
      id: 'prop-777',
      symbol: 'MSFT',
      action: 'BUY',
      requested_quantity: 15,
      entry_price: 400,
      stop_loss: 385,
      take_profit: 440,
      confidence_score: 0.88,
      primary_strategy: 'Cloud Trend',
      status: 'PENDING_RISK',
    };

    vi.mocked(tradeProposalService.getProposalById).mockResolvedValueOnce(mockProposal);

    const store = useTradeProposalStore.getState();
    const result = await store.fetchProposalById('prop-777');

    expect(result).toEqual(mockProposal);
    const updatedState = useTradeProposalStore.getState();
    expect(updatedState.activeProposal).toEqual(mockProposal);
    expect(updatedState.proposals).toContainEqual(mockProposal);
  });

  it('handles modal state triggers correctly', () => {
    const store = useTradeProposalStore.getState();

    store.openCreateModal({ symbol: 'GOOGL', action: 'SELL' });
    let state = useTradeProposalStore.getState();
    expect(state.isCreateModalOpen).toBe(true);
    expect(state.draftProposal).toEqual({ symbol: 'GOOGL', action: 'SELL' });

    store.closeCreateModal();
    state = useTradeProposalStore.getState();
    expect(state.isCreateModalOpen).toBe(false);
    expect(state.draftProposal).toBeNull();
  });

  it('fetches all proposals and stores them in state', async () => {
    const mockList: TradeProposal[] = [
      {
        id: 'prop-777',
        symbol: 'MSFT',
        action: 'BUY',
        requested_quantity: 15,
        entry_price: 400,
        stop_loss: 385,
        take_profit: 440,
        confidence_score: 0.88,
        primary_strategy: 'Cloud Trend',
        status: 'PENDING_RISK',
      }
    ];

    vi.mocked(tradeProposalService.getProposals).mockResolvedValueOnce(mockList);

    const store = useTradeProposalStore.getState();
    await store.fetchProposals('user-001');

    expect(tradeProposalService.getProposals).toHaveBeenCalledWith('user-001');
    const updatedState = useTradeProposalStore.getState();
    expect(updatedState.proposals).toEqual(mockList);
  });
});
