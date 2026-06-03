import { screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import api from '../api';
import { setMockAuth, renderWithRouter } from '../test-utils';

jest.mock('../api');
jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

describe('Dashboard', () => {
  beforeEach(() => {
    setMockAuth({ user: { id: 1, name: 'User', role: 'user', active: true }, logout: jest.fn() });
  });

  it('loads and displays user bookings', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        bookings: [{
          id: 1,
          package_name: 'Pack A',
          status: 'pending',
          amount: 1000,
          event_start_date: '2026-08-01',
          event_end_date: '2026-08-02',
          created_at: new Date().toISOString(),
        }],
      },
    });
    renderWithRouter(<Dashboard />);
    await waitFor(() => {
      expect(screen.getAllByText('Pack A').length).toBeGreaterThan(0);
    });
  });
});
