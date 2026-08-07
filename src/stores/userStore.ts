import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse } from '@/features/auth/auth.types';
import { authService } from '@/features/auth/auth.service';

interface UserState {
  /** The authenticated user's profile data, or null if not logged in */
  user: UserResponse | null;
  /** Whether the user currently has an active session */
  isAuthenticated: boolean;
  /** In-memory access token. Used by Axios interceptor. */
  accessToken: string | null;
  /** State for the premium guest features unlock modal */
  isGuestModalOpen: boolean;

  /** Set the access token (used during login or silent refresh) */
  setAccessToken: (token: string | null) => void;
  /** Set the user profile (used after successful login or /auth/me) */
  setUser: (user: UserResponse) => void;

  /** Initialize auth state on app load. Attempts to refresh the token via cookie. */
  initAuth: () => Promise<void>;

  /** Clear the session and log out locally and remotely */
  logout: () => Promise<void>;

  /** Open the guest unlock modal */
  openGuestModal: () => void;
  /** Close the guest unlock modal */
  closeGuestModal: () => void;
}

/**
 * useUserStore — Global auth state via Zustand.
 *
 * Uses the `persist` middleware to survive page refreshes (stored in localStorage).
 * Note: accessToken is NOT persisted to localStorage for security reasons.
 * Instead, the app relies on the HttpOnly refresh token cookie to get a new
 * access token upon reload (handled by initAuth and Axios interceptors).
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      isGuestModalOpen: false,

      openGuestModal: () => set({ isGuestModalOpen: true }),
      closeGuestModal: () => set({ isGuestModalOpen: false }),

      setAccessToken: (token: string | null) => {
        set({ accessToken: token, isAuthenticated: !!token });
      },

      setUser: (user: UserResponse) => {
        set({ user });
      },

      initAuth: async () => {
        const token = get().accessToken;
        if (!token) return;

        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true });
        } catch (error: any) {
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            set({ user: null, isAuthenticated: false, accessToken: null });
          }
        }
      },

      logout: async () => {
        try {
          if (get().accessToken) {
            await authService.logout();
          }
        } catch (e) {
          console.error('Logout failed', e);
        } finally {
          set({ user: null, isAuthenticated: false, accessToken: null });
        }
      },
    }),
    {
      name: 'user-session',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    },
  ),
);
