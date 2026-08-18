export type TradeAction = 'BUY' | 'SELL';

export type TradeProposalStatus =
  | 'PENDING_RISK'
  | 'PROPOSED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface TradeProposal {
  id: string;
  user_id?: string;
  portfolio_id?: string;
  signal_id?: string;
  symbol: string;
  action: TradeAction;
  requested_quantity: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  confidence_score: number;
  primary_strategy: string;
  status: TradeProposalStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTradeProposalDTO {
  user_id?: string;
  portfolio_id?: string;
  signal_id?: string;
  symbol: string;
  action: TradeAction;
  requested_quantity: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  confidence_score?: number;
  primary_strategy?: string;
}

export interface PreRiskMetrics {
  riskRewardRatio: number;
  riskAmountPerShare: number;
  rewardAmountPerShare: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  estimatedPositionValue: number;
  maxTotalRiskDollars: number;
}
