import { aiApiClient } from '@/lib/api.client';

export interface StockNewsResponse {
  ticker?: string;
  headlines: any[];
  last_updated?: string;
  message?: string;
}

export const newsService = {
  /**
   * Fetches the latest news headlines for a given stock ticker.
   */
  async getStockNews(ticker: string): Promise<StockNewsResponse> {
    const response = await aiApiClient.get(`/news/${ticker}`);
    return response.data;
  },
};
