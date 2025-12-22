import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { parkingSpaceApi, bookingApi, messageApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ParkingSpaceDetail.css';

const ParkingSpaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [space, setSpace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    startTime: '',
    endTime: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<{
    total: number;
    breakdown: string;
  } | null>(null);

  const fetchSpaceDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await parkingSpaceApi.getById(id!);
      const data = response.data.data;
      // Handle nested parkingSpace or direct data
      const spaceData = data.parkingSpace || data;
      setSpace(spaceData);
    } catch (error) {
      console.error('Failed to fetch parking space:', error);
      setError('Failed to load parking space details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSpaceDetails();
  }, [fetchSpaceDetails]);

  // Calculate estimated price when dates change
  useEffect(() => {
    if (!space || !bookingData.startTime || !bookingData.endTime) {
      setEstimatedPrice(null);
      return;
    }

    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);

    if (end <= start) {
      setEstimatedPrice(null);
      return;
    }

    const totalHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    let totalPrice = 0;
    let remainingHours = totalHours;
    const breakdown: string[] = [];

    // Calculate months (if monthly pricing available and duration >= 30 days)
    if (space.pricePerMonth && remainingHours >= 720) { // 30 days = 720 hours
      const months = Math.floor(remainingHours / 720);
      totalPrice += months * space.pricePerMonth;
      remainingHours = remainingHours % 720;
      breakdown.push(`${months} ${t('common.months')} × ₺${space.pricePerMonth}`);
    }

    // Calculate days (if daily pricing available and remaining hours >= 24)
    if (space.pricePerDay && remainingHours >= 24) {
      const days = Math.floor(remainingHours / 24);
      totalPrice += days * space.pricePerDay;
      remainingHours = remainingHours % 24;
      breakdown.push(`${days} ${t('common.days')} × ₺${space.pricePerDay}`);
    }

    // Calculate remaining hours
    if (remainingHours > 0) {
      totalPrice += remainingHours * space.pricePerHour;
      breakdown.push(`${remainingHours} ${t('common.hours')} × ₺${space.pricePerHour}`);
    }

    setEstimatedPrice({
      total: totalPrice,
      breakdown: breakdown.join(' + ')
    });
  }, [space, bookingData.startTime, bookingData.endTime, t]);

  // Helper function to translate backend error messages
  const translateError = (errorMessage: string): string => {
    const errorTranslations: { [key: string]: string } = {
      'Parking space is already booked for this time period': t('errors.alreadyBooked'),
      'Parking space not found': t('errors.spaceNotFound'),
      'Parking space is not available': t('errors.spaceNotAvailable'),
      'Failed to create booking': t('errors.bookingFailed')
    };
    return errorTranslations[errorMessage] || errorMessage;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const response = await bookingApi.create({
        parkingSpaceId: id,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime
      });
      const data = response.data.data;
      const booking = data.booking || data;
      const bookingId = booking.id;
      // Navigate to checkout page with booking ID
      navigate(`/checkout?bookingId=${bookingId}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create booking';
      setError(translateError(errorMessage));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactOwner = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setContactLoading(true);
      const response = await messageApi.getOrCreateConversation({
        otherUserId: space.owner.id,
        parkingSpaceId: id
      });
      const data = response.data.data;
      const conversation = data.conversation || data;
      const conversationId = conversation.id;
      navigate(`/messages/${conversationId}`);
    } catch (err: any) {
      console.error('Failed to create conversation:', err);
      setError('Failed to start conversation');
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (!space) {
    return <div className="error">{t('parkingDetail.notFound')}</div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="space-detail">
          <div className="space-images">
            {space.images.length > 0 ? (
              <img src={space.images[0]} alt={space.title} />
            ) : (
              <div className="no-image-large">{t('parkingDetail.noImage')}</div>
            )}
          </div>

          <div className="space-content">
            <h1>{space.title}</h1>
            <p className="space-location">
              {space.address}, {space.city}, {space.state} {space.zipCode}
            </p>
            <p className="space-type">{space.spaceType}</p>

            {space.averageRating > 0 && (
              <p className="space-rating">
                {space.averageRating} ({space.reviewCount} {t('parkingDetail.reviews')})
              </p>
            )}

            <div className="space-pricing card">
              <h3>{t('parkingDetail.pricing')}</h3>
              <p>₺{space.pricePerHour}/{t('common.perHour')}</p>
              {space.pricePerDay && <p>₺{space.pricePerDay}/{t('common.perDay')}</p>}
              {space.pricePerMonth && <p>₺{space.pricePerMonth}/{t('common.perMonth')}</p>}
            </div>

            <div className="space-description card">
              <h3>{t('parkingDetail.description')}</h3>
              <p>{space.description}</p>
            </div>

            {space.amenities && space.amenities.length > 0 && (
              <div className="space-amenities card">
                <h3>{t('parkingDetail.amenities')}</h3>
                <ul>
                  {space.amenities.map((amenity: string, index: number) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-location-map card">
              <h3>{t('parkingDetail.location')}</h3>
              <div className="map-wrapper" style={{ width: '100%', height: '300px' }}>
                <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
                  <Map
                    defaultCenter={{ lat: space.latitude, lng: space.longitude }}
                    defaultZoom={15}
                    mapId="DEMO_MAP_ID"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <AdvancedMarker
                      position={{ lat: space.latitude, lng: space.longitude }}
                      title={space.title}
                    >
                      <Pin
                        background="#DC2626"
                        glyphColor="#ffffff"
                        borderColor="#ffffff"
                        scale={1.2}
                      />
                    </AdvancedMarker>
                  </Map>
                </APIProvider>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${space.latitude},${space.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ marginTop: '12px', display: 'inline-block' }}
              >
                {t('parkingDetail.getDirections')}
              </a>
            </div>

            {user && user.id !== space.owner.id && (
              <div className="booking-form card">
                <h3>{t('parkingDetail.bookThisSpace')}</h3>
                <form onSubmit={handleBooking}>
                  <div className="form-group">
                    <label>{t('parkingDetail.startTime')}</label>
                    <input
                      type="datetime-local"
                      value={bookingData.startTime}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, startTime: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('parkingDetail.endTime')}</label>
                    <input
                      type="datetime-local"
                      value={bookingData.endTime}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, endTime: e.target.value })
                      }
                      required
                    />
                  </div>

                  {estimatedPrice && (
                    <div className="price-estimate" style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>
                        {t('parkingDetail.estimatedPrice')}:
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                        ₺{estimatedPrice.total.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.85 }}>
                        {estimatedPrice.breakdown}
                      </div>
                    </div>
                  )}

                  {error && <div className="error">{error}</div>}

                  <button
                    type="submit"
                    className="btn btn-primary full-width"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? t('parkingDetail.booking') : t('parkingDetail.bookNow')}
                  </button>
                </form>
              </div>
            )}

            <div className="space-owner card">
              <h3>{t('parkingDetail.owner')}</h3>
              <p>
                {space.owner.firstName} {space.owner.lastName}
              </p>
              <p>{space.owner.email}</p>
              {user && user.id !== space.owner.id && (
                <button
                  onClick={handleContactOwner}
                  className="btn btn-secondary"
                  disabled={contactLoading}
                  style={{ marginTop: '10px' }}
                >
                  {contactLoading ? t('common.loading') : t('parkingDetail.contactOwner')}
                </button>
              )}
            </div>

            <div className="space-reviews card">
              <h3>{t('parkingDetail.reviews')}</h3>
              {!space.reviews || space.reviews.length === 0 ? (
                <p>{t('parkingDetail.noReviews')}</p>
              ) : (
                space.reviews.map((review: any) => (
                  <div key={review.id} className="review">
                    <div className="review-header">
                      <strong>
                        {review.user.firstName} {review.user.lastName}
                      </strong>
                      <span className="review-rating">{review.rating}</span>
                    </div>
                    {review.comment && <p>{review.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingSpaceDetail;
