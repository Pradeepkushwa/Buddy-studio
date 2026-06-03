import { screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from './ForgotPassword';
import api from '../api';
import { renderWithRouter, mockNavigate } from '../test-utils';

jest.mock('../api');

async function completeStep1(email = 'user@test.com') {
  api.post.mockResolvedValueOnce({ data: { message: 'Code sent' } });
  renderWithRouter(<ForgotPassword />);
  fireEvent.change(screen.getByLabelText('auth.email_address'), { target: { value: email } });
  fireEvent.click(screen.getByRole('button', { name: 'auth.send_reset_code' }));
  await waitFor(() => expect(screen.getByText('Code sent')).toBeInTheDocument());
}

describe('ForgotPassword', () => {
  it.each([
    {
      name: 'failure on step 1',
      run: async () => {
        api.post.mockRejectedValueOnce({ response: { data: { error: 'No account found' } } });
        renderWithRouter(<ForgotPassword />);
        fireEvent.change(screen.getByLabelText('auth.email_address'), { target: { value: 'missing@test.com' } });
        fireEvent.click(screen.getByRole('button', { name: 'auth.send_reset_code' }));
        await waitFor(() => expect(screen.getByText('No account found')).toBeInTheDocument());
      },
    },
  ])('$name', async ({ run }) => {
    await run();
  });

  it('completes OTP verify and password reset flow', async () => {
    await completeStep1();

    api.post.mockResolvedValueOnce({ data: { message: 'Code verified' } });
    fireEvent.change(screen.getByLabelText('auth.six_digit_code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.verify_code' }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/password/verify_otp', { email: 'user@test.com', otp_code: '123456' });
      expect(screen.getByText('Code verified')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('auth.new_password'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText('auth.confirm_password_label'), { target: { value: 'newpass123' } });
    api.post.mockResolvedValueOnce({ data: { message: 'Password updated' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.reset_password' }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/password/reset', expect.objectContaining({
        email: 'user@test.com',
        otp_code: '123456',
        password: 'newpass123',
      }));
      expect(screen.getByText('Password updated')).toBeInTheDocument();
    });

  });

  it('resends OTP on step 2', async () => {
    await completeStep1();
    api.post.mockResolvedValueOnce({ data: { message: 'Resent' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.resend_code' }));
    await waitFor(() => expect(screen.getByText('Resent')).toBeInTheDocument());
  });

  it('shows password mismatch on step 3', async () => {
    await completeStep1();
    api.post.mockResolvedValueOnce({ data: { message: 'Code verified' } });
    fireEvent.change(screen.getByLabelText('auth.six_digit_code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.verify_code' }));
    await waitFor(() => expect(screen.getByText('Code verified')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('auth.new_password'), { target: { value: 'abc123' } });
    fireEvent.change(screen.getByLabelText('auth.confirm_password_label'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: 'auth.reset_password' }));
    await waitFor(() => expect(screen.getByText('auth.passwords_no_match')).toBeInTheDocument());
  });
});
