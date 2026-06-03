import { screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyOtp from './VerifyOtp';
import { setMockAuth, renderWithRouter } from '../test-utils';
import { mockNavigate } from '../test-utils/routerMock';

jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

const mockVerifyOtp = jest.fn();

describe('VerifyOtp', () => {
  beforeEach(() => {
    setMockAuth({ verifyOtp: mockVerifyOtp, resendOtp: jest.fn() });
  });

  it('prompts signup when email is missing from navigation state', () => {
    renderWithRouter(<VerifyOtp />, { location: { pathname: '/verify-otp', state: null } });
    expect(screen.getByText('auth.no_email_title')).toBeInTheDocument();
  });

  it('verifies OTP and navigates to dashboard for customer', async () => {
    mockVerifyOtp.mockResolvedValueOnce({});
    renderWithRouter(<VerifyOtp />, {
      location: { pathname: '/verify-otp', state: { email: 'u@test.com', role: 'user' } },
    });
    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.verify_btn' }));
    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith('u@test.com', '123456');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
