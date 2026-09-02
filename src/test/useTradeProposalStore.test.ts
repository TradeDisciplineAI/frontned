import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { tradeProposalService } from '@/services/tradeProposal.service';
import type { TradeProposal, RiskEvaluation } from '@/types/tradeProposal.types';

vi.mock('@/services/tradeProposal.service', () => ({
  tradeProposalService: {
    createProposal: vi.fn(),
    getProposalById: vi.fn(),
    getProposals: vi.fn(),
    evaluateProposalRisk: vi.fn(),
    getProposalRisk: vi.fn(),
    executeTradeProposal: vi.fn(),
  },
}));

const mockRiskEvaluation: RiskEvaluation = {
  id: 'risk-eval-001',
  proposal_id: 'prop-999',
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
      actual_value: 'qty=10, entry=120.0',
      limit_value: 'positive numbers with valid order',
      message: 'Price ordering and quantities are valid.',
    },
  ],
  reasons: [],
  evaluated_at: '2026-08-18T07:05:26.334795',
};

const mockProposal: TradeProposal = {
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
      riskEvaluation: null,
      riskLoading: false,
      riskError: null,
      executionResult: null,
      executionLoading: false,
      executionError: null,
    });
  });

  it('creates proposal via POST and fetches via GET, opening review modal automatically on success', async () => {
    vi.mocked(tradeProposalService.createProposal).mockResolvedValueOnce(mockProposal);
    vi.mocked(tradeProposalService.getProposalById).mockResolvedValueOnce(mockProposal);

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
    expect(result).toEqual(mockProposal);

    const updatedState = useTradeProposalStore.getState();
    expect(updatedState.proposals).toHaveLength(1);
    expect(updatedState.activeProposal).toEqual(mockProposal);
    expect(updatedState.isCreateModalOpen).toBe(false);
    expect(updatedState.isReviewModalOpen).toBe(true);
    // Risk state should be cleared on new proposal creation
    expect(updatedState.riskEvaluation).toBeNull();
    expect(updatedState.riskLoading).toBe(false);
    expect(updatedState.riskError).toBeNull();
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
    vi.mocked(tradeProposalService.getProposalById).mockResolvedValueOnce(mockProposal);

    const store = useTradeProposalStore.getState();
    const result = await store.fetchProposalById('prop-999');

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
    const mockList: TradeProposal[] = [mockProposal];
    vi.mocked(tradeProposalService.getProposals).mockResolvedValueOnce(mockList);

    const store = useTradeProposalStore.getState();
    await store.fetchProposals('user-001');

    expect(tradeProposalService.getProposals).toHaveBeenCalledWith('user-001');
    const updatedState = useTradeProposalStore.getState();
    expect(updatedState.proposals).toEqual(mockList);
  });

  // ── Agent 4 Risk Engine Tests ──

  it('evaluateProposalRisk: calls service and updates riskEvaluation + proposal status', async () => {
    useTradeProposalStore.setState({ proposals: [mockProposal], activeProposal: mockProposal });
    vi.mocked(tradeProposalService.evaluateProposalRisk).mockResolvedValueOnce(mockRiskEvaluation);

    const result = await useTradeProposalStore.getState().evaluateProposalRisk('prop-999', 'user-001');

    expect(tradeProposalService.evaluateProposalRisk).toHaveBeenCalledWith('prop-999', 'user-001');
    expect(result).toEqual(mockRiskEvaluation);

    const state = useTradeProposalStore.getState();
    expect(state.riskEvaluation).toEqual(mockRiskEvaluation);
    expect(state.riskLoading).toBe(false);
    expect(state.riskError).toBeNull();
    // Proposal status should be updated to decision
    expect(state.activeProposal?.status).toBe('RISK_APPROVED');
    expect(state.proposals[0]?.status).toBe('RISK_APPROVED');
  });

  it('evaluateProposalRisk: handles API error and sets riskError', async () => {
    vi.mocked(tradeProposalService.evaluateProposalRisk).mockRejectedValueOnce({
      response: { data: { detail: 'Proposal cannot be evaluated in status: RISK_APPROVED' }, status: 400 },
    });

    const result = await useTradeProposalStore.getState().evaluateProposalRisk('prop-999', 'user-001');

    expect(result).toBeNull();
    const state = useTradeProposalStore.getState();
    expect(state.riskError).toContain('Proposal cannot be evaluated');
    expect(state.riskLoading).toBe(false);
    expect(state.riskEvaluation).toBeNull();
  });

  it('fetchProposalRisk: loads persisted risk evaluation', async () => {
    vi.mocked(tradeProposalService.getProposalRisk).mockResolvedValueOnce(mockRiskEvaluation);

    const result = await useTradeProposalStore.getState().fetchProposalRisk('prop-999', 'user-001');

    expect(tradeProposalService.getProposalRisk).toHaveBeenCalledWith('prop-999', 'user-001');
    expect(result).toEqual(mockRiskEvaluation);

    const state = useTradeProposalStore.getState();
    expect(state.riskEvaluation).toEqual(mockRiskEvaluation);
    expect(state.riskLoading).toBe(false);
    expect(state.riskError).toBeNull();
  });

  it('fetchProposalRisk: returns null and clears state on 404 (no evaluation exists yet)', async () => {
    vi.mocked(tradeProposalService.getProposalRisk).mockRejectedValueOnce({
      response: { status: 404 },
    });

    const result = await useTradeProposalStore.getState().fetchProposalRisk('prop-999', 'user-001');

    expect(result).toBeNull();
    const state = useTradeProposalStore.getState();
    expect(state.riskEvaluation).toBeNull();
    expect(state.riskLoading).toBe(false);
    // 404 on GET should NOT set riskError
    expect(state.riskError).toBeNull();
  });

  it('openReviewModal: clears stale risk state to prevent cross-proposal leakage', () => {
    // Pre-seed with risk state from a previous proposal
    useTradeProposalStore.setState({ riskEvaluation: mockRiskEvaluation, riskError: 'old error' });

    useTradeProposalStore.getState().openReviewModal(mockProposal);

    const state = useTradeProposalStore.getState();
    expect(state.riskEvaluation).toBeNull();
    expect(state.riskError).toBeNull();
    expect(state.riskLoading).toBe(false);
    expect(state.isReviewModalOpen).toBe(true);
  });

  it('closeReviewModal: clears risk state', () => {
    useTradeProposalStore.setState({
      isReviewModalOpen: true,
      riskEvaluation: mockRiskEvaluation,
      riskLoading: false,
      riskError: 'some error',
    });

    useTradeProposalStore.getState().closeReviewModal();

    const state = useTradeProposalStore.getState();
    expect(state.isReviewModalOpen).toBe(false);
    expect(state.riskEvaluation).toBeNull();
    expect(state.riskError).toBeNull();
  });

  it('setActiveProposal: clears risk state when switching proposals', () => {
    useTradeProposalStore.setState({ riskEvaluation: mockRiskEvaluation });

    const newProposal: TradeProposal = { ...mockProposal, id: 'prop-different' };
    useTradeProposalStore.getState().setActiveProposal(newProposal);

    const state = useTradeProposalStore.getState();
    expect(state.activeProposal?.id).toBe('prop-different');
    expect(state.riskEvaluation).toBeNull();
  });

  it('evaluateProposalRisk: handles SELL proposals correctly (status update)', async () => {
    const sellProposal: TradeProposal = {
      ...mockProposal,
      action: 'SELL',
      stop_loss: 130,
      take_profit: 100,
    };
    const sellRiskEval: RiskEvaluation = {
      ...mockRiskEvaluation,
      decision: 'NEEDS_REVIEW',
    };

    useTradeProposalStore.setState({ proposals: [sellProposal], activeProposal: sellProposal });
    vi.mocked(tradeProposalService.evaluateProposalRisk).mockResolvedValueOnce(sellRiskEval);

    const result = await useTradeProposalStore.getState().evaluateProposalRisk('prop-999', 'user-001');

    expect(result?.decision).toBe('NEEDS_REVIEW');
    const state = useTradeProposalStore.getState();
    expect(state.activeProposal?.status).toBe('NEEDS_REVIEW');
  });

  it('evaluateProposalRisk: handles network failure error', async () => {
    vi.mocked(tradeProposalService.evaluateProposalRisk).mockRejectedValueOnce({
      code: 'ERR_NETWORK',
    });

    const result = await useTradeProposalStore.getState().evaluateProposalRisk('prop-999', 'user-001');

    expect(result).toBeNull();
    const state = useTradeProposalStore.getState();
    expect(state.riskError).toContain('Unable to connect');
  });

  // ── Agent 5 Execution Tests ──

  it('executeTradeProposal: calls service and updates executionResult + proposal status to EXECUTED', async () => {
    const mockExecutionResult = {
      execution_id: 'exec-123',
      proposal_id: 'prop-999',
      symbol: 'NVDA',
      action: 'BUY' as const,
      filled_quantity: 20,
      execution_price: 121.5,
      executed_at: new Date().toISOString(),
    };

    useTradeProposalStore.setState({ proposals: [mockProposal], activeProposal: mockProposal });
    vi.mocked(tradeProposalService.executeTradeProposal).mockResolvedValueOnce(mockExecutionResult);

    const result = await useTradeProposalStore.getState().executeTradeProposal('prop-999', 'user-001');

    expect(tradeProposalService.executeTradeProposal).toHaveBeenCalledWith('prop-999', 'user-001');
    expect(result).toEqual(mockExecutionResult);

    const state = useTradeProposalStore.getState();
    expect(state.executionResult).toEqual(mockExecutionResult);
    expect(state.executionLoading).toBe(false);
    expect(state.executionError).toBeNull();
    // Proposal status should be updated to EXECUTED
    expect(state.activeProposal?.status).toBe('EXECUTED');
    expect(state.proposals[0]?.status).toBe('EXECUTED');
  });

  it('executeTradeProposal: handles API error and sets executionError and EXECUTION_FAILED status', async () => {
    useTradeProposalStore.setState({ proposals: [mockProposal], activeProposal: mockProposal });
    vi.mocked(tradeProposalService.executeTradeProposal).mockRejectedValueOnce({
      response: { data: { detail: 'Market closed' }, status: 400 },
    });

    const result = await useTradeProposalStore.getState().executeTradeProposal('prop-999', 'user-001');

    expect(result).toBeNull();
    const state = useTradeProposalStore.getState();
    expect(state.executionError).toContain('Market closed');
    expect(state.executionLoading).toBe(false);
    expect(state.executionResult).toBeNull();
    
    // Status should be EXECUTION_FAILED
    expect(state.activeProposal?.status).toBe('EXECUTION_FAILED');
    expect(state.proposals[0]?.status).toBe('EXECUTION_FAILED');
  });

  it('openReviewModal: clears stale execution state', () => {
    useTradeProposalStore.setState({ executionResult: { execution_id: 'x' } as any, executionError: 'old error' });

    useTradeProposalStore.getState().openReviewModal(mockProposal);

    const state = useTradeProposalStore.getState();
    expect(state.executionResult).toBeNull();
    expect(state.executionError).toBeNull();
    expect(state.executionLoading).toBe(false);
  });

  it('closeReviewModal: clears execution state', () => {
    useTradeProposalStore.setState({
      isReviewModalOpen: true,
      executionResult: { execution_id: 'x' } as any,
      executionLoading: false,
      executionError: 'some error',
    });

    useTradeProposalStore.getState().closeReviewModal();

    const state = useTradeProposalStore.getState();
    expect(state.isReviewModalOpen).toBe(false);
    expect(state.executionResult).toBeNull();
    expect(state.executionError).toBeNull();
  });

  it('setActiveProposal: clears execution state when switching proposals', () => {
    useTradeProposalStore.setState({ executionResult: { execution_id: 'x' } as any });

    const newProposal: TradeProposal = { ...mockProposal, id: 'prop-different' };
    useTradeProposalStore.getState().setActiveProposal(newProposal);

    const state = useTradeProposalStore.getState();
    expect(state.activeProposal?.id).toBe('prop-different');
    expect(state.executionResult).toBeNull();
  });
});

