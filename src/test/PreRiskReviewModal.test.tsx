import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreRiskReviewModal } from '@/components/tradeProposal/PreRiskReviewModal';
import { useTradeProposalStore } from '@/stores/useTradeProposalStore';
import { useUserStore } from '@/stores/userStore';
import type { TradeProposal, RiskEvaluation } from '@/types/tradeProposal.types';

// Mock Zustand stores
vi.mock('@/stores/useTradeProposalStore', () => ({
  useTradeProposalStore: vi.fn(),
}));

vi.mock('@/stores/userStore', () => ({
  useUserStore: vi.fn(),
}));

const mockPendingBuyProposal: TradeProposal = {
  id: 'prop-buy-pending',
  user_id: 'user-123',
  symbol: 'NVDA',
  action: 'BUY',
  requested_quantity: 20,
  entry_price: 120.0,
  stop_loss: 110.0,
  take_profit: 150.0,
  confidence_score: 0.92,
  primary_strategy: 'AI Momentum',
  status: 'PENDING_RISK',
  created_at: '2026-08-17T12:00:00Z',
};

const mockPendingSellProposal: TradeProposal = {
  id: 'prop-sell-pending',
  user_id: 'user-123',
  symbol: 'NVDA',
  action: 'SELL',
  requested_quantity: 20,
  entry_price: 120.0,
  stop_loss: 130.0,
  take_profit: 100.0,
  confidence_score: 0.92,
  primary_strategy: 'Mean Reversion',
  status: 'PENDING_RISK',
  created_at: '2026-08-17T12:00:00Z',
};

const mockApprovedProposal: TradeProposal = {
  ...mockPendingBuyProposal,
  id: 'prop-approved',
  status: 'RISK_APPROVED',
};

const mockApprovedRiskEval: RiskEvaluation = {
  id: 'risk-eval-approved',
  proposal_id: 'prop-buy-pending',
  decision: 'RISK_APPROVED',
  risk_score: 100,
  max_risk: 200.0,
  estimated_reward: 600.0,
  risk_reward_ratio: 3.0,
  portfolio_exposure: 2400.0,
  checks: [
    {
      check_name: 'price_validity',
      passed: true,
      severity: 'CRITICAL',
      actual_value: 'qty=20, entry=120.0',
      limit_value: 'positive values with valid order',
      message: 'Prices and ordering are valid.',
    },
    {
      check_name: 'position_value',
      passed: true,
      severity: 'HIGH',
      actual_value: '2400.0',
      limit_value: '50000.0',
      message: 'Position value is within limits.',
    },
  ],
  reasons: [],
  evaluated_at: '2026-08-18T07:05:26.334795',
};

const mockRejectedRiskEval: RiskEvaluation = {
  id: 'risk-eval-rejected',
  proposal_id: 'prop-buy-pending',
  decision: 'RISK_REJECTED',
  risk_score: 50,
  max_risk: 400.0,
  estimated_reward: 200.0,
  risk_reward_ratio: 0.5,
  portfolio_exposure: 4000.0,
  checks: [
    {
      check_name: 'risk_reward',
      passed: false,
      severity: 'MEDIUM',
      actual_value: '0.5',
      limit_value: '>= 1.5',
      message: 'Risk reward ratio is too low.',
    },
  ],
  reasons: ['Risk-reward check failed.'],
  evaluated_at: '2026-08-18T07:05:26.334795',
};

const mockNeedsReviewRiskEval: RiskEvaluation = {
  id: 'risk-eval-review',
  proposal_id: 'prop-buy-pending',
  decision: 'NEEDS_REVIEW',
  risk_score: 80,
  max_risk: 300.0,
  estimated_reward: 500.0,
  risk_reward_ratio: 1.67,
  portfolio_exposure: 5000.0,
  checks: [
    {
      check_name: 'stop_loss_distance',
      passed: false,
      severity: 'MEDIUM',
      actual_value: '12%',
      limit_value: '<= 10%',
      message: 'Stop loss distance is slightly wider than default limit.',
    },
  ],
  reasons: [],
  evaluated_at: '2026-08-18T07:05:26.334795',
};

