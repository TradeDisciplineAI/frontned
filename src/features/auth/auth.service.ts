import { apiClient } from '@/lib/api.client';
import type { Token, UserResponse, UserSessionResponse } from './auth.types';

export const authService = {
  /**
   * Log in to the application.
   * Expects application/x-www-form-urlencoded payload as per OAuth2PasswordBearer.
   */
  async login(username: string, password: string): Promise<Token> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await apiClient.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  /**
   * Get the current authenticated user's profile.
   */
  async getMe(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response.data;
  },

  /**
   * Log out the current session (revokes refresh token & deletes cookie).
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Log out all sessions for the user.
   */
  async logoutAll(): Promise<void> {
    await apiClient.post('/auth/logout-all');
  },

  /**
   * Get all active sessions for the user.
   */
  async getSessions(): Promise<UserSessionResponse[]> {
    const response = await apiClient.get<UserSessionResponse[]>('/auth/sessions');
    return response.data;
  },

  /**
   * Revoke a specific session by ID.
   */
  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * Request a password reset link.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password using a valid token.
   */
  async resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', { token, new_password });
    return response.data;
  },

  /**
   * Register a new user.
   */
  async register(data: any): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Verify a user's email using a verification token.
   */
  async verifyEmail(
    token: string,
  ): Promise<{ message: string; access_token?: string; token_type?: string }> {
    const response = await apiClient.post<{
      message: string;
      access_token?: string;
      token_type?: string;
    }>('/auth/verify-email', { token });
    return response.data;
  },

  /**
   * Resend email verification link.
   */
  async resendVerification(username_or_email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/resend-verification', { username_or_email });
    return response.data;
  },

  /**
   * Clean up expired sessions from the database (Admin only).
   */
  async cleanupSessions(): Promise<Record<string, number>> {
    const response = await apiClient.post('/auth/cleanup');
    return response.data;
  },

  /**
   * Fetch current subscription status & trade usage metrics.
   */
  async getSubscriptionStatus(): Promise<import('./auth.types').SubscriptionStatusResponse> {
    const response = await apiClient.get<import('./auth.types').SubscriptionStatusResponse>(
      '/auth/subscription-status',
    );
    return response.data;
  },

  /**
   * Upgrade current user to PRO subscription tier.
   */
  async subscribeToPro(
    paymentToken?: string,
    plan?: 'annual' | 'monthly',
  ): Promise<UserResponse> {
    const headers: Record<string, string> = {};
    if (paymentToken) {
      headers['X-Payment-Token'] = paymentToken;
    }
    const response = await apiClient.post<UserResponse>(
      '/auth/subscribe',
      { plan: plan || 'annual' },
      { headers },
    );
    return response.data;
  },
};
