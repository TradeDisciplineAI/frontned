/**
 * Razorpay Payment Gateway & Checkout Integration Service.
 * Manages dynamic checkout.js SDK loading, subscription plans retrieval,
 * order creation, modal checkout launch, and HMAC signature verification.
 */

import { apiClient } from '@/lib/api.client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  amount: number; // Amount in subunit (paise), e.g. 199900 = ₹1,999.00
  currency: string;
  billing_interval: string;
  max_portfolios: number;
}

export interface CreateOrderResponse {
  order_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  plan_name: string;
  receipt: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  status: string;
  message: string;
  subscription_tier: string;
  current_period_end: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

/**
 * Dynamically injects and caches the Razorpay Checkout JavaScript SDK.
 */
let razorpayScriptLoadedPromise: Promise<boolean> | null = null;

export const loadRazorpayScript = (): Promise<boolean> => {
  if (razorpayScriptLoadedPromise) {
    return razorpayScriptLoadedPromise;
  }

  razorpayScriptLoadedPromise = new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      razorpayScriptLoadedPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptLoadedPromise;
};

export const razorpayService = {
  /**
   * Fetch available subscription plans from the backend.
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans');
    return response.data;
  },

  /**
   * Create a new payment order for a specific plan.
   */
  async createOrder(planId: string): Promise<CreateOrderResponse> {
    const response = await apiClient.post<CreateOrderResponse>('/subscriptions/create-order', {
      plan_id: planId,
    });
    return response.data;
  },

  /**
   * Verify HMAC-SHA256 signature after payment completion.
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
    const response = await apiClient.post<VerifyPaymentResponse>(
      '/subscriptions/verify-payment',
      payload,
    );
    return response.data;
  },

  /**
   * Opens the official Razorpay Checkout popup and resolves with payment credentials upon success.
   */
  async openCheckout(
    options: Omit<RazorpayCheckoutOptions, 'handler'>,
  ): Promise<{ razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }> {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay payment SDK. Please check your internet connection.');
    }

    return new Promise((resolve, reject) => {
      const rzpOptions = {
        ...options,
        handler: (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            if (options.modal?.ondismiss) {
              options.modal.ondismiss();
            }
            reject(new Error('Payment window was closed before completion.'));
          },
          escape: true,
          backdropclose: false,
        },
      };

      const razorpayInstance = new (window as any).Razorpay(rzpOptions);
      razorpayInstance.on('payment.failed', (errorResponse: any) => {
        const errorDesc = errorResponse?.error?.description || 'Payment failed';
        reject(new Error(errorDesc));
      });

      razorpayInstance.open();
    });
  },
};
