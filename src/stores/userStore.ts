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

  /** Set the access token (used during login or silent refresh) */
  setAccessToken: (token: string | null) => void;
  /** Set the user profile (used after successful login or /auth/me) */
  setUser: (user: UserResponse) => void;

  /** Initialize auth state on app load. Attempts to refresh the token via cookie. */
  initAuth: () => Promise<void>;

  /** Clear the session and log out locally and remotely */
  logout: () => Promise<void>;
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

      setAccessToken: (token: string | null) => {
        set({ accessToken: token, isAuthenticated: !!token });
      },

      setUser: (user: UserResponse) => {
        set({ user });
      },

      initAuth: async () => {
        try {
          // If we have a user in localStorage, we can optimistically say they might be authenticated.
          // But to be sure, and to get the access token in memory, we fetch their profile.
          // Since there is no access token in memory yet, the Axios interceptor will hit a 401
          // when it tries to get /auth/me, which will trigger the /auth/refresh flow automatically!
          const user = await authService.getMe();
          set({ user, isAuthenticated: true });
        } catch (error) {
          // If refresh fails, clear the state
          set({ user: null, isAuthenticated: false, accessToken: null });
        }
      },

      logout: async () => {
        try {
          // Optionally call backend logout to destroy the HttpOnly cookie
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
      name: 'user-session', // localStorage key
      // ONLY persist the non-sensitive user profile data, NOT the access token!
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
