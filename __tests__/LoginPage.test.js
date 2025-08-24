import { render, screen, fireEvent } from '@testing-library/react';

// Mock Firebase config and auth modules before importing the page
jest.mock('@/firebase/config', () => ({ auth: {} }), { virtual: true });
const mockSignIn = jest.fn();
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args) => mockSignIn(...args),
}));

import LoginPage from '@/app/login/page';

describe('LoginPage', () => {
  beforeEach(() => {
    mockSignIn.mockReset();
  });

  it('alerts when required fields are empty', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(alertSpy).toHaveBeenCalledWith('Please fill in all fields.');
    expect(mockSignIn).not.toHaveBeenCalled();
    alertSpy.mockRestore();
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

