import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '@/components/ui/AuthLayout/AuthLayout';

interface SuccessPageProps {
  onNavigateToDashboard: () => void;
  onBackToLogin: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ 
  onNavigateToDashboard, 
  onBackToLogin 
}) => {
  return (
    <AuthLayout>
      <div className="auth-form-card no-card" style={{ alignItems: 'center', textAlign: 'center', maxWidth: '380px' }}>
        
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', 
          backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', marginBottom: '8px' 
        }}>
          <CheckCircle2 size={36} color="var(--color-brand-teal)" strokeWidth={2.5} />
        </div>

        <div className="form-header" style={{ alignItems: 'center' }}>
          <h2 className="form-title">Success!</h2>
          <p className="form-subtitle">Your account has been created successfully.</p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <button 
            className="auth-submit-btn" 
            onClick={onNavigateToDashboard}
            style={{ width: '100%' }}
          >
            <span>Go to Sign In</span>
            <ArrowRight size={18} />
          </button>

          <button 
            type="button" 
            className="back-link" 
            onClick={onBackToLogin}
            style={{ background: 'none', border: 'none', cursor: 'pointer', margin: 0 }}
          >
            Back to Sign In
          </button>
        </div>

        {/* Onboarding Tip Card matching Screenshot 4 */}
        <div style={{ 
          marginTop: '32px', padding: '16px', 
          backgroundColor: '#f8fafc', border: '1px solid #f1f5f9', 
          borderRadius: '8px', textAlign: 'left', width: '100%' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-brand-teal)' }}>
            <ShieldCheck size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>ONBOARDING TIP</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-grey)', lineHeight: 1.5 }}>
            Connect your broker API in the next step to enable real-time risk mitigation alerts.
          </p>
        </div>

      </div>
    </AuthLayout>
  );
};
