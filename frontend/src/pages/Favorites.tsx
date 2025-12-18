import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Favorites.css';

interface ParkingSpace {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  pricePerHour: number;
  spaceType: string;
  images: string[];
  averageRating: number;
  reviewCount: number;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Favorite {
  id: string;
  createdAt: string;
  parkingSpace: ParkingSpace;
}

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/favorites');
      setFavorites(response.data.data.favorites);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      setError(err.response?.data?.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (parkingSpaceId: string) => {
    try {
      await api.delete(`/favorites/${parkingSpaceId}`);
      setFavorites(favorites.filter(fav => fav.parkingSpace.id !== parkingSpaceId));
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      alert('Failed to remove favorite');
    }
  };

  const handleViewDetails = (spaceId: string) => {
    navigate(`/parking-spaces/${spaceId}`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>My Favorite Parking Spaces</h1>
        <p>Spaces you've saved for quick access</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h2>No favorites yet</h2>
          <p>Start adding parking spaces to your favorites for quick access later!</p>
          <button onClick={() => navigate('/parking-spaces')} className="browse-button">
            Browse Parking Spaces
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="favorite-card">
              <div className="card-image">
                {favorite.parkingSpace?.images && favorite.parkingSpace.images.length > 0 ? (
                  <img
                    src={favorite.parkingSpace.images[0]}
                    alt={favorite.parkingSpace.title}
                  />
                ) : (
                  <div className="no-image">No image</div>
                )}
                <button
                  className="remove-favorite-btn"
                  onClick={() => handleRemoveFavorite(favorite.parkingSpace.id)}
                  title="Remove from favorites"
                >
                  ❤️
                </button>
              </div>

              <div className="card-content">
                <h3>{favorite.parkingSpace.title}</h3>
                <p className="address">
                  {favorite.parkingSpace.address}, {favorite.parkingSpace.city}, {favorite.parkingSpace.state}
                </p>

                <div className="space-info">
                  <span className="space-type">{favorite.parkingSpace.spaceType}</span>
                  <span className="price">₺{favorite.parkingSpace.pricePerHour}/hr</span>
                </div>

                {favorite.parkingSpace.reviewCount > 0 && (
                  <div className="rating">
                    {renderStars(favorite.parkingSpace.averageRating)}
                    <span className="rating-text">
                      {favorite.parkingSpace.averageRating} ({favorite.parkingSpace.reviewCount} reviews)
                    </span>
                  </div>
                )}

                <div className="card-footer">
                  <p className="owner">
                    Hosted by {favorite.parkingSpace.owner.firstName}
                  </p>
                  <button
                    onClick={() => handleViewDetails(favorite.parkingSpace.id)}
                    className="view-button"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
