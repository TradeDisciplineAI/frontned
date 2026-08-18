import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tradeProposalService } from '@/services/tradeProposal.service';
import { aiServiceClient } from '@/lib/api.client';
import type { TradeProposal, CreateTradeProposalDTO } from '@/types/tradeProposal.types';

vi.mock('@/lib/api.client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
  aiServiceClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('tradeProposalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createProposal posts payload to /trade-proposals and returns backend response', async () => {
    const mockDTO: CreateTradeProposalDTO = {
      symbol: 'AAPL',
      action: 'BUY',
      requested_quantity: 10,
      entry_price: 150,
      stop_loss: 140,
      take_profit: 170,
      confidence_score: 0.85,
      primary_strategy: 'Breakout',
    };

    const mockResponse: TradeProposal = {
      id: 'prop-123',
      user_id: 'user-1',
      signal_id: 'sig-1',
      symbol: 'AAPL',
      action: 'BUY',
      requested_quantity: 10,
      entry_price: 150,
      stop_loss: 140,
      take_profit: 170,
      confidence_score: 0.85,
      primary_strategy: 'Breakout',
      status: 'PROPOSED',
      created_at: '2026-08-17T12:00:00Z',
      updated_at: '2026-08-17T12:00:00Z',
    };

    vi.mocked(aiServiceClient.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await tradeProposalService.createProposal(mockDTO);

    expect(aiServiceClient.post).toHaveBeenCalledWith('/trade-proposals', mockDTO);
    expect(result).toEqual(mockResponse);
  });

  it('getProposalById calls GET /trade-proposals/{id}', async () => {
    const mockProposal: TradeProposal = {
      id: 'prop-456',
      symbol: 'TSLA',
      action: 'SELL',
      requested_quantity: 5,
      entry_price: 200,
      stop_loss: 215,
      take_profit: 170,
      confidence_score: 0.9,
      primary_strategy: 'Reversal',
      status: 'PENDING_RISK',
    };

    vi.mocked(aiServiceClient.get).mockResolvedValueOnce({ data: mockProposal });

    const result = await tradeProposalService.getProposalById('prop-456');

    expect(aiServiceClient.get).toHaveBeenCalledWith('/trade-proposals/prop-456');
    expect(result).toEqual(mockProposal);
  });
});
