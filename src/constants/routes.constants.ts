export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  AUTH_CALLBACK: '/auth/callback',
  SUCCESS: '/success',
  DASHBOARD: '/dashboard',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
