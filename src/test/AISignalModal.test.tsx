import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AISignalModal } from '@/components/tradeProposal/AISignalModal';
import type { TradeSignal } from '@/services/agent3.service';

const mockBuySignal: TradeSignal = {
  signal_id: 'SIG-12345678',
  symbol: 'NVDA',
  action: 'BUY',
  entry_price: 180.5,
  stop_loss: 175.0,
  take_profit: 195.0,
  risk_reward_ratio: 2.6,
  confidence_score: 0.88,
  primary_strategy: 'AI Momentum Breakout',
  reasons: ['RSI Bullish Crossover', 'Above 50-day EMA'],
};

const mockSellSignal: TradeSignal = {
  signal_id: 'SIG-SELL-999',
  symbol: 'TSLA',
  action: 'SELL',
  entry_price: 340.0,
  stop_loss: 350.0,
  take_profit: 320.0,
  risk_reward_ratio: 2.0,
  confidence_score: 0.75,
  primary_strategy: 'Bearish Engulfing',
  reasons: ['RSI Bearish Divergence'],
};

const mockHoldSignal: TradeSignal = {
  signal_id: 'SIG-HOLD-000',
  symbol: 'TSLA',
  action: 'HOLD',
  entry_price: 342.32,
  stop_loss: 341.81,
  take_profit: 343.34,
  risk_reward_ratio: 2.0,
  confidence_score: 0.0,
  primary_strategy: 'None',
  reasons: ['No active technical strategies triggered a BUY signal.'],
};

describe('AISignalModal Component', () => {
  it('BUY signal renders executable trade parameters and enables Propose Trade', () => {
    const handleProposeTrade = vi.fn();

    render(
      <AISignalModal
        isOpen={true}
        onClose={vi.fn()}
        signal={mockBuySignal}
        onProposeTrade={handleProposeTrade}
      />
    );

    expect(screen.getByText('AI Trade Signal')).toBeInTheDocument();
    expect(screen.getByText('NVDA')).toBeInTheDocument();
    expect(screen.getByTestId('signal-action-badge')).toHaveTextContent('BUY');
    expect(screen.getByText('Entry Price')).toBeInTheDocument();
    expect(screen.getByText('$180.50')).toBeInTheDocument();
    expect(screen.getByText('Stop Loss')).toBeInTheDocument();
    expect(screen.getByText('$175.00')).toBeInTheDocument();
    expect(screen.getByText('Take Profit')).toBeInTheDocument();
    expect(screen.getByText('$195.00')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();

    const proposeBtn = screen.getByTestId('propose-trade-btn');
    expect(proposeBtn).not.toBeDisabled();
    fireEvent.click(proposeBtn);
    expect(handleProposeTrade).toHaveBeenCalledWith(mockBuySignal);
  });

  it('SELL signal renders executable trade parameters and enables Propose Trade', () => {
    const handleProposeTrade = vi.fn();

    render(
      <AISignalModal
        isOpen={true}
        onClose={vi.fn()}
        signal={mockSellSignal}
        onProposeTrade={handleProposeTrade}
      />
    );

    expect(screen.getByTestId('signal-action-badge')).toHaveTextContent('SELL');
    expect(screen.getByText('Entry Price')).toBeInTheDocument();
    expect(screen.getByText('$340.00')).toBeInTheDocument();

    const proposeBtn = screen.getByTestId('propose-trade-btn');
    expect(proposeBtn).not.toBeDisabled();
    fireEvent.click(proposeBtn);
    expect(handleProposeTrade).toHaveBeenCalledWith(mockSellSignal);
  });

  it('HOLD signal hides executable trade parameters and displays No Trade Opportunity card', () => {
    const handleProposeTrade = vi.fn();

    render(
      <AISignalModal
        isOpen={true}
        onClose={vi.fn()}
        signal={mockHoldSignal}
        onProposeTrade={handleProposeTrade}
      />
    );

    expect(screen.getByTestId('signal-action-badge')).toHaveTextContent('HOLD');
    expect(screen.getByText('No active strategy')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();

    // Confirm Entry Price, Stop Loss, Take Profit metrics are hidden
    expect(screen.queryByText('Entry Price')).not.toBeInTheDocument();
    expect(screen.queryByText('Stop Loss')).not.toBeInTheDocument();
    expect(screen.queryByText('Take Profit')).not.toBeInTheDocument();

    // Confirm HOLD Opportunity card is displayed
    expect(screen.getByTestId('hold-opportunity-card')).toBeInTheDocument();
    expect(screen.getByText('No Trade Opportunity')).toBeInTheDocument();
    expect(
      screen.getByText('Agent 3 did not generate an executable BUY or SELL signal for this asset.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('This asset is currently on HOLD. A Trade Proposal can only be created from a BUY or SELL signal.')
    ).toBeInTheDocument();

    // Confirm Propose Trade button is disabled and does NOT trigger callback
    const proposeBtn = screen.getByTestId('propose-trade-btn');
    expect(proposeBtn).toBeDisabled();
    fireEvent.click(proposeBtn);
    expect(handleProposeTrade).not.toHaveBeenCalled();
  });
});
