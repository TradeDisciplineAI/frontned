import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { GlobeView } from '@/features/globe/GlobeView';
import { Login } from '@/components/Login';
import { Register } from '@/components/Register';
import { ForgotPassword } from '@/components/ForgotPassword';
import { ResetPassword } from '@/components/ResetPassword';
import { SuccessPage } from '@/components/SuccessPage';
import { VerifyEmail } from '@/components/VerifyEmail';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { useUserStore } from '@/stores/userStore';
import { ROUTES } from '@/constants/routes.constants';

if (window.location.pathname === '/verify-email') {
  const search = window.location.search;
  window.location.replace(window.location.origin + '/#/verify-email' + search);
}

function AppContent() {
  const navigate = useNavigate();
  const { logout, initAuth, user } = useUserStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Run once on app load to restore session via HttpOnly cookie if present
  useEffect(() => {
    const initializeSession = async () => {
      await initAuth();
      setIsInitializing(false);
    };
    initializeSession();
  }, [initAuth]);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  if (isInitializing) {
    // A simple full-screen loader while we verify the session
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#0b1120',
          color: '#fff',
        }}
      >
        <h2>Starting Terminal...</h2>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing */}
      <Route path={ROUTES.HOME} element={<GlobeView onEnterApp={() => navigate(ROUTES.LOGIN)} />} />

      {/* Auth Flows */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <Login
            onLoginSuccess={() => navigate(ROUTES.DASHBOARD)}
            onNavigateToSignup={() => navigate(ROUTES.REGISTER)}
            onNavigateToForgot={() => navigate(ROUTES.FORGOT_PASSWORD)}
          />
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <Register
            onRegisterSuccess={() => navigate(ROUTES.SUCCESS)}
            onNavigateToLogin={() => navigate(ROUTES.LOGIN)}
          />
        }
      />
      <Route
        path={ROUTES.SUCCESS}
        element={
          <SuccessPage
            onNavigateToDashboard={() => navigate(ROUTES.LOGIN)} // Needs to login first
            onBackToLogin={() => navigate(ROUTES.LOGIN)}
          />
        }
      />
      <Route
        path={ROUTES.VERIFY_EMAIL}
        element={<VerifyEmail />}
      />
      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={<ForgotPassword onBackToLogin={() => navigate(ROUTES.LOGIN)} />}
      />
      <Route
        path={ROUTES.RESET_PASSWORD}
        element={<ResetPassword onBackToLogin={() => navigate(ROUTES.LOGIN)} />}
      />

      {/* Protected Routes */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <AuthGuard>
            <DashboardPage user={user} onLogout={handleLogout} />
          </AuthGuard>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
