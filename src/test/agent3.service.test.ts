import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agent3Service } from '@/services/agent3.service';
import { aiServiceClient } from '@/lib/api.client';

vi.mock('@/lib/api.client', () => ({
  apiClient: {
    post: vi.fn(),
  },
  aiServiceClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('agent3Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call POST /agent3/evaluate with upper-case ticker on aiServiceClient', async () => {
    const mockSignal = {
      signal_id: 'SIG-98765432',
      symbol: 'TSLA',
      action: 'BUY',
      entry_price: 342.27,
      stop_loss: 330.0,
      take_profit: 370.0,
      risk_reward_ratio: 2.3,
      confidence_score: 0.84,
      primary_strategy: 'Momentum Breakout',
      reasons: ['RSI Crossover'],
    };

    (aiServiceClient.post as any).mockResolvedValue({ data: mockSignal });

    const result = await agent3Service.evaluateTicker('tsla');

    expect(aiServiceClient.post).toHaveBeenCalledWith('/agent3/evaluate', {
      ticker: 'TSLA',
    });
    expect(result).toEqual(mockSignal);
    expect(result.symbol).toBe('TSLA');
    expect(result.action).toBe('BUY');
  });
});
