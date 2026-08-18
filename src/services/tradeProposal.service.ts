import { aiServiceClient } from '@/lib/api.client';
import type { TradeProposal, CreateTradeProposalDTO, RiskEvaluation } from '@/types/tradeProposal.types';

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

  /**
   * Trigger Agent 4 Risk Evaluation for a Trade Proposal
   * POST /trade-proposals/{proposal_id}/risk-evaluation
   */
  async evaluateProposalRisk(proposalId: string, userId?: string): Promise<RiskEvaluation> {
    const response = await aiServiceClient.post<RiskEvaluation>(
      `/trade-proposals/${proposalId}/risk-evaluation`,
      {},
      {
        params: userId ? { user_id: userId } : undefined,
      }
    );
    return response.data;
  },

  /**
   * Retrieve the persisted risk evaluation for a Trade Proposal
   * GET /trade-proposals/{proposal_id}/risk
   */
  async getProposalRisk(proposalId: string, userId?: string): Promise<RiskEvaluation> {
    const response = await aiServiceClient.get<RiskEvaluation>(
      `/trade-proposals/${proposalId}/risk`,
      {
        params: userId ? { user_id: userId } : undefined,
      }
    );
    return response.data;
  },
};
