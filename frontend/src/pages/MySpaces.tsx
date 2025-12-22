import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { parkingSpaceApi } from '../services/api';

const MySpaces: React.FC = () => {
  const { t } = useTranslation();
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySpaces();
  }, []);

  const fetchMySpaces = async () => {
    try {
      setLoading(true);
      const response = await parkingSpaceApi.getMySpaces();
      setSpaces(response.data.data.parkingSpaces);
    } catch (error) {
      console.error('Failed to fetch my spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('mySpaces.deleteConfirm'))) {
      return;
    }

    try {
      await parkingSpaceApi.delete(id);
      setSpaces(spaces.filter((space) => space.id !== id));
      alert(t('common.success'));
    } catch (error) {
      console.error('Failed to delete parking space:', error);
      alert(t('common.error'));
    }
  };

  if (loading) {
    return <div className="loading">{t('mySpaces.loading') || 'Yükleniyor...'}</div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{t('mySpaces.title')}</h1>
          <Link to="/create-space" className="btn btn-primary">
            {t('mySpaces.addNew')}
          </Link>
        </div>

        {spaces.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <p>{t('mySpaces.noSpaces')}</p>
            <Link to="/create-space" className="btn btn-primary" style={{ marginTop: '16px' }}>
              {t('mySpaces.getStarted')}
            </Link>
          </div>
        ) : (
          <div className="grid">
            {spaces.map((space) => (
              <div key={space.id} className="card">
                {/* Parking Space Image */}
                {space.images && space.images.length > 0 ? (
                  <img 
                    src={space.images[0]} 
                    alt={space.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999'
                    }}
                  >
                    📸 {t('parkingDetail.noImage')}
                  </div>
                )}

                <h3>{space.title}</h3>
                <p style={{ color: '#666', marginBottom: '8px' }}>
                  {space.city}, {space.state}
                </p>
                <p style={{ color: '#28a745', fontWeight: '600', marginBottom: '8px' }}>
                  ₺{space.pricePerHour}{t('common.perHour')}
                </p>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  {space.bookingCount} {t('mySpaces.bookings')}
                </p>
                {space.reviewCount > 0 && (
                  <p style={{ fontSize: '14px' }}>
                    ⭐ {space.averageRating} ({space.reviewCount} {t('parkingList.reviews')})
                  </p>
                )}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <Link to={`/parking-spaces/${space.id}`} className="btn btn-primary">
                    {t('myBookings.viewDetails')}
                  </Link>
                  <Link to={`/edit-space/${space.id}`} className="btn btn-secondary">
                    {t('mySpaces.edit')}
                  </Link>
                  <button onClick={() => handleDelete(space.id)} className="btn btn-danger">
                    {t('mySpaces.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySpaces;
