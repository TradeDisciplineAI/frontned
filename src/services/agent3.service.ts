import { aiServiceClient } from '@/lib/api.client';

export interface TradeSignal {
  signal_id: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_reward_ratio: number;
  confidence_score: number;
  confidence_mode?: string;
  required_threshold?: number;
  primary_strategy: string;
  reasons?: string[];
  technicals_summary?: Record<string, any>;
}

export const agent3Service = {
  /**
   * Evaluates market technicals, multi-strategies, sentiment, and RAG context for a ticker.
   * POST /agent3/evaluate on AI-Service (http://localhost:8002)
   */
  async evaluateTicker(symbol: string): Promise<TradeSignal> {
    const { data } = await aiServiceClient.post<TradeSignal>('/agent3/evaluate', {
      ticker: symbol.trim().toUpperCase(),
    });
    return data;
  },
};
