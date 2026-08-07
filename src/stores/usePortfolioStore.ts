import { create } from 'zustand';
import { portfolioService, type Portfolio } from '@/services/portfolio.service';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';

export interface ModalState {
  isOpen: boolean;
  mode: 'add' | 'remove';
  symbol: string;
  price: number | null;
  exchange: string;
}

export interface ToastState {
  isOpen: boolean;
  type: 'success' | 'error';
  title: string;
  symbol: string;
  message: string;
  currentUsage: number;
}

interface PortfolioState {
  portfolio: Portfolio | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // UI interaction states
  modal: ModalState;
  toast: ToastState;

  // Actions
  fetchPortfolio: () => Promise<void>;
  createPortfolio: (name: string) => Promise<void>;
  triggerAddHolding: (symbol: string, price: number | null, exchange?: string) => void;
  triggerRemoveHolding: (symbol: string) => void;
  confirmAction: () => Promise<void>;
  closeModal: () => void;
  showToast: (
    type: 'success' | 'error',
    title: string,
    symbol: string,
    message: string,
    currentUsage: number,
  ) => void;
  closeToast: () => void;
}

const initialModalState: ModalState = {
  isOpen: false,
  mode: 'add',
  symbol: '',
  price: null,
  exchange: 'US Market',
};

const initialToastState: ToastState = {
  isOpen: false,
  type: 'success',
  title: '',
  symbol: '',
  message: '',
  currentUsage: 0,
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolio: null,
  isLoading: true,
  isSubmitting: false,
  error: null,

  modal: initialModalState,
  toast: initialToastState,

  fetchPortfolio: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await portfolioService.getPortfolio();
      set({ portfolio: data, isLoading: false });
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 404) {
        // Safe fallback - no portfolio created yet
        set({ portfolio: null, isLoading: false });
      } else {
        const errorMsg = err.response?.data?.detail || 'Failed to fetch portfolio details.';
        set({ error: errorMsg, isLoading: false });
        get().showToast('error', 'Error Fetching Portfolio', '', errorMsg, 0);
      }
    }
  },

  createPortfolio: async (name: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const data = await portfolioService.createPortfolio(name);
      set({ portfolio: data, isSubmitting: false });
      get().showToast(
        'success',
        'Portfolio Created',
        '',
        `Successfully created portfolio "${name}"`,
        0,
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to create portfolio.';
      set({ error: errorMsg, isSubmitting: false });
      get().showToast('error', 'Creation Failed', '', errorMsg, 0);
    }
  },

  triggerAddHolding: (symbol: string, price: number | null, exchange = 'US Market') => {
    set({
      modal: {
        isOpen: true,
        mode: 'add',
        symbol: symbol.toUpperCase(),
        price,
        exchange,
      },
    });
  },

  triggerRemoveHolding: (symbol: string) => {
    set({
      modal: {
        isOpen: true,
        mode: 'remove',
        symbol: symbol.toUpperCase(),
        price: null,
        exchange: '',
      },
    });
  },

  confirmAction: async () => {
    const { modal, portfolio } = get();
    if (!modal.isOpen) return;

    set({ isSubmitting: true });
    const currentUsage = portfolio?.holdings?.length || 0;

    if (modal.mode === 'add') {
      try {
        const addedHolding = await portfolioService.addHolding(modal.symbol);

        // Optimistically update the store
        if (portfolio) {
          const updatedHoldings = [...portfolio.holdings, addedHolding];
          set({
            portfolio: { ...portfolio, holdings: updatedHoldings },
            isSubmitting: false,
            modal: initialModalState,
          });
          get().showToast(
            'success',
            'Portfolio Updated',
            modal.symbol,
            'Successfully added to your portfolio.',
            updatedHoldings.length,
          );
        } else {
          // If no portfolio object existed yet, fetch complete structure
          set({ isSubmitting: false, modal: initialModalState });
          await get().fetchPortfolio();
        }
      } catch (err: any) {
        const status = err.response?.status;
        const errorMsg =
          err.response?.data?.detail || `Failed to add ${modal.symbol} to portfolio.`;
        set({ isSubmitting: false, modal: initialModalState });

        if (status === 402) {
          // Free trade limit reached! Trigger subscription paywall & refresh metrics
          useSubscriptionStore.getState().openPaywall('trade_limit');
          useSubscriptionStore.getState().fetchSubscriptionStatus();
          get().showToast(
            'error',
            'Free Trade Limit Reached (6/6)',
            modal.symbol,
            errorMsg,
            currentUsage,
          );
        } else {
          get().showToast('error', 'Add Stock Failed', modal.symbol, errorMsg, currentUsage);
        }
      }
    } else {
      // Remove Mode
      try {
        await portfolioService.removeHolding(modal.symbol);

        if (portfolio) {
          const updatedHoldings = portfolio.holdings.filter((h) => h.symbol !== modal.symbol);
          set({
            portfolio: { ...portfolio, holdings: updatedHoldings },
            isSubmitting: false,
            modal: initialModalState,
          });
          get().showToast(
            'success',
            'Portfolio Updated',
            modal.symbol,
            'Successfully removed from your portfolio.',
            updatedHoldings.length,
          );
        } else {
          // If no portfolio object existed yet, fetch complete structure
          set({ isSubmitting: false, modal: initialModalState });
          await get().fetchPortfolio();
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.detail || `Failed to remove ${modal.symbol}.`;
        set({ isSubmitting: false, modal: initialModalState });
        get().showToast('error', 'Removal Failed', modal.symbol, errorMsg, currentUsage);
      }
    }
  },

  closeModal: () => {
    set({ modal: initialModalState });
  },

  showToast: (type, title, symbol, message, currentUsage) => {
    set({
      toast: {
        isOpen: true,
        type,
        title,
        symbol,
        message,
        currentUsage,
      },
    });
  },

  closeToast: () => {
    set((state) => ({
      toast: {
        ...state.toast,
        isOpen: false,
      },
    }));
  },
}));
