import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '@/features/auth/auth.service';
import { useUserStore } from '@/stores/userStore';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToForgot?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onNavigateToSignup,
  onNavigateToForgot,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { setAccessToken, setUser } = useUserStore();

  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );

  const handleResendVerification = async () => {
    if (!email) return;
    try {
      setResendStatus('loading');
      await authService.resendVerification(email);
      setResendStatus('success');
    } catch (err) {
      console.error(err);
      setResendStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const tokenResponse = await authService.login(email, password);
      setAccessToken(tokenResponse.access_token);
      const userProfile = await authService.getMe();
      setUser(userProfile);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login failed:', err?.message, 'Status:', err?.response?.status);
      if (err.response?.status === 403) {
        setErrorMsg(err.response.data?.detail || 'Please verify your email before logging in.');
      } else if (err.response?.status === 401 || err.response?.status === 400) {
        setErrorMsg('Invalid email or password.');
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-card">
        <div className="form-header">
          <h2 className="form-title">Welcome Back 👋</h2>
          <p className="form-subtitle">Continue building disciplined investing.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
              role="alert"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
              {errorMsg.toLowerCase().includes('verify') && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    paddingLeft: '24px',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendStatus === 'loading'}
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: '0.75rem',
                      color: '#00e599',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                      fontWeight: 600,
                    }}
                  >
                    {resendStatus === 'loading'
                      ? 'Sending new link...'
                      : 'Resend verification email'}
                  </button>
                  {resendStatus === 'success' && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981' }}>
                      Verification link resent successfully!
                    </span>
                  )}
                  {resendStatus === 'error' && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>
                      Failed to resend. Please try again.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="login-email" className="input-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left" aria-hidden="true">
                <Mail size={16} />
              </span>
              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input-field has-icon-left"
                autoComplete="email"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="login-password" className="input-label">
              Password
            </label>
            <div className="input-wrapper">
              <span className="input-icon-left" aria-hidden="true">
                <Lock size={16} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-field has-icon-left has-icon-right"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-icon-btn-right"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-row-actions">
            <label className="remember-me-checkbox-label" htmlFor="remember-me">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="custom-checkbox"
                disabled={isLoading}
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              className="auth-link"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={onNavigateToForgot}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="form-divider" role="separator" aria-label="or">
          <span className="divider-text">OR</span>
        </div>

        <button
          type="button"
          onClick={() => {
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
            window.location.href = `${API_URL}/auth/oauth2/google/login`;
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            color: '#1e293b',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '16px',
            marginBottom: '16px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="login-footer">
          <span className="footer-grey-text">Don&apos;t have an account? </span>
          <button
            type="button"
            className="auth-link"
            style={{
              color: 'var(--color-brand-teal)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
            onClick={onNavigateToSignup}
          >
            Sign Up
          </button>
        </div>

        <div className="auth-footer-copyright">
          <div className="auth-footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#help">Help Center</a>
          </div>
          <span>© 2026 TradeDisciplineAI. All rights reserved.</span>
        </div>
      </div>
    </AuthLayout>
  );
};
