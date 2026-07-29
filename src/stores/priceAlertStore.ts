import { create } from 'zustand';
import {
  priceAlertService,
  type PriceAlertItem,
  type AlertCondition,
} from '@/services/priceAlert.service';

interface PriceAlertState {
  alerts: PriceAlertItem[];
  isLoading: boolean;
  error: string | null;

  // Modal State
  isModalOpen: boolean;
  targetSymbol: string;
  initialPrice: number | null;

  // Drawer / List Panel State
  isDrawerOpen: boolean;

  // Actions
  openModal: (symbol?: string, currentPrice?: number | null) => void;
  closeModal: () => void;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;

  fetchAlerts: () => Promise<void>;
  addAlert: (symbol: string, targetPrice: number, condition: AlertCondition) => Promise<PriceAlertItem>;
  removeAlert: (id: string) => Promise<void>;
}

export const usePriceAlertStore = create<PriceAlertState>((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,

  isModalOpen: false,
  targetSymbol: '',
  initialPrice: null,
  isDrawerOpen: false,

  openModal: (symbol = '', currentPrice = null) => {
    set({
      isModalOpen: true,
      targetSymbol: symbol.toUpperCase(),
      initialPrice: currentPrice,
      error: null,
    });
  },

  closeModal: () => {
    set({ isModalOpen: false, targetSymbol: '', initialPrice: null, error: null });
  },

  setDrawerOpen: (open: boolean) => {
    set({ isDrawerOpen: open });
  },

  toggleDrawer: () => {
    set({ isDrawerOpen: !get().isDrawerOpen });
  },

  fetchAlerts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await priceAlertService.getUserAlerts();
      set({ alerts: data.items, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to fetch price alerts.';
      set({ error: msg, isLoading: false });
    }
  },

  addAlert: async (symbol: string, targetPrice: number, condition: AlertCondition) => {
    set({ isLoading: true, error: null });
    try {
      const newAlert = await priceAlertService.createAlert({
        symbol,
        target_price: targetPrice,
        condition,
      });
      set((state) => ({
        alerts: [newAlert, ...state.alerts],
        isLoading: false,
        isModalOpen: false,
      }));
      return newAlert;
    } catch (err: any) {
      const errorMsg =
        typeof err.response?.data?.detail === 'string'
          ? err.response.data.detail
          : err.message || 'Failed to create price target alert.';
      set({ error: errorMsg, isLoading: false });
      throw new Error(errorMsg);
    }
  },

  removeAlert: async (id: string) => {
    try {
      await priceAlertService.deleteAlert(id);
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id),
      }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to delete alert.';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },
}));
