import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// Only override the hooks we need — don't spread requireActual
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => <div>{children}</div>,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams()],
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

beforeEach(() => jest.clearAllMocks());

test('renders email and password fields', () => {
  renderLogin();
  expect(screen.getByLabelText('auth.email')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('auth.password_placeholder')).toBeInTheDocument();
});

test('renders login submit button', () => {
  renderLogin();
  expect(screen.getByRole('button', { name: 'auth.log_in' })).toBeInTheDocument();
});

test('displays error on failed login', async () => {
  mockLogin.mockRejectedValueOnce({
    response: { data: { error: 'Invalid email or password' } },
  });
  renderLogin();
  fireEvent.change(screen.getByLabelText('auth.email'), { target: { value: 'bad@test.com' } });
  fireEvent.change(screen.getByPlaceholderText('auth.password_placeholder'), { target: { value: 'wrong' } });
  fireEvent.click(screen.getByRole('button', { name: 'auth.log_in' }));
  await waitFor(() => {
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });
});

test('navigates to /admin on admin login', async () => {
  mockLogin.mockResolvedValueOnce({ user: { role: 'admin' } });
  renderLogin();
  fireEvent.change(screen.getByLabelText('auth.email'), { target: { value: 'admin@test.com' } });
  fireEvent.change(screen.getByPlaceholderText('auth.password_placeholder'), { target: { value: 'Password123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'auth.log_in' }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin'));
});

test('navigates to /dashboard on user login', async () => {
  mockLogin.mockResolvedValueOnce({ user: { role: 'user' } });
  renderLogin();
  fireEvent.change(screen.getByLabelText('auth.email'), { target: { value: 'user@test.com' } });
  fireEvent.change(screen.getByPlaceholderText('auth.password_placeholder'), { target: { value: 'Password123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'auth.log_in' }));
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
});
