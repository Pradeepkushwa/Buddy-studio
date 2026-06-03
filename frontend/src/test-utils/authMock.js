const defaultFns = () => ({
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  verifyOtp: jest.fn(),
  resendOtp: jest.fn(),
  updateUser: jest.fn(),
});

let mockAuthValue = {
  user: null,
  token: null,
  loading: false,
  ...defaultFns(),
};

/** Set auth state for the current test (call in beforeEach). */
export function setMockAuth(overrides = {}) {
  mockAuthValue = {
    user: null,
    token: null,
    loading: false,
    ...defaultFns(),
    ...overrides,
  };
}

export function getAuthContextMock() {
  return {
    useAuth: () => mockAuthValue,
    AuthProvider: ({ children }) => children,
  };
}

// Initialise defaults for jest.mock factory (hoisted)
setMockAuth();
