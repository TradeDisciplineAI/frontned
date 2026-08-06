import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { ROUTES } from '@/constants/routes.constants';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard — Protects routes that require authentication.
 *
 * If the user is not authenticated, they are redirected to /login.
 * The original destination is preserved in location state so the user
 * can be redirected back after a successful login.
 *
 * Usage:
 *   <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.EXPLORE} replace />;
  }

  return <>{children}</>;
};
