import { useUserStore } from '@/stores/userStore';
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
  hasAttemptedAutoCreate?: boolean;
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
    // Auth initialization check: avoid unauthenticated API calls during session restoration
    const userState = useUserStore.getState();
    if (!userState.accessToken && !userState.user) {
      set({ portfolio: null, isLoading: false, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const data = await portfolioService.getPortfolio();
      set({ portfolio: data, isLoading: false, hasAttemptedAutoCreate: false });
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 404) {
        // Handle 404: Auto-create default paper portfolio once if not already attempted
        if (!get().hasAttemptedAutoCreate) {
          set({ hasAttemptedAutoCreate: true });
          try {
            const newPortfolio = await portfolioService.createPortfolio('My Paper Portfolio');
            set({ portfolio: newPortfolio, isLoading: false });
            return;
          } catch (createErr) {
            console.warn('Auto-creating portfolio failed:', createErr);
            set({ hasAttemptedAutoCreate: false });
          }
        }
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
      let addedHolding;
      try {
        addedHolding = await portfolioService.addHolding(modal.symbol);
      } catch (err: unknown) {
        interface ApiErrorResponse {
          response?: {
            status?: number;
            data?: {
              detail?: string;
            };
          };
        }
        const errorRes = err as ApiErrorResponse;
        const status = errorRes.response?.status;

        // Auto-initialize portfolio on 404 "Portfolio not found" exactly once
        if (status === 404 && !get().hasAttemptedAutoCreate) {
          set({ hasAttemptedAutoCreate: true });
          try {
            const newPortfolio = await portfolioService.createPortfolio('My Paper Portfolio');
            set({ portfolio: newPortfolio });
            // Retry addHolding exactly once
            addedHolding = await portfolioService.addHolding(modal.symbol);
          } catch (retryErr: unknown) {
            // Reset hasAttemptedAutoCreate on creation/retry failure so future actions can retry
            set({ hasAttemptedAutoCreate: false, isSubmitting: false, modal: initialModalState });

            const retryRes = retryErr as ApiErrorResponse;
            const retryStatus = retryRes.response?.status;
            const retryMsg =
              retryRes.response?.data?.detail || `Failed to add ${modal.symbol} to portfolio.`;

            if (retryStatus === 402) {
              useSubscriptionStore.getState().openPaywall('trade_limit');
              useSubscriptionStore.getState().fetchSubscriptionStatus();
              get().showToast(
                'error',
                'Free Trade Limit Reached (6/6)',
                modal.symbol,
                retryMsg,
                currentUsage,
              );
            } else {
              get().showToast('error', 'Add Stock Failed', modal.symbol, retryMsg, currentUsage);
            }
            return;
          }
        } else {
          const errorMsg =
            errorRes.response?.data?.detail || `Failed to add ${modal.symbol} to portfolio.`;
          set({ isSubmitting: false, modal: initialModalState });

          if (status === 402) {
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
          return;
        }
      }

      // Handle successful addedHolding (original or after retry)
      const currentPort = get().portfolio;
      if (currentPort) {
        const updatedHoldings = [...currentPort.holdings, addedHolding];
        set({
          portfolio: { ...currentPort, holdings: updatedHoldings },
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
        set({ isSubmitting: false, modal: initialModalState });
        await get().fetchPortfolio();
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
