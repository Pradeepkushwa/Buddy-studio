import { screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from './Signup';
import { setMockAuth, renderWithRouter } from '../test-utils';
import { mockNavigate } from '../test-utils/routerMock';

jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

const mockSignup = jest.fn();

describe('Signup', () => {
  beforeEach(() => {
    mockSignup.mockClear();
    setMockAuth({ signup: mockSignup, updateUser: jest.fn() });
  });

  it('shows error when passwords do not match', async () => {
    renderWithRouter(<Signup />);
    fireEvent.change(screen.getByLabelText('auth.password'), { target: { value: 'abc123' } });
    fireEvent.change(screen.getByLabelText('auth.confirm_password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.sign_up' }));
    await waitFor(() => {
      expect(screen.getByText('auth.passwords_no_match')).toBeInTheDocument();
    });
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('navigates to verify-otp when signup requires OTP', async () => {
    mockSignup.mockResolvedValueOnce({
      requires_otp: true,
      email: 'new@test.com',
      role: 'user',
    });
    renderWithRouter(<Signup />);
    fireEvent.change(screen.getByLabelText('auth.full_name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('auth.email'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByLabelText('auth.password'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('auth.confirm_password'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.sign_up' }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/verify-otp', {
        state: { email: 'new@test.com', role: 'user' },
      });
    });
  });
});
