import React from 'react';

export const mockNavigate = jest.fn();
export let mockLocation = { pathname: '/', state: null, search: '' };
export let mockParams = {};

export function setMockLocation(overrides = {}) {
  mockLocation = { pathname: '/', state: null, search: '', ...overrides };
}

export function setMockParams(params = {}) {
  mockParams = params;
}

export function resetRouterMock() {
  mockNavigate.mockClear();
  mockLocation = { pathname: '/', state: null, search: '' };
  mockParams = {};
}

export function getRouterMock() {
  return {
    MemoryRouter: ({ children }) => <div data-testid="memory-router">{children}</div>,
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <>{children}</>,
    Route: ({ element }) => element ?? null,
    Navigate: () => null,
    Link: ({ children, to, ...rest }) => (
      <a href={to} {...rest}>{children}</a>
    ),
    NavLink: ({ children, to, className }) => {
      const cls = typeof className === 'function' ? className({ isActive: false }) : className;
      return <a href={to} className={cls}>{children}</a>;
    },
    Outlet: () => null,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
    useLocation: () => mockLocation,
    useSearchParams: () => [new URLSearchParams(mockLocation.search || ''), jest.fn()],
  };
}
