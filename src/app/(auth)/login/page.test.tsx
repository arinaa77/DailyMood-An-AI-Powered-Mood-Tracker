// Integration test — LoginPage with mocked Supabase and Next.js router
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock next/navigation ───────────────────────────────────────────────────
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => '/login',
}));

// ── Mock Supabase client ───────────────────────────────────────────────────
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
    },
  }),
}));

// ── Import after mocks ─────────────────────────────────────────────────────
import LoginPage from './page';

describe('LoginPage (integration)', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockRefresh.mockReset();
    mockSignIn.mockReset();
    mockSignUp.mockReset();
  });

  // ── Render ──────────────────────────────────────────────────────────────
  it('renders the DailyMood heading', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'DailyMood' })).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('starts in sign-in mode (shows "Welcome back")', () => {
    render(<LoginPage />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  // ── Toggle sign-up / sign-in ─────────────────────────────────────────
  it('toggles to sign-up mode when "Sign up" link is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('toggles back to sign-in mode from sign-up mode', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.click(screen.getByRole('button', { name: 'Sign up' }));
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  // ── Successful sign in ──────────────────────────────────────────────
  it('calls signInWithPassword with the entered credentials', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('redirects to /log after successful sign in', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/log'));
  });

  // ── Error handling ──────────────────────────────────────────────────
  it('displays an error message when sign in fails', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'bad@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });

  it('clears the error when toggling between sign-in and sign-up', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'bad@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // ── Sign up ────────────────────────────────────────────────────────
  it('calls signUp when in sign-up mode', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: 'Sign up' }));
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/password/i), 'newpass123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'newpass123',
    });
  });

  // ── Loading state ───────────────────────────────────────────────────
  it('disables the submit button while the request is in flight', async () => {
    let resolve!: () => void;
    mockSignIn.mockReturnValue(new Promise<{ error: null }>((r) => { resolve = () => r({ error: null }); }));

    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'a@b.com');
    await user.type(screen.getByLabelText(/password/i), 'pass123');
    void user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Please wait/i })).toBeDisabled();
    });

    resolve();
  });
});
