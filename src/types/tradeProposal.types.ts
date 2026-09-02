export type TradeAction = 'BUY' | 'SELL';

export type TradeProposalStatus =
  | 'PENDING_RISK'
  | 'PROPOSED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'RISK_APPROVED'
  | 'RISK_REJECTED'
  | 'NEEDS_REVIEW'
  | 'EXECUTION_PENDING'
  | 'EXECUTED'
  | 'EXECUTION_FAILED';

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

export interface PaperExecutionResult {
  execution_id: string;
  proposal_id: string;
  symbol: string;
  action: TradeAction;
  filled_quantity: number;
  execution_price: number;
  executed_at: string;
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

export interface RiskCheck {
  check_name: string;
  passed: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  actual_value: string;
  limit_value: string;
  message: string;
}

export interface RiskEvaluation {
  id: string;
  proposal_id: string;
  decision: 'RISK_APPROVED' | 'RISK_REJECTED' | 'NEEDS_REVIEW';
  risk_score: number;
  max_risk: number;
  estimated_reward: number;
  risk_reward_ratio: number;
  portfolio_exposure: number;
  checks: RiskCheck[];
  reasons: string[];
  evaluated_at: string;
}
