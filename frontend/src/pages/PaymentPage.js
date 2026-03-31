import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  const fetchBooking = useCallback(() => {
    setLoadError('');
    api.get('/bookings/mine')
      .then(r => {
        const found = r.data.bookings.find(b => b.id === parseInt(id, 10));
        setBooking(found || null);
        if (!found) setLoadError('Booking not found.');
      })
      .catch((err) => {
        setBooking(null);
        const msg = err.response?.data?.error || (err.response?.status === 401 ? 'Please log in again.' : 'Could not load booking. Please try again.');
        setLoadError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const formatPrice = (p) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);

  const handlePayNow = async () => {
    if (!booking || paying) return;
    setError('');
    setPaying(true);
    try {
      const orderRes = await api.post(`/bookings/${id}/create_order`);
      const { order_id, key_id, amount, currency } = orderRes.data;
      await loadRazorpayScript();
      const options = {
        key: key_id,
        amount,
        currency,
        order_id,
        name: 'Buddy Studio',
        description: `Booking: ${booking.package_name}`,
        prefill: {
          email: booking.email || '',
          contact: (booking.phone_number || '').replace(/\D/g, '').slice(-10)
        },
        handler: async (response) => {
          try {
            await api.post(`/bookings/${id}/verify_payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            setPaymentSuccess(true);
            setTimeout(() => navigate('/my-bookings'), 2000);
          } catch (err) {
            setError(err.response?.data?.error || 'Payment verification failed. Please contact support.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false)
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setError('Payment failed or was cancelled.');
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err.response?.data?.error || (err.response?.status === 503 ? 'Payment gateway is not configured. Add Razorpay keys to backend .env.' : 'Could not start payment. Please try again.');
      setError(msg);
      setPaying(false);
    }
  };

  if (loading) return <div className="home-page"><Navbar /><p className="empty-state">Loading...</p></div>;
  if (!booking) return <div className="home-page"><Navbar /><p className="empty-state">{loadError || 'Booking not found.'} <Link to="/my-bookings">My Bookings</Link>{loadError && loadError.includes('log in') ? <> · <Link to="/login">Log in</Link></> : null}</p></div>;

  const alreadyPaid = booking.status === 'confirmed' || booking.payment_id;

  return (
    <div className="home-page">
      <Navbar />
      <div className="page-header">
        <h1>Payment</h1>
      </div>

      <section className="section">
        <div className="payment-card">
          <div className="payment-summary">
            <h3>Booking Summary</h3>
            <div className="payment-row"><span>Package</span><strong>{booking.package_name}</strong></div>
            <div className="payment-row"><span>Event Dates</span><strong>{booking.event_start_date} to {booking.event_end_date}</strong></div>
            <div className="payment-row"><span>Venue</span><strong>{booking.event_address}</strong></div>
            <div className="payment-row"><span>Contact</span><strong>{booking.phone_number}</strong></div>
            <hr />
            <div className="payment-row payment-total"><span>Total Amount</span><strong>{formatPrice(booking.amount)}</strong></div>
          </div>

          <div className="payment-action">
            {paymentSuccess && (
              <p className="payment-success">Payment successful! Redirecting to My Bookings...</p>
            )}
            {!paymentSuccess && error && <p className="payment-error">{error}</p>}
            {alreadyPaid ? (
              <>
                <p className="payment-completed">Payment completed for this booking.</p>
                <div className="payment-links">
                  <Link to="/my-bookings" className="btn-hero-outline">View My Bookings</Link>
                  <Link to="/packages" className="btn-secondary">Browse More Packages</Link>
                </div>
              </>
            ) : (
              <>
                <button
                  className="btn-primary btn-pay"
                  onClick={handlePayNow}
                  disabled={paying}
                >
                  {paying ? 'Opening...' : 'Pay Now'}
                </button>
                <p className="payment-note">
                  Pay securely via UPI, debit/credit card, or netbanking. You will be redirected to complete payment.
                </p>
                <div className="payment-links">
                  <Link to="/my-bookings" className="btn-hero-outline">View My Bookings</Link>
                  <Link to="/packages" className="btn-secondary">Browse More Packages</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
