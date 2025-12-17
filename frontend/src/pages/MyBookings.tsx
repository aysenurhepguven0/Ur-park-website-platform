import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { bookingApi, paymentApi } from '../services/api';

const MyBookings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getMyBookings();
      setBookings(response.data.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm(t('myBookings.cancelConfirm'))) {
      return;
    }

    try {
      await bookingApi.updateStatus(id, 'CANCELLED');
      fetchMyBookings();
      alert(t('myBookings.cancelSuccess'));
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert(t('myBookings.cancelError'));
    }
  };

  const handlePayNow = (bookingId: string) => {
    navigate(`/checkout?bookingId=${bookingId}`);
  };

  const handleRequestRefund = async (bookingId: string) => {
    if (!window.confirm(t('myBookings.refundConfirm'))) {
      return;
    }

    try {
      await paymentApi.refund(bookingId);
      alert(t('myBookings.refundSuccess'));
      fetchMyBookings();
    } catch (error: any) {
      console.error('Failed to request refund:', error);
      alert(error.response?.data?.message || t('myBookings.refundError'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#28a745';
      case 'PENDING':
        return '#ffc107';
      case 'CANCELLED':
        return '#dc3545';
      case 'COMPLETED':
        return '#007bff';
      default:
        return '#666';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return '#28a745';
      case 'PENDING':
        return '#ffc107';
      case 'REFUNDED':
        return '#17a2b8';
      case 'FAILED':
        return '#dc3545';
      default:
        return '#666';
    }
  };

  if (loading) {
    return <div className="loading">{t('myBookings.loading')}</div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1>{t('myBookings.title')}</h1>

        {bookings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <p>{t('myBookings.noBookings')}</p>
            <Link to="/parking-spaces" className="btn btn-primary" style={{ marginTop: '16px' }}>
              {t('myBookings.findParkingSpaces')}
            </Link>
          </div>
        ) : (
          <div className="grid">
            {bookings.map((booking) => (
              <div key={booking.id} className="card">
                <h3>{booking.parkingSpace.title}</h3>
                <p style={{ color: '#666', marginBottom: '12px' }}>
                  {booking.parkingSpace.address}, {booking.parkingSpace.city}
                </p>

                <div style={{ marginBottom: '12px' }}>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                    <strong>{t('myBookings.start')}:</strong>{' '}
                    {new Date(booking.startTime).toLocaleString()}
                  </p>
                  <p style={{ fontSize: '14px' }}>
                    <strong>{t('myBookings.end')}:</strong> {new Date(booking.endTime).toLocaleString()}
                  </p>
                </div>

                <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  {t('myBookings.total')}: ₺{booking.totalPrice}
                </p>

                <div style={{ marginBottom: '12px' }}>
                  <p
                    style={{
                      color: getStatusColor(booking.status),
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}
                  >
                    {t('myBookings.status')}: {booking.status}
                  </p>
                  <p
                    style={{
                      color: getPaymentStatusColor(booking.paymentStatus),
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    {t('myBookings.payment')}: {booking.paymentStatus}
                  </p>
                </div>

                <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  {t('myBookings.owner')}: {booking.parkingSpace.owner.firstName}{' '}
                  {booking.parkingSpace.owner.lastName}
                  {booking.parkingSpace.owner.phone && (
                    <> - {booking.parkingSpace.owner.phone}</>
                  )}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link
                    to={`/parking-spaces/${booking.parkingSpace.id}`}
                    className="btn btn-primary"
                  >
                    {t('myBookings.viewSpace')}
                  </Link>

                  {booking.paymentStatus === 'PENDING' && booking.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handlePayNow(booking.id)}
                      className="btn btn-success"
                      style={{ backgroundColor: '#28a745' }}
                    >
                      {t('myBookings.payNow')}
                    </button>
                  )}

                  {booking.status === 'PENDING' && booking.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn btn-danger"
                    >
                      {t('myBookings.cancel')}
                    </button>
                  )}

                  {booking.paymentStatus === 'PAID' && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleRequestRefund(booking.id)}
                      className="btn"
                      style={{ backgroundColor: '#17a2b8', color: 'white' }}
                    >
                      {t('myBookings.requestRefund')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
