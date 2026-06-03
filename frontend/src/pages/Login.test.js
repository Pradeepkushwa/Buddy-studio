import { screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { setMockAuth, renderWithRouter } from '../test-utils';
import { mockNavigate } from '../test-utils/routerMock';

jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

const mockLogin = jest.fn();

describe('Login', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    setMockAuth({ login: mockLogin });
  });

  it('renders email and password fields', () => {
    renderWithRouter(<Login />);
    expect(screen.getByLabelText('auth.email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('auth.password_placeholder')).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { error: 'Invalid email or password' } },
    });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText('auth.email'), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('auth.password_placeholder'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.log_in' }));
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it.each([
    { role: 'admin', destination: '/admin' },
    { role: 'user', destination: '/dashboard' },
  ])('navigates to $destination after $role login', async ({ role, destination }) => {
    mockLogin.mockResolvedValueOnce({ user: { role } });
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText('auth.email'), { target: { value: `${role}@test.com` } });
    fireEvent.change(screen.getByPlaceholderText('auth.password_placeholder'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.log_in' }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith(destination));
  });
});
