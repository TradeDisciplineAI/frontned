import { marketApiClient } from '@/lib/api.client';

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange?: string;
  quote_type?: string;
}

export const marketService = {
  // Search for stock symbols by company name or ticker
  async searchStocks(query: string): Promise<StockSearchResult[]> {
    if (!query || !query.trim()) return [];
    const { data } = await marketApiClient.get<StockSearchResult[]>('/dashboard/search', {
      params: { q: query.trim() },
    });
    return data;
  },
};
