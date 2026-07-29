import { marketApiClient } from '@/lib/api.client';

export type AlertCondition = 'ABOVE' | 'BELOW';

export interface PriceAlertItem {
  id: string;
  user_id: string;
  symbol: string;
  target_price: number;
  condition: AlertCondition;
  is_triggered: boolean;
  created_at: string;
  triggered_at?: string | null;
}

export interface PriceAlertListResponse {
  items: PriceAlertItem[];
  total: number;
}

export interface CreatePriceAlertPayload {
  symbol: string;
  target_price: number;
  condition: AlertCondition;
}

export const priceAlertService = {
  /**
   * Create a new price target alert for a stock symbol
   */
  async createAlert(payload: CreatePriceAlertPayload): Promise<PriceAlertItem> {
    const response = await marketApiClient.post<PriceAlertItem>('/portfolio/alerts', {
      symbol: payload.symbol.trim().toUpperCase(),
      target_price: payload.target_price,
      condition: payload.condition,
    });
    return response.data;
  },

  /**
   * Get all active and triggered price alerts for the current user
   */
  async getUserAlerts(): Promise<PriceAlertListResponse> {
    const response = await marketApiClient.get<PriceAlertListResponse>('/portfolio/alerts');
    return response.data;
  },

  /**
   * Delete an existing price alert by ID
   */
  async deleteAlert(alertId: string): Promise<void> {
    await marketApiClient.delete(`/portfolio/alerts/${alertId}`);
  },
};