describe('PreRiskReviewModal Component', () => {
  let mockEvaluate = vi.fn();
  let mockFetch = vi.fn();

  const setupStoreMock = (overrides = {}) => {
    const defaultMockState = {
      riskEvaluation: null,
      riskLoading: false,
      riskError: null,
      evaluateProposalRisk: mockEvaluate,
      fetchProposalRisk: mockFetch,
      activeProposal: null,
      ...overrides,
    };

    vi.mocked(useTradeProposalStore).mockImplementation((selector: any) => {
      if (typeof selector === 'function') {
        return selector(defaultMockState as any);
      }
      return defaultMockState as any;
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEvaluate = vi.fn();
    mockFetch = vi.fn();

    vi.mocked(useUserStore).mockReturnValue({
      user: { id: 'user-123' },
    });

    setupStoreMock();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('PENDING_RISK proposal triggers evaluation automatically if no persisted exists', async () => {
    mockFetch.mockResolvedValueOnce(null); // No persisted evaluation
    mockEvaluate.mockResolvedValueOnce(mockApprovedRiskEval);

    render(<PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={true} onClose={vi.fn()} />);

    expect(mockFetch).toHaveBeenCalledWith('prop-buy-pending', 'user-123');
    await waitFor(() => {
      expect(mockEvaluate).toHaveBeenCalledWith('prop-buy-pending', 'user-123');
    });
  });

  it('loads persisted risk evaluation and skips POST if evaluation already exists', async () => {
    mockFetch.mockResolvedValueOnce(mockApprovedRiskEval); // Persisted evaluation exists

    setupStoreMock({ riskEvaluation: mockApprovedRiskEval });

    render(<PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={true} onClose={vi.fn()} />);

    expect(mockFetch).toHaveBeenCalledWith('prop-buy-pending', 'user-123');
    // evaluateProposalRisk should NOT be called
    expect(mockEvaluate).not.toHaveBeenCalled();
  });

  it('displays API loading state correctly and hides incomplete risk results', () => {
    setupStoreMock({ riskLoading: true });

    render(<PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('loading-risk-container')).toBeInTheDocument();
    expect(screen.getByText('Evaluating Trade Risk…')).toBeInTheDocument();
    expect(screen.queryByTestId('approved-status-card')).not.toBeInTheDocument();
  });

  it('displays API failure state and shows retry action for pending proposals', () => {
    setupStoreMock({ riskError: 'Unable to connect to AI-Service API' });

    render(<PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('error-risk-container')).toBeInTheDocument();
    expect(screen.getByText('Unable to connect to AI-Service API')).toBeInTheDocument();
    expect(screen.getByTestId('retry-evaluation-btn')).toBeInTheDocument();
  });

  it('does not display retry button in error state if proposal status is terminal', () => {
    setupStoreMock({ riskError: 'Some service error' });

    render(<PreRiskReviewModal proposal={mockApprovedProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.queryByTestId('retry-evaluation-btn')).not.toBeInTheDocument();
  });

  it('displays RISK APPROVED status and values correctly', () => {
    setupStoreMock({ riskEvaluation: mockApprovedRiskEval });

    render(<PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('approved-status-card')).toBeInTheDocument();
    expect(screen.getAllByText('RISK APPROVED')[0]).toBeInTheDocument();
    // Verify math display matches backend output exactly
    expect(screen.getByText('100/100')).toBeInTheDocument();
    expect(screen.getByText('$200.00')).toBeInTheDocument();
    expect(screen.getByText('$600.00')).toBeInTheDocument();
    expect(screen.getByText('1 : 3')).toBeInTheDocument();
    expect(screen.getByText('$2,400')).toBeInTheDocument();
  });

  it('displays RISK REJECTED status, values, and check failures correctly', () => {
    setupStoreMock({ riskEvaluation: mockRejectedRiskEval });

    render(<PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('rejected-status-card')).toBeInTheDocument();
    expect(screen.getAllByText('RISK REJECTED')[0]).toBeInTheDocument();
    expect(screen.getByText('50/100')).toBeInTheDocument();
    expect(screen.getByText('$400.00')).toBeInTheDocument();
    expect(screen.getByText('1 : 0.5')).toBeInTheDocument();

    // Verify dynamic check rendering
    expect(screen.getByTestId('risk-check-row-risk_reward')).toBeInTheDocument();
    expect(screen.getByText('Risk Reward')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
    expect(screen.getByText('Risk reward ratio is too low.')).toBeInTheDocument();
    expect(screen.getByText('0.5')).toBeInTheDocument();
    expect(screen.getByText('>= 1.5')).toBeInTheDocument();
    expect(screen.getByText('Risk-reward check failed.')).toBeInTheDocument();
  });

  it('displays NEEDS REVIEW status, values, and warning checks correctly', () => {
    setupStoreMock({ riskEvaluation: mockNeedsReviewRiskEval });

    render(<PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByTestId('needs-review-status-card')).toBeInTheDocument();
    expect(screen.getAllByText('NEEDS REVIEW')[0]).toBeInTheDocument();
    expect(screen.getByText('80/100')).toBeInTheDocument();

    expect(screen.getByTestId('risk-check-row-stop_loss_distance')).toBeInTheDocument();
    expect(screen.getByText('Stop Loss Distance')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument(); // Individual check status
    expect(screen.getByText('Stop loss distance is slightly wider than default limit.')).toBeInTheDocument();
  });

  it('renders BUY proposal parameters correctly', () => {
    render(<PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('BUY')).toBeInTheDocument();
    expect(screen.getByText('20 shares')).toBeInTheDocument();
    expect(screen.getByText('$120.00')).toBeInTheDocument();
    expect(screen.getByText('$110.00')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('renders SELL proposal parameters correctly', () => {
    render(<PreRiskReviewModal proposal={mockPendingSellProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('SELL')).toBeInTheDocument();
    expect(screen.getByText('20 shares')).toBeInTheDocument();
    expect(screen.getByText('$120.00')).toBeInTheDocument();
    expect(screen.getByText('$130.00')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('terminal proposals (e.g. RISK_APPROVED) do not call POST evaluation', async () => {
    mockFetch.mockResolvedValueOnce(mockApprovedRiskEval);

    render(<PreRiskReviewModal proposal={mockApprovedProposal} isOpen={true} onClose={vi.fn()} />);

    expect(mockFetch).toHaveBeenCalledWith('prop-approved', 'user-123');
    // evaluateProposalRisk must NOT be called for terminal status
    expect(mockEvaluate).not.toHaveBeenCalled();
  });

  it('toggles raw payload JSON view and displays both proposal and riskEvaluation details', () => {
    setupStoreMock({ riskEvaluation: mockApprovedRiskEval });

    render(<PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.queryByTestId('raw-json-block')).not.toBeInTheDocument();

    const toggleBtn = screen.getByTestId('toggle-json-btn');
    fireEvent.click(toggleBtn);

    expect(screen.getByTestId('raw-json-block')).toBeInTheDocument();
    expect(screen.getByTestId('raw-json-block')).toHaveTextContent('prop-buy-pending');
    expect(screen.getByTestId('raw-json-block')).toHaveTextContent('risk-eval-approved');

    fireEvent.click(toggleBtn);
    expect(screen.queryByTestId('raw-json-block')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<PreRiskReviewModal proposal={mockPendingBuyProposal} isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByTestId('close-review-modal-btn');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

