import { marketApiClient } from '@/lib/api.client';

export interface Holding {
  id: string;
  symbol: string;
  created_at: string;
  price?: number;
  percent_change?: number;
  currency?: string;
}

export interface PaperPosition {
  id: string;
  portfolio_id: string;
  symbol: string;
  quantity: number;
  average_entry_price: number;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id?: string;
  name: string;
  type?: string;
  created_at: string;
  updated_at: string;
  holdings: Holding[];
  positions?: PaperPosition[];
}

export const portfolioService = {
  // Fetch user's active portfolio
  async getPortfolio(): Promise<Portfolio> {
    const { data } = await marketApiClient.get('/portfolio');
    return data;
  },

  // Create a new paper portfolio
  async createPortfolio(name: string = 'My Paper Portfolio'): Promise<Portfolio> {
    const { data } = await marketApiClient.post('/portfolio', { name, type: 'PAPER' });
    return data;
  },

  // Get paper positions for a specific portfolio ID
  async getPositions(portfolioId: string): Promise<PaperPosition[]> {
    const { data } = await marketApiClient.get(`/portfolio/${portfolioId}/positions`);
    return data;
  },

  // Add or update a paper position
  async addPosition(portfolioId: string, symbol: string, quantity: number, averageEntryPrice: number): Promise<PaperPosition> {
    const { data } = await marketApiClient.post(`/portfolio/${portfolioId}/positions`, {
      symbol,
      quantity,
      average_entry_price: averageEntryPrice,
    });
    return data;
  },

  // Add a new stock holding (watchlist)
  async addHolding(symbol: string): Promise<Holding> {
    const { data } = await marketApiClient.post('/portfolio/holdings', { symbol });
    return data;
  },

  // Remove a stock holding
  async removeHolding(symbol: string): Promise<void> {
    await marketApiClient.delete(`/portfolio/holdings/${symbol}`);
  },
};
