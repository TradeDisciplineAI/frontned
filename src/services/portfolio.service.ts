import { marketApiClient } from '@/lib/api.client';

export interface Holding {
  id: string;
  symbol: string;
  created_at: string;
  price?: number;
  percent_change?: number;
  currency?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  holdings: Holding[];
}

export const portfolioService = {
  // Fetch user's active portfolio
  async getPortfolio(): Promise<Portfolio> {
    const { data } = await marketApiClient.get('/portfolio');
    return data;
  },

  // Create a new portfolio
  async createPortfolio(name: string): Promise<Portfolio> {
    const { data } = await marketApiClient.post('/portfolio', { name });
    return data;
  },

  // Add a new stock holding
  async addHolding(symbol: string): Promise<Holding> {
    const { data } = await marketApiClient.post('/portfolio/holdings', { symbol });
    return data;
  },

  // Remove a stock holding
  async removeHolding(symbol: string): Promise<void> {
    await marketApiClient.delete(`/portfolio/holdings/${symbol}`);
  },
};
