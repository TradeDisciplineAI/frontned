import { create } from 'zustand';
import type { SubscriptionStatusResponse } from '@/features/auth/auth.types';
import { authService } from '@/features/auth/auth.service';

export type PaywallReason = 'trade_limit' | 'manual' | 'pro_feature' | null;

interface SubscriptionState {
  status: SubscriptionStatusResponse | null;
  isLoading: boolean;
  isUpgrading: boolean;
  isPaywallOpen: boolean;
  paywallReason: PaywallReason;
  error: string | null;

  fetchSubscriptionStatus: () => Promise<void>;
  openPaywall: (reason?: PaywallReason) => void;
  closePaywall: () => void;
  upgradeToPro: (paymentToken?: string, plan?: 'annual' | 'monthly') => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  status: null,
  isLoading: false,
  isUpgrading: false,
  isPaywallOpen: false,
  paywallReason: null,
  error: null,

  fetchSubscriptionStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const status = await authService.getSubscriptionStatus();
      set({ status, isLoading: false });
    } catch (err: any) {
      console.warn('Failed to fetch subscription status:', err);
      set({ isLoading: false, error: err?.response?.data?.detail || 'Failed to fetch status' });
    }
  },

  openPaywall: (reason = 'manual') => {
    set({ isPaywallOpen: true, paywallReason: reason });
  },

  closePaywall: () => {
    set({ isPaywallOpen: false, paywallReason: null });
  },

  upgradeToPro: async (paymentToken?: string, plan?: 'annual' | 'monthly') => {
    set({ isUpgrading: true, error: null });
    try {
      await authService.subscribeToPro(paymentToken, plan);
      set({ isUpgrading: false });

      try {
        const updatedStatus = await authService.getSubscriptionStatus();
        set({ status: updatedStatus });
      } catch (refreshErr) {
        console.warn('Failed to refresh status after successful upgrade:', refreshErr);
      }

      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Upgrade failed. Please try again.';
      set({ isUpgrading: false, error: msg });
      return false;
    }
  },
}));
