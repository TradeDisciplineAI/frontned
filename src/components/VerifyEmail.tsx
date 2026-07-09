import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';
import { authService } from '@/features/auth/auth.service';
import { useUserStore } from '@/stores/userStore';
import { ROUTES } from '@/constants/routes.constants';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccessToken, setUser } = useUserStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Missing verification token. Please verify the URL.');
      return;
    }

    const performVerification = async () => {
      try {
        const response = await authService.verifyEmail(token);
        
        // If the backend returns access token on successful verification, auto-login
        if (response.access_token) {
          setAccessToken(response.access_token);
          const userProfile = await authService.getMe();
          setUser(userProfile);
          setStatus('success');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate(ROUTES.DASHBOARD);
          }, 2000);
        } else {
          // Fallback if no token returned (require user to sign in manually)
          setStatus('success');
        }
      } catch (err: any) {
        console.error('Verification failed', err);
        setStatus('error');
        setErrorMessage(
          err.response?.data?.detail || 'Invalid or expired email verification token.'
        );
      }
    };

    performVerification();
  }, [searchParams, setAccessToken, setUser, navigate]);

  return (
    <AuthLayout>
      <div
        className="auth-form-card no-card"
        style={{ alignItems: 'center', textAlign: 'center', maxWidth: '380px' }}
      >
        {status === 'loading' && (
          <>
            <div style={{ marginBottom: '16px', color: 'var(--color-brand-teal)' }}>
              <Loader2 size={48} className="animate-spin" />
            </div>
            <div className="form-header" style={{ alignItems: 'center' }}>
              <h2 className="form-title">Verifying Email</h2>
              <p className="form-subtitle">Please wait while we secure your account...</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
              }}
            >
              <CheckCircle2 size={36} color="var(--color-brand-teal)" strokeWidth={2.5} />
            </div>
            <div className="form-header" style={{ alignItems: 'center' }}>
              <h2 className="form-title">Email Verified!</h2>
              <p className="form-subtitle">
                Your account is verified. Logging you in and redirecting to the dashboard...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
              }}
            >
              <XCircle size={36} color="#ef4444" strokeWidth={2.5} />
            </div>
            <div className="form-header" style={{ alignItems: 'center' }}>
              <h2 className="form-title" style={{ color: '#ef4444' }}>Verification Failed</h2>
              <p className="form-subtitle">{errorMessage}</p>
            </div>

            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '16px',
              }}
            >
              <button
                className="auth-submit-btn"
                onClick={() => navigate(ROUTES.LOGIN)}
                style={{ width: '100%' }}
              >
                <span>Back to Sign In</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};
