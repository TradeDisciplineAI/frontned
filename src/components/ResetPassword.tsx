import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { authService } from '@/features/auth/auth.service';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';

interface ResetPasswordProps {
  onBackToLogin: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onBackToLogin }) => {
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validations matching screenshot rules
  const hasMinLength = password.length >= 12;
  const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const isMatch = password === confirmPassword && password.length > 0;
  const isValid = hasMinLength && hasNumberOrSymbol && isMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !token) return;

    try {
      setIsLoading(true);
      setErrorMsg(null);
      await authService.resetPassword(token, password);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Reset failed', err);
      setErrorMsg(
        err.response?.data?.detail?.[0]?.msg ||
          'Failed to reset password. The link may have expired.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-card">
        <div className="form-header">
          <h2 className="form-title">Reset Your Password</h2>
          <p className="form-subtitle">Create a new secure password for your account.</p>
        </div>

        {isSuccess ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              alignItems: 'center',
              marginTop: '10px',
            }}
          >
            <CheckCircle2 size={48} color="var(--color-brand-teal)" />
            <p style={{ textAlign: 'center', color: 'var(--color-text-grey)' }}>
              Your password has been successfully reset.
            </p>
            <button type="button" className="auth-submit-btn" onClick={onBackToLogin}>
              Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {errorMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
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
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="new-password" className="input-label">
                New Password
              </label>
              <div className="input-wrapper">
                <input
                  id="new-password"
                  type={showPassword1 ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input-field has-icon-right"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword1(!showPassword1)}
                  className="input-icon-btn-right"
                >
                  {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password" className="input-label">
                Confirm Password
              </label>
              <div className="input-wrapper">
                <input
                  id="confirm-password"
                  type={showPassword2 ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input-field has-icon-right"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="input-icon-btn-right"
                >
                  {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Rules Checklist */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '0.8rem',
                color: 'var(--color-text-grey)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {hasMinLength ? (
                  <CheckCircle2 size={14} color="var(--color-brand-teal)" />
                ) : (
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: '1px solid #cbd5e1',
                      marginLeft: '1px',
                    }}
                  />
                )}
                <span style={{ color: hasMinLength ? 'var(--color-text-dark)' : 'inherit' }}>
                  At least 12 characters long
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {hasNumberOrSymbol ? (
                  <CheckCircle2 size={14} color="var(--color-brand-teal)" />
                ) : (
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: '1px solid #cbd5e1',
                      marginLeft: '1px',
                    }}
                  />
                )}
                <span style={{ color: hasNumberOrSymbol ? 'var(--color-text-dark)' : 'inherit' }}>
                  Includes a number or symbol
                </span>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading || !isValid}>
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Resetting...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>

            <button
              type="button"
              className="back-link"
              onClick={onBackToLogin}
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '12px' }}
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
