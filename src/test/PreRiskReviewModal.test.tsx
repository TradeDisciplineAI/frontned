import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PreRiskReviewModal } from '@/components/tradeProposal/PreRiskReviewModal';
import type { TradeProposal } from '@/types/tradeProposal.types';

describe('PreRiskReviewModal Component', () => {
  const mockProposal: TradeProposal = {
    id: 'prop-test-101',
    user_id: 'user-001',
    symbol: 'AMD',
    action: 'BUY',
    requested_quantity: 50,
    entry_price: 150.0,
    stop_loss: 140.0,
    take_profit: 175.0,
    confidence_score: 0.86,
    primary_strategy: 'AI Semiconductor Breakout',
    status: 'PENDING_RISK',
    created_at: '2026-08-17T12:00:00Z',
  };

  it('renders nothing when isOpen is false or proposal is null', () => {
    const { container } = render(
      <PreRiskReviewModal proposal={mockProposal} isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders proposal parameters, Pre-Risk Stage header, Paper Trading badge, and risk metrics when open', () => {
    render(<PreRiskReviewModal proposal={mockProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('AMD')).toBeInTheDocument();
    expect(screen.getByTestId('proposal-action-badge')).toHaveTextContent('BUY');
    expect(screen.getByText('PENDING RISK')).toBeInTheDocument();
    expect(screen.getByText('86%')).toBeInTheDocument();
    expect(screen.getAllByText(/PAPER TRADING/i)[0]).toBeInTheDocument();

    // Check Metrics & Values
    expect(screen.getByText('50 shares')).toBeInTheDocument();
    expect(screen.getByText('Level: $140.00')).toBeInTheDocument();
    expect(screen.getByText('Level: $175.00')).toBeInTheDocument();

    // Check R:R calculation: (175 - 150) / (150 - 140) = 25 / 10 = 2.5
    expect(screen.getByText('1 : 2.5')).toBeInTheDocument();
  });

  it('toggles raw payload JSON view when inspect JSON button is clicked', () => {
    render(<PreRiskReviewModal proposal={mockProposal} isOpen={true} onClose={vi.fn()} />);

    expect(screen.queryByTestId('raw-json-block')).not.toBeInTheDocument();

    const toggleBtn = screen.getByTestId('toggle-json-btn');
    fireEvent.click(toggleBtn);

    expect(screen.getByTestId('raw-json-block')).toBeInTheDocument();
    expect(screen.getByTestId('raw-json-block')).toHaveTextContent('prop-test-101');

    fireEvent.click(toggleBtn);
    expect(screen.queryByTestId('raw-json-block')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<PreRiskReviewModal proposal={mockProposal} isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByTestId('close-review-modal-btn');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
