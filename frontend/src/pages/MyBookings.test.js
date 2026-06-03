import { screen, waitFor } from '@testing-library/react';
import MyBookings from './MyBookings';
import api from '../api';
import { renderWithRouter } from '../test-utils';

jest.mock('../api');

describe('MyBookings', () => {
  it.each([
    {
      name: 'empty state',
      data: { bookings: [] },
      expected: 'my_bookings.no_bookings',
    },
    {
      name: 'booking list',
      data: {
        bookings: [{
          id: 1,
          package_name: 'Wedding Pack',
          status: 'pending',
          event_start_date: '2026-07-01',
          event_end_date: '2026-07-02',
          event_address: 'Venue',
          phone_number: '9999999999',
          amount: 5000,
          created_at: new Date().toISOString(),
        }],
      },
      expected: 'Wedding Pack',
    },
  ])('shows $name', async ({ data, expected }) => {
    api.get.mockResolvedValueOnce({ data });
    renderWithRouter(<MyBookings />);
    await waitFor(() => {
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });
});
