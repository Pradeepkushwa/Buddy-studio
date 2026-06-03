import { screen, fireEvent } from '@testing-library/react';
import PendingApproval from './PendingApproval';
import { setMockAuth, renderWithRouter } from '../test-utils';
import { mockNavigate } from '../test-utils/routerMock';

jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

const mockLogout = jest.fn();

describe('PendingApproval', () => {
  beforeEach(() => {
    setMockAuth({ user: { name: 'Staff User' }, logout: mockLogout });
  });

  it('shows staff name and logs out on button click', () => {
    renderWithRouter(<PendingApproval />);
    expect(screen.getByText('Staff User')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'auth.back_to_login_btn' }));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
