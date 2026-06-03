import { screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from './ProfilePage';
import api from '../api';
import { setMockAuth, renderWithRouter, mockNavigate } from '../test-utils';

jest.mock('../api');
jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

const user = {
  id: 1,
  name: 'User',
  email: 'u@test.com',
  role: 'user',
  active: true,
  email_verified: true,
  verification_status: 'verified',
  mobile_number: '9999999999',
};

describe('ProfilePage', () => {
  beforeEach(() => {
    setMockAuth({ user, updateUser: jest.fn() });
    api.get.mockResolvedValue({ data: { user } });
  });

  it('loads profile and shows user name', async () => {
    renderWithRouter(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'User' })).toBeInTheDocument();
    });
  });

  it('updates profile on save', async () => {
    api.patch.mockResolvedValueOnce({
      data: { user: { ...user, name: 'Updated' } },
    });
    renderWithRouter(<ProfilePage />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'User' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'profile.edit' }));
    fireEvent.change(screen.getByDisplayValue('User'), { target: { value: 'Updated' } });
    fireEvent.click(screen.getByRole('button', { name: 'profile.save' }));
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/profile', expect.any(Object));
      expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });
  });

  it('uploads avatar image', async () => {
    api.post.mockResolvedValueOnce({ data: { user: { ...user, avatar_url: '/uploads/a.jpg' } } });
    renderWithRouter(<ProfilePage />);
    await waitFor(() => expect(screen.getByText('Change Photo')).toBeInTheDocument());

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/profile/avatar', expect.any(FormData), expect.any(Object));
      expect(screen.getByText('Profile picture updated')).toBeInTheDocument();
    });
  });

  it('rejects invalid avatar file type', async () => {
    renderWithRouter(<ProfilePage />);
    await waitFor(() => expect(screen.getByText('Change Photo')).toBeInTheDocument());

    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });
    await waitFor(() => expect(screen.getByText('Only image files allowed')).toBeInTheDocument());
  });

  it('changes email with OTP verification', async () => {
    api.post
      .mockResolvedValueOnce({ data: { message: 'Code sent' } })
      .mockResolvedValueOnce({ data: { user: { ...user, email: 'new@test.com' } } });
    renderWithRouter(<ProfilePage />);
    await waitFor(() => expect(screen.getByText('profile.change_email')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'profile.change_email' }));
    fireEvent.change(screen.getByPlaceholderText('new@email.com'), { target: { value: 'new@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'profile.send_code' }));
    await waitFor(() => expect(screen.getByText('Code sent')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('profile.enter_code_placeholder'), { target: { value: '654321' } });
    fireEvent.click(screen.getByRole('button', { name: 'profile.verify_update' }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/profile/verify_email_change', { otp_code: '654321' });
      expect(screen.getByText('Email updated successfully!')).toBeInTheDocument();
    });
  });

  it('navigates via quick actions', async () => {
    renderWithRouter(<ProfilePage />);
    await waitFor(() => expect(screen.getByText('profile.browse_packages')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'profile.browse_packages' }));
    expect(mockNavigate).toHaveBeenCalledWith('/packages');
  });
});
