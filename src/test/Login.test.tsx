import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '../components/Login';
import { authService } from '../features/auth/auth.service';

// Mock the authService
vi.mock('../features/auth/auth.service', () => ({
  authService: {
    login: vi.fn(),
    getMe: vi.fn(),
  },
}));

/**
 * Helper to render the Login component within a Router context.
 */
const renderLogin = (onSuccess = vi.fn()) =>
  render(
    <MemoryRouter>
      <Login onLoginSuccess={onSuccess} />
    </MemoryRouter>,
  );

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password input fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/^email address$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('does not call authService when email is empty', () => {
    const onSuccess = vi.fn();
    renderLogin(onSuccess);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(authService.login).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('does not call authService when password is empty', () => {
    const onSuccess = vi.fn();
    renderLogin(onSuccess);
    fireEvent.change(screen.getByLabelText(/^email address$/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(authService.login).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('calls authService and onSuccess when credentials are valid', async () => {
    const onSuccess = vi.fn();

    // Setup mock implementations
    (authService.login as any).mockResolvedValueOnce({
      access_token: 'test-token',
      token_type: 'bearer',
    });
    (authService.getMe as any).mockResolvedValueOnce({
      id: '1',
      username: 'trader',
      email: 'trader@example.com',
    });

    renderLogin(onSuccess);

    fireEvent.change(screen.getByLabelText(/^email address$/i), {
      target: { value: 'trader@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'securePassword123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('trader@example.com', 'securePassword123');
      expect(authService.getMe).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('displays an error message when login fails', async () => {
    const onSuccess = vi.fn();

    // Setup mock to throw an error
    (authService.login as any).mockRejectedValueOnce({ response: { status: 401 } });

    renderLogin(onSuccess);

    fireEvent.change(screen.getByLabelText(/^email address$/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('toggles password visibility when the eye button is clicked', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText(/^password$/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
