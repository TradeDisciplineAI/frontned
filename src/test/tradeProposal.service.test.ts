import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tradeProposalService } from '@/services/tradeProposal.service';
import { aiServiceClient } from '@/lib/api.client';
import type { TradeProposal, CreateTradeProposalDTO, RiskEvaluation } from '@/types/tradeProposal.types';

vi.mock('@/lib/api.client', () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
  aiServiceClient: { post: vi.fn(), get: vi.fn() },
}));

const mockRiskEvaluation: RiskEvaluation = {
  id: 'risk-001',
  proposal_id: 'prop-123',
  decision: 'RISK_APPROVED',
  risk_score: 100,
  max_risk: 26.4,
  estimated_reward: 52.8,
  risk_reward_ratio: 2.0,
  portfolio_exposure: 13160.0,
  checks: [
    {
      check_name: 'price_validity',
      passed: true,
      severity: 'CRITICAL',
      actual_value: 'qty=10, entry=150.0',
      limit_value: 'positive numbers with valid order',
      message: 'Price ordering and quantities are valid.',
    },
  ],
  reasons: [],
  evaluated_at: '2026-08-18T07:05:26.334795',
};

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

  it('evaluateProposalRisk POSTs to /trade-proposals/{id}/risk-evaluation with user_id param', async () => {
    vi.mocked(aiServiceClient.post).mockResolvedValueOnce({ data: mockRiskEvaluation });

    const result = await tradeProposalService.evaluateProposalRisk('prop-123', 'user-001');

    expect(aiServiceClient.post).toHaveBeenCalledWith(
      '/trade-proposals/prop-123/risk-evaluation',
      {},
      { params: { user_id: 'user-001' } }
    );
    expect(result).toEqual(mockRiskEvaluation);
  });

  it('evaluateProposalRisk omits user_id param when userId is not provided', async () => {
    vi.mocked(aiServiceClient.post).mockResolvedValueOnce({ data: mockRiskEvaluation });

    await tradeProposalService.evaluateProposalRisk('prop-123');

    expect(aiServiceClient.post).toHaveBeenCalledWith(
      '/trade-proposals/prop-123/risk-evaluation',
      {},
      { params: undefined }
    );
  });

  it('getProposalRisk GETs /trade-proposals/{id}/risk with user_id param', async () => {
    vi.mocked(aiServiceClient.get).mockResolvedValueOnce({ data: mockRiskEvaluation });

    const result = await tradeProposalService.getProposalRisk('prop-123', 'user-001');

    expect(aiServiceClient.get).toHaveBeenCalledWith(
      '/trade-proposals/prop-123/risk',
      { params: { user_id: 'user-001' } }
    );
    expect(result).toEqual(mockRiskEvaluation);
  });

  it('getProposalRisk omits user_id param when userId is not provided', async () => {
    vi.mocked(aiServiceClient.get).mockResolvedValueOnce({ data: mockRiskEvaluation });

    await tradeProposalService.getProposalRisk('prop-123');

    expect(aiServiceClient.get).toHaveBeenCalledWith(
      '/trade-proposals/prop-123/risk',
      { params: undefined }
    );
  });

  describe('executeTradeProposal', () => {
    it('POSTs to correct endpoint with empty body and user_id param', async () => {
      const mockResult = {
        execution_id: 'exec-123',
        proposal_id: 'prop-123',
        symbol: 'AAPL',
        action: 'BUY',
        filled_quantity: 10,
        execution_price: 150.50,
        executed_at: new Date().toISOString(),
      };

      vi.mocked(aiServiceClient.post).mockResolvedValueOnce({ data: mockResult });

      const result = await tradeProposalService.executeTradeProposal('prop-123', 'user-001');

      expect(aiServiceClient.post).toHaveBeenCalledWith(
        '/trade-proposals/prop-123/execute',
        {},
        { params: { user_id: 'user-001' } }
      );
      expect(result).toEqual(mockResult);
    });
  });
});


