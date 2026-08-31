import { create } from 'zustand';
import type { SubscriptionStatusResponse } from '@/features/auth/auth.types';
import { authService } from '@/features/auth/auth.service';
import { razorpayService } from '@/services/razorpay.service';
import { useUserStore } from '@/stores/userStore';

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
  upgradeWithRazorpay: () => Promise<boolean>;
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

  upgradeWithRazorpay: async () => {
    set({ isUpgrading: true, error: null });
    try {
      // 1. Fetch available subscription plans
      const plans = await razorpayService.getPlans();
      const proPlan = plans.find((p) => p.name === 'PRO') || plans[0];
      if (!proPlan) {
        throw new Error('PRO subscription plan not found.');
      }

      // 2. Create Razorpay Payment Order on Backend
      const order = await razorpayService.createOrder(proPlan.id);

      const currentUser = useUserStore.getState().user;

      // 3. Open Official Razorpay Checkout Popup
      const paymentResponse = await razorpayService.openCheckout({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'AI Trading Discipline Copilot',
        description: 'Upgrade to PRO Tier (Unlimited Trades & AI Guards)',
        order_id: order.razorpay_order_id,
        prefill: {
          name: currentUser?.username || '',
          email: currentUser?.email || '',
        },
        theme: {
          color: '#00e599',
        },
      });

      // 4. Verify Cryptographic HMAC-SHA256 Signature on Backend
      await razorpayService.verifyPayment({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      // 5. Refresh Subscription & User State
      try {
        const updatedStatus = await authService.getSubscriptionStatus();
        set({ status: updatedStatus, isUpgrading: false });
        if (currentUser) {
          useUserStore.getState().setUser({
            ...currentUser,
            subscription_tier: 'PRO',
          });
        }
      } catch (refreshErr) {
        console.warn('Failed to refresh status after payment verification:', refreshErr);
        set({ isUpgrading: false });
      }

      return true;
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Payment verification failed. Please try again.';
      set({ isUpgrading: false, error: msg });
      return false;
    }
  },
}));

