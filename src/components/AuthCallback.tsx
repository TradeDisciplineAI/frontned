import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';
import { useUserStore } from '@/stores/userStore';
import { ROUTES } from '@/constants/routes.constants';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      // Clean up fragment from url and navigate to dashboard
      window.history.replaceState(null, '', '/#/dashboard');
      navigate(ROUTES.DASHBOARD);
    } else {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, navigate]);

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
