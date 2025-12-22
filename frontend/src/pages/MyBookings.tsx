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
                {booking.parkingSpace.images && booking.parkingSpace.images.length > 0 && (
                  <img
                    src={booking.parkingSpace.images[0]}
                    alt={booking.parkingSpace.title}
                    style={{
                      width: '100%',
                      height: '160px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}
                  />
                )}
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{booking.parkingSpace.title}</h3>
                <p style={{ color: '#666', marginBottom: '12px', fontSize: '13px' }}>
                  {booking.parkingSpace.address}, {booking.parkingSpace.city}
                </p>

                <div style={{ marginBottom: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span><strong>{t('myBookings.start')}:</strong> {new Date(booking.startTime).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span><strong>{t('myBookings.end')}:</strong> {new Date(booking.endTime).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                  {t('myBookings.total')}: ₺{booking.totalPrice}
                </p>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', fontSize: '13px' }}>
                  <div>
                    <strong>{t('myBookings.status')}:</strong>{' '}
                    <span style={{ color: getStatusColor(booking.status), fontWeight: '600' }}>
                      {booking.status}
                    </span>
                  </div>
                  <div>
                    <strong>{t('myBookings.payment')}:</strong>{' '}
                    <span style={{ color: getPaymentStatusColor(booking.paymentStatus), fontWeight: '600' }}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  {t('myBookings.owner')}: {booking.parkingSpace.owner.firstName}{' '}
                  {booking.parkingSpace.owner.lastName}
                  {booking.parkingSpace.owner.phone && (
                    <> - {booking.parkingSpace.owner.phone}</>
                  )}
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <Link
                    to={`/parking-spaces/${booking.parkingSpace.id}`}
                    className="btn btn-primary"
                    style={{ padding: '8px 12px', fontSize: '13px', flex: '1', minWidth: '90px' }}
                  >
                    {t('myBookings.viewSpace')}
                  </Link>

                  {booking.paymentStatus === 'PENDING' && booking.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handlePayNow(booking.id)}
                      className="btn btn-success"
                      style={{ backgroundColor: '#28a745', padding: '8px 12px', fontSize: '13px', flex: '1', minWidth: '90px' }}
                    >
                      {t('myBookings.payNow')}
                    </button>
                  )}

                  {booking.status === 'PENDING' && booking.paymentStatus !== 'PAID' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn btn-danger"
                      style={{ padding: '8px 12px', fontSize: '13px', flex: '1', minWidth: '80px' }}
                    >
                      {t('myBookings.cancel')}
                    </button>
                  )}

                  {booking.paymentStatus === 'PAID' && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleRequestRefund(booking.id)}
                      className="btn"
                      style={{ backgroundColor: '#17a2b8', color: 'white', padding: '8px 12px', fontSize: '13px', flex: '1', minWidth: '90px' }}
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
