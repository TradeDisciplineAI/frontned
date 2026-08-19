import { create } from 'zustand';
import { tradeProposalService } from '@/services/tradeProposal.service';
import type { TradeProposal, CreateTradeProposalDTO, RiskEvaluation } from '@/types/tradeProposal.types';

interface TradeProposalState {
  proposals: TradeProposal[];
  activeProposal: TradeProposal | null;
  draftProposal: Partial<CreateTradeProposalDTO> | null;

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  isCreateModalOpen: boolean;
  isReviewModalOpen: boolean;

  // Agent 4 Risk States
  riskEvaluation: RiskEvaluation | null;
  riskLoading: boolean;
  riskError: string | null;

  // Actions
  createProposal: (payload: CreateTradeProposalDTO) => Promise<TradeProposal | null>;
  fetchProposalById: (id: string) => Promise<TradeProposal | null>;
  fetchProposals: (userId?: string) => Promise<void>;
  setActiveProposal: (proposal: TradeProposal | null) => void;
  openCreateModal: (initialData?: Partial<CreateTradeProposalDTO>) => void;
  closeCreateModal: () => void;
  openReviewModal: (proposal?: TradeProposal) => void;
  closeReviewModal: () => void;
  clearError: () => void;
  evaluateProposalRisk: (proposalId: string, userId?: string) => Promise<RiskEvaluation | null>;
  fetchProposalRisk: (proposalId: string, userId?: string) => Promise<RiskEvaluation | null>;
}

