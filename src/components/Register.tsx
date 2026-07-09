import React, { useState } from 'react';
import { Mail, Eye, EyeOff, ArrowRight, User, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '@/features/auth/auth.service';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ 
  onRegisterSuccess, 
  onNavigateToLogin 
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validation
  const hasMinLength = password.length >= 8; // OpenAPI schema says minLength: 8 for UserCreate
  const isValid = username.length >= 3 && email.includes('@') && hasMinLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      setIsLoading(true);
      setErrorMsg(null);
      await authService.register({ username, email, password });
      onRegisterSuccess();
    } catch (err: any) {
      console.error('Registration failed', err);
      // Display the validation detail from FastAPI if present
      setErrorMsg(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Registration failed. Username or email may already be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-card no-card">
        <div className="form-header">
          <h2 className="form-title">Create an Account</h2>
          <p className="form-subtitle">Join the institutional-grade AI trading platform.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate style={{ marginTop: '12px' }}>
          
          {errorMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px',
              fontSize: '0.85rem', fontWeight: 500
            }} role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="reg-username" className="input-label">Username</label>
            <div className="input-wrapper">
              <span className="input-icon-left" aria-hidden="true">
                <User size={18} />
              </span>
              <input
                id="reg-username"
                type="text"
                placeholder="trader_john"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input-field has-icon-left"
                autoComplete="username"
                disabled={isLoading}
                required
                minLength={3}
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-email" className="input-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon-left" aria-hidden="true">
                <Mail size={18} />
              </span>
              <input
                id="reg-email"
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
            <label htmlFor="reg-password" className="input-label">Password</label>
            <div className="input-wrapper">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input-field has-icon-right"
                autoComplete="new-password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-icon-btn-right"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading || !isValid} style={{ marginTop: '12px' }}>
            {isLoading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Sign Up</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <span className="footer-grey-text">Already have an account? </span>
          <button 
            type="button" 
            className="auth-link" 
            style={{ color: 'var(--color-brand-teal)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            onClick={onNavigateToLogin}
          >
            Sign In
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
