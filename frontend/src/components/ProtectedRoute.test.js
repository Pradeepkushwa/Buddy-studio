import { screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { setMockAuth, renderWithRouter } from '../test-utils';

jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

const Child = () => <div>protected-content</div>;
const renderProtected = (props = {}) =>
  renderWithRouter(
    <ProtectedRoute {...props}><Child /></ProtectedRoute>
  );

describe('ProtectedRoute', () => {
  it('shows loading state', () => {
    setMockAuth({ loading: true });
    renderProtected();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders children for authenticated active user', () => {
    setMockAuth({ token: 'tok', user: { id: 1, role: 'user', active: true } });
    renderProtected();
    expect(screen.getByText('protected-content')).toBeInTheDocument();
  });

  it.each([
    {
      name: 'unauthenticated users',
      auth: { token: null, user: null },
      props: {},
    },
    {
      name: 'inactive staff',
      auth: { token: 'tok', user: { id: 1, role: 'staff', active: false } },
      props: { requiredRole: 'staff' },
    },
    {
      name: 'wrong role',
      auth: { token: 'tok', user: { id: 1, role: 'user', active: true } },
      props: { requiredRole: 'admin' },
    },
  ])('blocks $name', ({ auth, props }) => {
    setMockAuth(auth);
    renderProtected(props);
    expect(screen.queryByText('protected-content')).not.toBeInTheDocument();
  });
});
