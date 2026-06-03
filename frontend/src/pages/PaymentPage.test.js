import { screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentPage from './PaymentPage';
import api from '../api';
import { setMockAuth, renderRoute, mockNavigate } from '../test-utils';

jest.mock('../api');
jest.mock('../context/AuthContext', () => require('../test-utils/authMock').getAuthContextMock());

const booking = {
  id: 5,
  package_name: 'Wedding Pack',
  status: 'pending',
  amount: 50000,
  event_start_date: '2026-08-01',
  event_end_date: '2026-08-02',
  event_address: 'Hall',
  phone_number: '+91 9999999999',
  email: 'u@test.com',
};

function mockRazorpay() {
  const instances = [];
  window.Razorpay = jest.fn((options) => {
    const instance = {
      open: jest.fn(),
      on: jest.fn((event, cb) => {
        if (event === 'payment.failed') instance._fail = cb;
      }),
      _options: options,
    };
    instances.push(instance);
    return instance;
  });
  window.Razorpay.__instances = instances;
  return instances;
}

describe('PaymentPage', () => {
  beforeEach(() => {
    setMockAuth({ token: 't', user: { id: 1, role: 'user' } });
    mockRazorpay();
    window.Razorpay = window.Razorpay || jest.fn();
  });

  it('shows message when booking is not found', async () => {
    api.get.mockResolvedValue({ data: { bookings: [] } });
    renderRoute(<PaymentPage />, { params: { id: '99' } });
    await waitFor(() => {
      expect(screen.getByText('payment.booking_not_found')).toBeInTheDocument();
    });
  });

  it('shows load error with login hint on 401', async () => {
    api.get.mockRejectedValue({ response: { status: 401 } });
    renderRoute(<PaymentPage />, { params: { id: '5' } });
    await waitFor(() => {
      expect(screen.getByText(/Please log in again/)).toBeInTheDocument();
    });
  });

  it('shows already paid state for confirmed booking', async () => {
    api.get.mockResolvedValue({ data: { bookings: [{ ...booking, status: 'confirmed', payment_id: 'pay_1' }] } });
    renderRoute(<PaymentPage />, { params: { id: '5' } });
    await waitFor(() => {
      expect(screen.getByText('payment.already_paid')).toBeInTheDocument();
    });
  });

  it('opens Razorpay checkout on pay now', async () => {
    api.get.mockResolvedValue({ data: { bookings: [booking] } });
    api.post.mockResolvedValueOnce({
      data: { order_id: 'order_1', key_id: 'key_test', amount: 5000000, currency: 'INR' },
    });
    renderRoute(<PaymentPage />, { params: { id: '5' } });
    await waitFor(() => expect(screen.getByText('payment.pay_now')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'payment.pay_now' }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/bookings/5/create_order');
      expect(window.Razorpay).toHaveBeenCalled();
      expect(window.Razorpay.__instances[0].open).toHaveBeenCalled();
    });
  });

  it('verifies payment in Razorpay handler and navigates', async () => {
    jest.useFakeTimers();
    api.get.mockResolvedValue({ data: { bookings: [booking] } });
    api.post
      .mockResolvedValueOnce({ data: { order_id: 'order_1', key_id: 'key', amount: 100, currency: 'INR' } })
      .mockResolvedValueOnce({ data: { ok: true } });
    renderRoute(<PaymentPage />, { params: { id: '5' } });
    await waitFor(() => expect(screen.getByText('payment.pay_now')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'payment.pay_now' }));
    await waitFor(() => expect(window.Razorpay).toHaveBeenCalled());

    const { handler } = window.Razorpay.__instances[0]._options;
    await handler({
      razorpay_payment_id: 'pay_x',
      razorpay_order_id: 'order_1',
      razorpay_signature: 'sig',
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/bookings/5/verify_payment', expect.any(Object));
      expect(screen.getByText('payment.success')).toBeInTheDocument();
    });

    jest.runAllTimers();
    expect(mockNavigate).toHaveBeenCalledWith('/my-bookings');
    jest.useRealTimers();
  });

  it('shows error when create order fails', async () => {
    api.get.mockResolvedValue({ data: { bookings: [booking] } });
    api.post.mockRejectedValueOnce({ response: { status: 503, data: { error: 'Gateway down' } } });
    renderRoute(<PaymentPage />, { params: { id: '5' } });
    await waitFor(() => expect(screen.getByText('payment.pay_now')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'payment.pay_now' }));
    await waitFor(() => {
      expect(screen.getByText('Gateway down')).toBeInTheDocument();
    });
  });
});