export const useTradeProposalStore = create<TradeProposalState>((set, get) => ({
  proposals: [],
  activeProposal: null,
  draftProposal: null,

  isLoading: false,
  isSubmitting: false,
  error: null,

  isCreateModalOpen: false,
  isReviewModalOpen: false,

  // Agent 4 Risk States Default
  riskEvaluation: null,
  riskLoading: false,
  riskError: null,

  createProposal: async (payload: CreateTradeProposalDTO) => {
    set({ isSubmitting: true, error: null });
    try {
      // 1. POST /trade-proposals
      const created = await tradeProposalService.createProposal(payload);

      // Default status to PENDING_RISK
      const initialProposal: TradeProposal = {
        ...created,
        status: created.status || 'PENDING_RISK',
      };

      let fetchedProposal = initialProposal;
      // 2. GET /trade-proposals/{proposal_id} to verify persistent backend state
      if (created.id) {
        try {
          const fresh = await tradeProposalService.getProposalById(created.id);
          if (fresh) {
            fetchedProposal = {
              ...fresh,
              status: fresh.status || 'PENDING_RISK',
            };
          }
        } catch {
          // If GET fails transiently, fallback to POST response
        }
      }

      set((state) => ({
        proposals: [fetchedProposal, ...state.proposals.filter((p) => p.id !== fetchedProposal.id)],
        activeProposal: fetchedProposal,
        riskEvaluation: null,
        riskLoading: false,
        riskError: null,
        isSubmitting: false,
        isCreateModalOpen: false,
        isReviewModalOpen: true, // Show Pre-Risk Review UI after proposal creation
      }));
      return fetchedProposal;
    } catch (err: any) {
      let errorMsg = 'Failed to submit Trade Proposal';
      if (err.response?.status === 404) {
        errorMsg = 'Trade Proposal API endpoint not found (POST /trade-proposals). Please ensure AI-Service is running on port 8002.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Unable to connect to AI-Service API (http://localhost:8002). Please verify AI-Service backend is running.';
      } else if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map((d: any) => `${d.loc?.slice(-1)[0] || 'field'}: ${d.msg}`).join(', ');
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      set({ error: errorMsg, isSubmitting: false });
      return null;
    }
  },

  fetchProposalById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const proposal = await tradeProposalService.getProposalById(id);
      const normalizedProposal: TradeProposal = {
        ...proposal,
        status: proposal.status || 'PENDING_RISK',
      };
      set((state) => ({
        activeProposal: normalizedProposal,
        proposals: state.proposals.some((p) => p.id === normalizedProposal.id)
          ? state.proposals.map((p) => (p.id === normalizedProposal.id ? normalizedProposal : p))
          : [normalizedProposal, ...state.proposals],
        isLoading: false,
      }));
      return normalizedProposal;
    } catch (err: any) {
      let errorMsg = 'Failed to fetch Trade Proposal';
      if (err.response?.status === 404) {
        errorMsg = `Trade Proposal with ID ${id} not found on AI-Service.`;
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Unable to connect to AI-Service API (http://localhost:8002).';
      } else if (err.response?.data?.detail) {
        errorMsg = typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail);
      }
      set({ error: errorMsg, isLoading: false });
      return null;
    }
  },

  fetchProposals: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const list = await tradeProposalService.getProposals(userId);
      set({ proposals: list, isLoading: false });
    } catch (err: any) {
      let errorMsg = 'Failed to fetch Trade Proposals';
      if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Unable to connect to AI-Service API (http://localhost:8002).';
      }
      set({ error: errorMsg, isLoading: false });
    }
  },

  setActiveProposal: (proposal) => {
    set({ activeProposal: proposal, riskEvaluation: null, riskLoading: false, riskError: null });
  },

  openCreateModal: (initialData) => {
    set({
      isCreateModalOpen: true,
      draftProposal: initialData || null,
      error: null,
    });
  },

  closeCreateModal: () => {
    set({ isCreateModalOpen: false, draftProposal: null, error: null });
  },

  openReviewModal: (proposal) => {
    set({
      isReviewModalOpen: true,
      activeProposal: proposal !== undefined ? proposal : get().activeProposal,
      riskEvaluation: null,
      riskLoading: false,
      riskError: null,
      error: null,
    });
  },

  closeReviewModal: () => {
    set({ isReviewModalOpen: false, riskEvaluation: null, riskLoading: false, riskError: null });
  },

  clearError: () => {
    set({ error: null });
  },

  evaluateProposalRisk: async (proposalId: string, userId?: string) => {
    set({ riskLoading: true, riskError: null });
    try {
      const evaluation = await tradeProposalService.evaluateProposalRisk(proposalId, userId);
      set((state) => {
        const updatedProposals = state.proposals.map((p) =>
          p.id === proposalId ? { ...p, status: evaluation.decision } : p
        );
        const updatedActive = state.activeProposal && state.activeProposal.id === proposalId
          ? { ...state.activeProposal, status: evaluation.decision }
          : state.activeProposal;

        return {
          riskEvaluation: evaluation,
          proposals: updatedProposals,
          activeProposal: updatedActive,
          riskLoading: false,
        };
      });
      return evaluation;
    } catch (err: any) {
      let errorMsg = 'Failed to evaluate trade risk';
      if (err.response?.status === 404) {
        errorMsg = 'Risk evaluation API endpoint not found. Please verify AI-Service is running.';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Unable to connect to AI-Service API (http://localhost:8002).';
      } else if (err.response?.data?.detail) {
        errorMsg = typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail);
      }
      set({ riskError: errorMsg, riskLoading: false });
      return null;
    }
  },

  fetchProposalRisk: async (proposalId: string, userId?: string) => {
    set({ riskLoading: true, riskError: null });
    try {
      const evaluation = await tradeProposalService.getProposalRisk(proposalId, userId);
      set({ riskEvaluation: evaluation, riskLoading: false });
      return evaluation;
    } catch (err: any) {
      let errorMsg = 'Failed to fetch persisted risk evaluation';
      if (err.response?.status === 404) {
        set({ riskEvaluation: null, riskLoading: false });
        return null;
      }
      if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Unable to connect to AI-Service API (http://localhost:8002).';
      } else if (err.response?.data?.detail) {
        errorMsg = typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail);
      }
      set({ riskError: errorMsg, riskLoading: false });
      return null;
    }
  },
}));
