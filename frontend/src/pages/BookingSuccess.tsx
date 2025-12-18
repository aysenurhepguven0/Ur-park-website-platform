import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingApi } from '../services/api';
import './BookingSuccess.css';

const BookingSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const paymentIntent = searchParams.get('payment_intent');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setError('No booking information found');
      setLoading(false);
      return;
    }

    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getById(bookingId!);
      const data = response.data.data;
      const booking = data.booking || data;
      setBooking(booking);
    } catch (err: any) {
      console.error('Failed to fetch booking:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="success-loading">
            <div className="spinner-large"></div>
            <p>Confirming your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="page">
        <div className="container">
          <div className="success-error card">
            <div className="error-icon">⚠️</div>
            <h2>Something Went Wrong</h2>
            <p>{error || 'Unable to load booking details'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="success-container">
          <div className="success-card card">
            <div className="success-icon">✓</div>
            <h1>Payment Successful!</h1>
            <p className="success-subtitle">Your parking space has been booked</p>

            <div className="booking-details">
              <h2>Booking Details</h2>

              <div className="detail-row">
                <span className="detail-label">Parking Space:</span>
                <span className="detail-value">{booking.parkingSpace.title}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">
                  {booking.parkingSpace.address}, {booking.parkingSpace.city},{' '}
                  {booking.parkingSpace.state}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Start Time:</span>
                <span className="detail-value">
                  {new Date(booking.startTime).toLocaleString()}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">End Time:</span>
                <span className="detail-value">
                  {new Date(booking.endTime).toLocaleString()}
                </span>
              </div>

              <div className="detail-row highlight">
                <span className="detail-label">Amount Paid:</span>
                <span className="detail-value">₺{booking.totalPrice.toFixed(2)}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Booking Status:</span>
                <span className="detail-value status-confirmed">
                  {booking.status}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Payment Status:</span>
                <span className="detail-value status-paid">
                  {booking.paymentStatus}
                </span>
              </div>
            </div>

            <div className="owner-info">
              <h3>Space Owner Contact</h3>
              <p>
                <strong>
                  {booking.parkingSpace.owner.firstName}{' '}
                  {booking.parkingSpace.owner.lastName}
                </strong>
              </p>
              <p>{booking.parkingSpace.owner.email}</p>
              {booking.parkingSpace.owner.phone && (
                <p>{booking.parkingSpace.owner.phone}</p>
              )}
            </div>

            <div className="success-actions">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/my-bookings')}
              >
                View All Bookings
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>

            <div className="confirmation-note">
              <p>
                A confirmation email has been sent to your email address. Please
                contact the space owner if you have any questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
