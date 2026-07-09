import React, { useState } from 'react';
import { Mail, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
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

  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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
      console.error('Login failed', err);
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
      <div className="auth-form-card no-card">
        <div className="form-header">
          <h2 className="form-title">Welcome Back</h2>
          <p className="form-subtitle">Continue your journey to disciplined trading.</p>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '24px' }}>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendStatus === 'loading'}
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: '0.75rem',
                      color: 'var(--color-brand-teal)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                      fontWeight: 600,
                    }}
                  >
                    {resendStatus === 'loading' ? 'Sending new link...' : 'Resend verification email'}
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
                <Mail size={18} />
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
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-field has-icon-right"
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
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="form-divider" role="separator" aria-label="or">
          <span className="divider-text">OR</span>
        </div>

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
          <span>© 2024 Copilot AI Trading. All rights reserved.</span>
        </div>
      </div>
    </AuthLayout>
  );
};
