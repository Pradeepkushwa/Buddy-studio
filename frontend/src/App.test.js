import { render } from '@testing-library/react';

// Mock heavy dependencies so this test stays fast and isolated
jest.mock('./i18n', () => ({}));
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
  Navigate: () => null,
  Link: ({ children }) => <a>{children}</a>,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams()],
}));
jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({ user: null, loading: false }),
}));

import App from './App';

test('renders App without crashing', () => {
  render(<App />);
  expect(document.body).toBeInTheDocument();
});
