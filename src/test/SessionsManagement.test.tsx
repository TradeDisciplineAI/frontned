import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsPage } from '@/pages/SettingsPage';
import { SecuritySessionsPage } from '@/pages/SecuritySessionsPage';
import { authService } from '@/features/auth/auth.service';
import { useUserStore } from '@/stores/userStore';
import type { UserSessionResponse } from '@/features/auth/auth.types';

// Mock dependencies
vi.mock('@/features/auth/auth.service', () => ({
  authService: {
    getSessions: vi.fn(),
    revokeSession: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
    getSubscriptionStatus: vi.fn().mockResolvedValue({
      subscription_tier: 'FREE',
      trades_count: 2,
      max_free_trades: 6,
      remaining_free_trades: 4,
      is_pro: false,
    }),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SettingsPage Security Navigation', () => {
  const mockUser = {
    id: 'user-001',
    username: 'testtrader',
    email: 'trader@example.com',
    role: 'user' as const,
    is_active: true,
    is_verified: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({
      user: mockUser,
      isAuthenticated: true,
      accessToken: 'fake-token',
    });
  });

  it('navigates to /security when clicking Security & Sessions tab in Settings', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    );

    const securityTabBtn = screen.getAllByRole('button', { name: /Security & Sessions/i })[0];
    if (securityTabBtn) {
      fireEvent.click(securityTabBtn);
    }

    expect(mockNavigate).toHaveBeenCalledWith('/security');
  });
});

describe('SecuritySessionsPage Dedicated Page Component', () => {
  const mockUser = {
    id: 'user-001',
    username: 'testtrader',
    email: 'trader@example.com',
    role: 'user' as const,
    is_active: true,
    is_verified: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const mockSessions: UserSessionResponse[] = [
    {
      id: 'sess-001',
      device_name: 'Chrome on macOS',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      created_at: '2026-08-19T10:00:00Z',
      last_used_at: '2026-08-19T12:00:00Z',
      is_current: true,
    },
    {
      id: 'sess-002',
      device_name: 'Safari on iPhone',
      ip_address: '192.168.1.2',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      created_at: '2026-08-18T10:00:00Z',
      last_used_at: '2026-08-18T12:00:00Z',
      is_current: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({
      user: mockUser,
      isAuthenticated: true,
      accessToken: 'fake-token',
    });
  });

  it('renders SecuritySessionsPage with real device images and sessions list', async () => {
    vi.mocked(authService.getSessions).mockResolvedValueOnce(mockSessions);

    render(
      <MemoryRouter>
        <SecuritySessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-sessions-list')).toBeInTheDocument();
    });

    expect(screen.getByText('SECURITY & ACTIVE SESSIONS')).toBeInTheDocument();
    expect(screen.getByText('Chrome on macOS')).toBeInTheDocument();
    expect(screen.getByAltText('Chrome on macOS')).toBeInTheDocument();
    expect(screen.getByText('CURRENT SESSION')).toBeInTheDocument();
    expect(authService.getSessions).toHaveBeenCalledTimes(1);
  });

  it('displays empty state when backend returns 0 sessions', async () => {
    vi.mocked(authService.getSessions).mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <SecuritySessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('sessions-empty-state')).toBeInTheDocument();
    });

    expect(screen.getByText('NO ACTIVE SESSIONS')).toBeInTheDocument();
  });

  it('displays error state when GET /auth/sessions fails', async () => {
    vi.mocked(authService.getSessions).mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <SecuritySessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('sessions-error-state')).toBeInTheDocument();
    });

    expect(screen.getByText(/Unable to load active sessions/i)).toBeInTheDocument();
  });

  it('handles DELETE /auth/sessions/{session_id} session revocation', async () => {
    vi.mocked(authService.getSessions).mockResolvedValueOnce(mockSessions);
    vi.mocked(authService.revokeSession).mockResolvedValueOnce();

    render(
      <MemoryRouter>
        <SecuritySessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('revoke-session-btn-sess-002')).toBeInTheDocument();
    });

    const revokeBtn = screen.getByTestId('revoke-session-btn-sess-002');
    fireEvent.click(revokeBtn);

    await waitFor(() => {
      expect(authService.revokeSession).toHaveBeenCalledWith('sess-002');
    });

    await waitFor(() => {
      expect(screen.queryByTestId('session-card-sess-002')).not.toBeInTheDocument();
    });
  });

  it('logs out and redirects to login when revoking current session', async () => {
    vi.mocked(authService.getSessions).mockResolvedValueOnce(mockSessions);
    vi.mocked(authService.revokeSession).mockResolvedValueOnce();

    render(
      <MemoryRouter>
        <SecuritySessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('revoke-session-btn-sess-001')).toBeInTheDocument();
    });

    const revokeCurrentBtn = screen.getByTestId('revoke-session-btn-sess-001');
    fireEvent.click(revokeCurrentBtn);

    await waitFor(() => {
      expect(authService.revokeSession).toHaveBeenCalledWith('sess-001');
    });

    await waitFor(() => {
      expect(useUserStore.getState().user).toBeNull();
      expect(useUserStore.getState().isAuthenticated).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('handles POST /auth/logout-all session revocation', async () => {
    vi.mocked(authService.getSessions).mockResolvedValueOnce(mockSessions);
    vi.mocked(authService.logoutAll).mockResolvedValueOnce();

    render(
      <MemoryRouter>
        <SecuritySessionsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('logout-all-btn')).toBeInTheDocument();
    });

    const logoutAllBtn = screen.getByTestId('logout-all-btn');
    fireEvent.click(logoutAllBtn);

    await waitFor(() => {
      expect(screen.getByTestId('confirm-logout-all-btn')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId('confirm-logout-all-btn');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(authService.logoutAll).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(useUserStore.getState().user).toBeNull();
      expect(useUserStore.getState().isAuthenticated).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
