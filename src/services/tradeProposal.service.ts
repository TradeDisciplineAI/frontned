import { aiServiceClient } from '@/lib/api.client';
import type { TradeProposal, CreateTradeProposalDTO } from '@/types/tradeProposal.types';

export const tradeProposalService = {
  /**
   * Submit a new Trade Proposal to AI-Service (http://localhost:8002)
   * POST /trade-proposals
   */
  async createProposal(payload: CreateTradeProposalDTO): Promise<TradeProposal> {
    const response = await aiServiceClient.post<TradeProposal>('/trade-proposals', payload);
    return response.data;
  },

  /**
   * Fetch details of a specific Trade Proposal by ID from AI-Service (http://localhost:8002)
   * GET /trade-proposals/{proposal_id}
   */
  async getProposalById(proposalId: string): Promise<TradeProposal> {
    const response = await aiServiceClient.get<TradeProposal>(`/trade-proposals/${proposalId}`);
    return response.data;
  },

  /**
   * Fetch all Trade Proposals from AI-Service (http://localhost:8002)
   * GET /trade-proposals?user_id={userId}
   */
  async getProposals(userId?: string): Promise<TradeProposal[]> {
    const response = await aiServiceClient.get<TradeProposal[]>('/trade-proposals', {
      params: userId ? { user_id: userId } : undefined,
    });
    return response.data;
  },
};
