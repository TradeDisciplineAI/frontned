import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';
import { useUserStore } from '@/stores/userStore';
import { authService } from '@/features/auth/auth.service';
import { ROUTES } from '@/constants/routes.constants';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const setAccessToken = useUserStore((s) => s.setAccessToken);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const hash = window.location.hash || '';
        let token: string | null = null;

        // Extract token parameter from hash (handles #/auth/callback#token=... and #/auth/callback?token=...)
        if (hash.includes('token=')) {
          const parts = hash.split('token=');
          const tokenPart = parts[1];
          if (tokenPart) {
            token = tokenPart.split('&')[0] || null;
          }
        }

        if (token) {
          // Set access token in Zustand memory store (enabling authenticated requests)
          setAccessToken(token);

          try {
            // Retrieve user profile profile data to verify authentication
            const user = await authService.getMe();
            setUser(user);

            // Clear token from browser URL address bar and route to main screen
            window.history.replaceState(null, '', '/#/dashboard');
            navigate(ROUTES.DASHBOARD);
            return;
          } catch (getMeError) {
            setAccessToken(null);
            window.history.replaceState(null, '', '/#/login');
            throw getMeError;
          }
        }

        // If no URL token, check if user session already exists
        if (isAuthenticated) {
          window.history.replaceState(null, '', '/#/dashboard');
          navigate(ROUTES.DASHBOARD);
        } else {
          // Not logged in and no token - fall back to login screen
          navigate(ROUTES.LOGIN);
        }
      } catch (err) {
        console.error('Error processing callback authentication token:', err);
        navigate(ROUTES.LOGIN);
      }
    };

    handleAuth();
  }, [isAuthenticated, navigate, setAccessToken, setUser]);

  return (
    <AuthLayout>
      <div
        className="auth-form-card no-card"
        style={{ alignItems: 'center', textAlign: 'center', maxWidth: '380px' }}
      >
        <div style={{ marginBottom: '16px', color: 'var(--color-brand-teal)' }}>
          <Loader2 size={48} className="animate-spin" />
        </div>
        <div className="form-header" style={{ alignItems: 'center' }}>
          <h2 className="form-title">Authenticating</h2>
          <p className="form-subtitle">Loading your Google trading profile...</p>
        </div>
      </div>
    </AuthLayout>
  );
};
export default AuthCallback;
