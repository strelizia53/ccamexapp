import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '@/app/login/page';

jest.mock('@/firebase/config', () => ({ auth: {} }));

const mockSignIn = jest.fn();
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args) => mockSignIn(...args),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockSignIn.mockReset();
  });

  it('shows success message on successful login', async () => {
    mockSignIn.mockResolvedValue({});
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/✅ Logged In/i)).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    mockSignIn.mockRejectedValue(new Error('fail'));
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/Invalid email or password/i)).toBeInTheDocument();
  });
});
