import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { paymentApi, bookingApi } from '../services/api';
import PaymentForm from '../components/payment/PaymentForm';
import './Checkout.css';

const Checkout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');

  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    initializePayment();
  }, [bookingId]);

  const initializePayment = async () => {
    try {
      setLoading(true);

      // Fetch Stripe publishable key
      const configResponse = await paymentApi.getConfig();
      const { publishableKey } = configResponse.data.data;

      // Initialize Stripe
      const stripe = loadStripe(publishableKey);
      setStripePromise(stripe);

      // Fetch booking details
      const bookingResponse = await bookingApi.getById(bookingId!);
      const bookingData = bookingResponse.data.data.booking || bookingResponse.data.data;
      setBooking(bookingData);

      // Create payment intent
      const paymentResponse = await paymentApi.createPaymentIntent(bookingId!);
      const paymentData = paymentResponse.data.data;
      const clientSecret = paymentData.clientSecret || paymentData;
      setClientSecret(clientSecret);
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to initialize payment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log('Payment successful');
    // The page will redirect automatically to the return_url
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="checkout-loading">
            <div className="spinner-large"></div>
            <p>Initializing payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking || !clientSecret || !stripePromise) {
    return (
      <div className="page">
        <div className="container">
          <div className="checkout-error card">
            <h2>Payment Error</h2>
            <p>{error || 'Unable to load payment details'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
              Go to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Complete Your Booking</h1>
            <p>Secure payment powered by Stripe</p>
          </div>

          <div className="checkout-content">
            <div className="booking-summary card">
              <h2>Booking Summary</h2>
              <div className="summary-item">
                <span className="label">Parking Space:</span>
                <span className="value">{booking.parkingSpace.title}</span>
              </div>
              <div className="summary-item">
                <span className="label">Location:</span>
                <span className="value">
                  {booking.parkingSpace.city}, {booking.parkingSpace.state}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Start Time:</span>
                <span className="value">
                  {new Date(booking.startTime).toLocaleString()}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">End Time:</span>
                <span className="value">
                  {new Date(booking.endTime).toLocaleString()}
                </span>
              </div>
              <div className="summary-item total">
                <span className="label">Total:</span>
                <span className="value">₺{booking.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-section card">
              <h2>Payment Details</h2>
              <Elements stripe={stripePromise} options={options}>
                <PaymentForm
                  bookingId={booking.id}
                  amount={booking.totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
