import { render } from '@testing-library/react';
import App from './App';

jest.mock('./i18n', () => ({
  __esModule: true,
  default: { changeLanguage: jest.fn(), language: 'en' },
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });
});
