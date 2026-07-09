import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '@/features/auth/auth.service';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (err) {
      console.error('Forgot password failed', err);
      // The OpenAPI spec says it always returns a generic success message
      // to prevent account enumeration, so we can just show success anyway.
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-card no-card">
        <div className="form-header">
          <h2 className="form-title">Forgot Your Password?</h2>
          <p className="form-subtitle">
            {isSuccess
              ? "If an account exists for that email, we've sent a password reset link."
              : "Enter your email address and we'll send you a password reset link."}
          </p>
        </div>

        {isSuccess ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              alignItems: 'center',
              marginTop: '20px',
            }}
          >
            <CheckCircle2 size={48} color="var(--color-brand-teal)" />
            <button
              type="button"
              className="back-link"
              onClick={onBackToLogin}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="auth-form"
            noValidate
            style={{ marginTop: '12px' }}
          >
            <div className="input-group">
              <label htmlFor="forgot-email" className="input-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <input
                  id="forgot-email"
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

            <button type="submit" className="auth-submit-btn" disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="back-link"
              onClick={onBackToLogin}
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '24px' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};
