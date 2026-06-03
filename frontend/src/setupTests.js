import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { changeLanguage: jest.fn(), language: 'en' } }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

jest.mock('./i18n', () => ({
  __esModule: true,
  default: { changeLanguage: jest.fn(), language: 'en' },
}));

jest.mock('react-router-dom', () => require('./test-utils/routerMock').getRouterMock());

jest.mock('./components/Navbar', () => () => <nav data-testid="navbar" />);

afterEach(() => {
  localStorage.clear();
  require('./test-utils/routerMock').resetRouterMock();
  require('./test-utils/authMock').setMockAuth();
});
