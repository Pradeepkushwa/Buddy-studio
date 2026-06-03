import { screen, fireEvent, waitFor } from '@testing-library/react';
import BookingForm from './BookingForm';
import api from '../api';
import { setMockAuth, renderRoute, mockNavigate } from '../test-utils';

jest.mock('../api');
jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

const pkg = {
  id: 5,
  name: 'Event Pack',
  offer_price: 15000,
  price: 16000,
  discount_percentage: 0,
};

describe('BookingForm', () => {
  beforeEach(() => {
    setMockAuth({ token: 't', user: { id: 1, role: 'user', email: 'u@test.com', mobile_number: '9999999999' } });
    api.get.mockImplementation((url) => {
      if (url === '/packages/5') return Promise.resolve({ data: { package: pkg } });
      return Promise.resolve({ data: {} });
    });
  });

  it('loads package and shows booking form', async () => {
    renderRoute(<BookingForm />, { params: { id: '5' } });
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/packages/5');
      expect(screen.getByText('booking.event_details')).toBeInTheDocument();
    });
  });

  it('shows package not found when API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('404'));
    renderRoute(<BookingForm />, { params: { id: '5' } });
    await waitFor(() => expect(screen.getByText('booking.package_not_found')).toBeInTheDocument());
  });

  it('validates phone number', async () => {
    renderRoute(<BookingForm />, { params: { id: '5' } });
    await waitFor(() => expect(screen.getByText('booking.event_details')).toBeInTheDocument());

    fireEvent.change(document.querySelector('input[name="phone_number"]'), { target: { value: 'x' } });
    fireEvent.change(document.querySelector('input[name="event_start_date"]'), { target: { value: '2026-09-01' } });
    fireEvent.change(document.querySelector('input[name="event_end_date"]'), { target: { value: '2026-09-02' } });
    fireEvent.click(screen.getByRole('button', { name: 'booking.proceed_payment' }));
    await waitFor(() => expect(screen.getByText('booking.phone_error')).toBeInTheDocument());
  });

  it('submits booking and navigates to payment', async () => {
    api.post.mockResolvedValueOnce({ data: { booking: { id: 42 } } });
    renderRoute(<BookingForm />, { params: { id: '5' } });
    await waitFor(() => expect(screen.getByText('booking.event_details')).toBeInTheDocument());

    fireEvent.change(document.querySelector('input[name="event_start_date"]'), { target: { value: '2026-09-01' } });
    fireEvent.change(document.querySelector('input[name="event_end_date"]'), { target: { value: '2026-09-05' } });
    fireEvent.change(document.querySelector('textarea[name="event_address"]'), { target: { value: 'City Hall' } });
    fireEvent.change(document.querySelector('input[name="phone_number"]'), { target: { value: '9999999999' } });
    fireEvent.click(screen.getByRole('button', { name: 'booking.proceed_payment' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/bookings', expect.any(Object));
      expect(mockNavigate).toHaveBeenCalledWith('/bookings/42/payment');
    });
  });
});
