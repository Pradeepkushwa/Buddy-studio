import { screen } from '@testing-library/react';
import AdminLayout from './AdminLayout';
import { setMockAuth, renderWithRouter } from '../../test-utils';

jest.mock('../../components/NotificationBell', () => () => <div data-testid="notification-bell" />);
jest.mock('../../context/AuthContext', () => require('../../test-utils/authMock').getAuthContextMock());

const Placeholder = () => <div>child-route</div>;

describe('AdminLayout', () => {
  beforeEach(() => {
    setMockAuth({ user: { name: 'Admin User', role: 'admin' }, logout: jest.fn() });
  });

  it('renders sidebar navigation and outlet', () => {
    renderWithRouter(
      <>
        <AdminLayout />
        <Placeholder />
      </>
    );
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });
});
