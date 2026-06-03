import { screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationBell from './NotificationBell';
import api from '../api';
import { renderWithRouter } from '../test-utils';

jest.mock('../api');

const sampleNotification = {
  id: 1,
  title: 'New Booking',
  message: 'Someone booked',
  notification_type: 'new_booking',
  link: '/admin/bookings',
  read: false,
  created_at: new Date().toISOString(),
};

describe('NotificationBell', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    api.get.mockResolvedValue({
      data: { notifications: [sampleNotification], unread_count: 1 },
    });
    api.patch.mockResolvedValue({ data: { unread_count: 0 } });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows unread badge and opens dropdown with notifications', async () => {
    renderWithRouter(<NotificationBell />);
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Notifications'));
    expect(screen.getByText('New Booking')).toBeInTheDocument();
  });
});
