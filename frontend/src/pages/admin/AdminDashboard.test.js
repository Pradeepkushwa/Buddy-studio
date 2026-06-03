import { screen, waitFor } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import api from '../../api';
import { setMockAuth, renderWithRouter } from '../../test-utils';

jest.mock('../../api');
jest.mock('../../context/AuthContext', () => require('../../test-utils/authMock').getAuthContextMock());

describe('AdminDashboard', () => {
  beforeEach(() => {
    setMockAuth({ user: { name: 'Admin', role: 'admin' } });
  });

  it('renders stats after dashboard API loads', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        users: { total: 10, customers: 8, staff: 2 },
        bookings: { total: 5, pending: 2, confirmed: 3 },
        appointments: { total: 1, new: 1 },
        packages: { total: 4, pending_approval: 1 },
        reviews: { total: 3, pending: 1, average_rating: 4.2 },
        gallery: { total: 6 },
      },
    });
    renderWithRouter(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Good (morning|afternoon|evening)/)).toBeInTheDocument();
    });
  });
});
