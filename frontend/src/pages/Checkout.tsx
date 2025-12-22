import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { bookingApi } from '../services/api';
import IyzicoPaymentForm from '../components/payment/IyzicoPaymentForm';
import './Checkout.css';

const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setError('Rezervasyon ID bulunamadı');
      setLoading(false);
      return;
    }

    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);

      // Fetch booking details
      const bookingResponse = await bookingApi.getById(bookingId!);
      const bookingData = bookingResponse.data.data.booking || bookingResponse.data.data;
      setBooking(bookingData);
    } catch (err: any) {
      console.error('Booking fetch error:', err);
      setError(
        err.response?.data?.message ||
          'Rezervasyon bilgileri yüklenemedi. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log('Ödeme başarılı');
    navigate(`/booking-success?bookingId=${bookingId}`);
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
            <p>Ödeme bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="page">
        <div className="container">
          <div className="checkout-error card">
            <h2>Ödeme Hatası</h2>
            <p>{error || 'Ödeme bilgileri yüklenemedi'}</p>
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
              Rezervasyonlarıma Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Ödeme İşlemi</h1>
            <p>Güvenli ödeme - İyzico ile korunmaktasınız</p>
          </div>

          <div className="checkout-content">
            <div className="booking-summary card">
              <h2>Rezervasyon Özeti</h2>
              <div className="summary-item">
                <span className="label">Park Yeri:</span>
                <span className="value">{booking.parkingSpace.title}</span>
              </div>
              <div className="summary-item">
                <span className="label">Konum:</span>
                <span className="value">
                  {booking.parkingSpace.city}, {booking.parkingSpace.state}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Adres:</span>
                <span className="value">{booking.parkingSpace.address}</span>
              </div>
              <div className="summary-item">
                <span className="label">Başlangıç:</span>
                <span className="value">
                  {new Date(booking.startTime).toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Bitiş:</span>
                <span className="value">
                  {new Date(booking.endTime).toLocaleString('tr-TR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item total">
                <span className="label">Toplam Tutar:</span>
                <span className="value">₺{booking.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-section card">
              <h2>Kart Bilgileri</h2>
              <p className="payment-info">
                Kart bilgileriniz güvenli bir şekilde işlenir ve saklanmaz.
              </p>
              <IyzicoPaymentForm
                bookingId={booking.id}
                amount={booking.totalPrice}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
              {error && (
                <div className="error-message" style={{ marginTop: '16px' }}>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="security-badges">
            <div className="security-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>256-bit SSL Şifreleme</span>
            </div>
            <div className="security-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span>İyzico Güvencesi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
