import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { parkingSpaceApi } from '../services/api';
import './ParkingSpaceList.css';

interface ParkingSpace {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  spaceType: string;
  averageRating: number;
  reviewCount: number;
  images: string[];
  distance?: number;
}

const defaultCenter = {
  lat: 41.0082,
  lng: 28.9784 // İstanbul (Kadıköy, Beşiktaş, Ataşehir bölgesi)
};

const radiusOptions = [
  { value: 1, label: '1 mile' },
  { value: 2, label: '2 miles' },
  { value: 5, label: '5 miles' },
  { value: 10, label: '10 miles' },
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' }
];

const ParkingSpaceList: React.FC = () => {
  const { t } = useTranslation();
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'filters' | 'nearby'>('filters');
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    spaceType: '',
    minPrice: '',
    maxPrice: '',
    radius: '5',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true);
      const response = await parkingSpaceApi.getAll(filters);
      const fetchedSpaces = response.data.data.parkingSpaces;
      setSpaces(fetchedSpaces);

      // Center map on first result or use default
      if (fetchedSpaces.length > 0) {
        setMapCenter({
          lat: fetchedSpaces[0].latitude,
          lng: fetchedSpaces[0].longitude
        });
      }
    } catch (error) {
      console.error('Failed to fetch parking spaces:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  const fetchNearbySpaces = useCallback(async (lat: number, lng: number, radius: number) => {
    try {
      setLoading(true);
      const response = await parkingSpaceApi.getNearby({
        latitude: lat,
        longitude: lng,
        radius,
        limit: 50
      });
      const fetchedSpaces = response.data.data.parkingSpaces;
      setSpaces(fetchedSpaces);
      setMapCenter({ lat, lng });
    } catch (error) {
      console.error('Failed to fetch nearby parking spaces:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t('parkingList.geolocationNotSupported'));
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setSearchMode('nearby');
        setLocationLoading(false);
        fetchNearbySpaces(latitude, longitude, parseFloat(filters.radius));
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(t('parkingList.permissionDenied'));
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(t('parkingList.positionUnavailable'));
            break;
          case error.TIMEOUT:
            setLocationError(t('parkingList.timeout'));
            break;
          default:
            setLocationError(t('parkingList.unknownError'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });

    // Update nearby search when radius changes
    if (name === 'radius' && searchMode === 'nearby' && userLocation) {
      const radiusValue = parseFloat(value) || 5;
      fetchNearbySpaces(userLocation.lat, userLocation.lng, radiusValue);
    }
  };

  const handleSearch = () => {
    if (searchMode === 'nearby' && userLocation) {
      const radiusValue = parseFloat(filters.radius) || 5;
      fetchNearbySpaces(userLocation.lat, userLocation.lng, radiusValue);
    } else {
      setSearchMode('filters');
      fetchSpaces();
    }
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setSearchMode('filters');
    fetchSpaces();
  };

  if (loading) {
    return <div className="loading">{t('parkingList.loading')}</div>;
  }

  const renderSpaceList = () => (
    <div className="spaces-list">
      {spaces.length === 0 ? (
        <div className="no-results">
          <p>{t('parkingList.noResults')}</p>
        </div>
      ) : (
        <>
          <div className="grid">
            {spaces.map((space) => (
              <Link to={`/parking-spaces/${space.id}`} key={space.id} className="space-card">
                <div className="space-image">
                  {space.images && space.images.length > 0 ? (
                    <img src={space.images[0]} alt={space.title} />
                  ) : (
                    <div className="no-image">{t('parkingList.noImage')}</div>
                  )}
                  {space.distance != null && (
                    <div className="distance-badge">
                      {space.distance.toFixed(1)} mi
                    </div>
                  )}
                </div>
                <div className="space-info">
                  <h3>{space.title}</h3>
                  <p className="space-location">
                    {space.city}, {space.state}
                  </p>
                  <p className="space-type">{space.spaceType}</p>
                  <div className="space-footer">
                    <span className="space-price">₺{space.pricePerHour}/hr</span>
                    {space.reviewCount > 0 && (
                      <span className="space-rating">
                        {space.averageRating} ({space.reviewCount})
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderMap = () => (
    <div className="map-container" style={{ width: '100%', height: '600px' }}>
      <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
        <Map
          defaultCenter={mapCenter}
          defaultZoom={searchMode === 'nearby' ? 13 : 12}
          mapId="DEMO_MAP_ID"
          style={{ width: '100%', height: '100%' }}
        >
          {/* User location marker */}
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Your Location">
              <div style={{
                width: 20,
                height: 20,
                backgroundColor: '#4285F4',
                border: '3px solid white',
                borderRadius: '50%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }} />
            </AdvancedMarker>
          )}

          {/* Parking space markers - Red markers */}
          {spaces.map((space) => (
            <AdvancedMarker
              key={space.id}
              position={{ lat: space.latitude, lng: space.longitude }}
              title={space.title}
              onClick={() => setSelectedSpace(space)}
            >
              <Pin
                background="#DC2626"
                glyphColor="#ffffff"
                borderColor="#ffffff"
              />
            </AdvancedMarker>
          ))}

          {selectedSpace && (
            <InfoWindow
              position={{ lat: selectedSpace.latitude, lng: selectedSpace.longitude }}
              onCloseClick={() => setSelectedSpace(null)}
            >
              <div className="map-info-window">
                <h3>{selectedSpace.title}</h3>
                <p>{selectedSpace.city}, {selectedSpace.state}</p>
                <p className="info-price">₺{selectedSpace.pricePerHour}/{t('parkingList.perHour')}</p>
                {selectedSpace.distance != null && (
                  <p className="info-distance">{t('parkingList.milesAway', { distance: selectedSpace.distance.toFixed(1) })}</p>
                )}
                <Link to={`/parking-spaces/${selectedSpace.id}`} className="btn btn-primary btn-sm">
                  {t('parkingList.viewDetails')}
                </Link>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <h1>{t('parkingList.title')}</h1>

        {/* Location-based search section */}
        <div className="location-search card">
          <div className="location-header">
            <h3>{t('parkingList.searchNearby')}</h3>
            {userLocation ? (
              <button onClick={handleClearLocation} className="btn btn-link">
                {t('parkingList.clearLocation')}
              </button>
            ) : null}
          </div>
          <div className="location-controls">
            <button
              onClick={handleGetLocation}
              className={`btn ${userLocation ? 'btn-success' : 'btn-primary'}`}
              disabled={locationLoading}
            >
              {locationLoading ? t('parkingList.gettingLocation') : userLocation ? t('parkingList.locationSet') : t('parkingList.useMyLocation')}
            </button>
            {userLocation && (
              <select
                name="radius"
                value={filters.radius}
                onChange={handleFilterChange}
                className="radius-select"
              >
                {radiusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t('parkingList.within')} {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          {locationError && <p className="error-text">{locationError}</p>}
          {userLocation && (
            <p className="location-info">
              {t('parkingList.showingWithin', { radius: filters.radius })}
            </p>
          )}
        </div>

        <div className="filters card">
          <div className="filter-row">
            <input
              type="text"
              name="city"
              placeholder={t('parkingList.cityPlaceholder')}
              value={filters.city}
              onChange={handleFilterChange}
              disabled={searchMode === 'nearby'}
            />
            <input
              type="text"
              name="state"
              placeholder={t('parkingList.statePlaceholder')}
              value={filters.state}
              onChange={handleFilterChange}
              disabled={searchMode === 'nearby'}
            />
            <select name="spaceType" value={filters.spaceType} onChange={handleFilterChange}>
              <option value="">{t('parkingList.allTypes')}</option>
              <option value="COVERED_SITE_PARKING">Kapalı Site Otoparkı</option>
              <option value="OPEN_SITE_PARKING">Açık Site Otoparkı</option>
              <option value="SITE_GARAGE">Site Garajı</option>
              <option value="COMPLEX_PARKING">Kompleks Otoparkı</option>
            </select>
            <input
              type="number"
              name="minPrice"
              placeholder={t('parkingList.minPrice')}
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxPrice"
              placeholder={t('parkingList.maxPrice')}
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
            <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
              <option value="createdAt">{t('parkingList.newestFirst')}</option>
              <option value="price">{t('parkingList.sortByPrice')}</option>
              {searchMode === 'nearby' && <option value="distance">{t('parkingList.sortByDistance')}</option>}
            </select>
            <button onClick={handleSearch} className="btn btn-primary">
              {t('parkingList.search')}
            </button>
          </div>
        </div>

        <div className="view-mode-toggle">
          <button
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('list')}
          >
            {t('parkingList.listView')}
          </button>
          <button
            className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('map')}
          >
            {t('parkingList.mapView')}
          </button>
          <button
            className={`btn ${viewMode === 'split' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('split')}
          >
            {t('parkingList.splitView')}
          </button>
        </div>

        {viewMode === 'list' && renderSpaceList()}
        {viewMode === 'map' && renderMap()}
        {viewMode === 'split' && (
          <div className="split-view">
            <div className="split-list">{renderSpaceList()}</div>
            <div className="split-map">{renderMap()}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingSpaceList;
