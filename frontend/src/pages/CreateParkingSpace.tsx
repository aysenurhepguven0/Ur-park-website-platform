import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { parkingSpaceApi, uploadApi } from '../services/api';
import './CreateParkingSpace.css';

// İstanbul merkez koordinatları
const defaultCenter = {
  lat: 41.0082,
  lng: 28.9784
};

// MapClickHandler component for handling map interactions inside APIProvider
interface MapClickHandlerProps {
  mapCenter: { lat: number; lng: number };
  markerPosition: { lat: number; lng: number } | null;
  setMarkerPosition: (pos: { lat: number; lng: number } | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  formData: any;
  setMapCenter: (center: { lat: number; lng: number }) => void;
  t: (key: string) => string;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({
  mapCenter,
  markerPosition,
  setMarkerPosition,
  setFormData,
  formData,
  setMapCenter,
  t
}) => {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoder = useMemo(
    () => geocodingLib && new geocodingLib.Geocoder(),
    [geocodingLib]
  );

  // Handle map click
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      setFormData((prev: any) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString()
      }));
    }
  }, [setMarkerPosition, setFormData]);

  // Set up click listener
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('click', handleMapClick);
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, handleMapClick]);

  return (
    <Map
      defaultCenter={mapCenter}
      defaultZoom={13}
      mapId="DEMO_MAP_ID"
      style={{ width: '100%', height: '100%' }}
    >
      {markerPosition && (
        <AdvancedMarker position={markerPosition}>
          <Pin
            background="#DC2626"
            glyphColor="#ffffff"
            borderColor="#ffffff"
            scale={1.2}
          />
        </AdvancedMarker>
      )}
    </Map>
  );
};

const CreateParkingSpace: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: 'Istanbul', // İstanbul sabitleme - İngilizce
    state: 'Istanbul', // İstanbul sabitleme
    zipCode: '',
    latitude: '',
    longitude: '',
    pricePerHour: '',
    pricePerDay: '',
    pricePerMonth: '',
    spaceType: 'COVERED_SITE_PARKING',
    amenities: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    // Filter for image files only
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    // Create preview URLs
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...imageFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString()
      }));
    }
  }, []);

  const handleAddressSearch = () => {
    const { address, city, state, zipCode } = formData;
    const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        setMarkerPosition({ lat, lng });
        setMapCenter({ lat, lng });
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString()
        }));
      } else {
        alert(t('createSpace.locationNotFound'));
      }
    });
  };

  const [gettingLocation, setGettingLocation] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert(t('parkingList.geolocationNotSupported'));
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMarkerPosition({ lat: latitude, lng: longitude });
        setMapCenter({ lat: latitude, lng: longitude });

        // Reverse geocoding - koordinatlardan adres al
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            setGettingLocation(false);

            if (status === 'OK' && results && results[0]) {
              const addressComponents = results[0].address_components;

              let streetNumber = '';
              let route = '';
              let district = '';
              let postalCode = '';

              addressComponents.forEach((component) => {
                const types = component.types;
                if (types.includes('street_number')) {
                  streetNumber = component.long_name;
                }
                if (types.includes('route')) {
                  route = component.long_name;
                }
                if (types.includes('sublocality') || types.includes('sublocality_level_1') ||
                  types.includes('administrative_area_level_2') || types.includes('neighborhood')) {
                  district = component.long_name;
                }
                if (types.includes('postal_code')) {
                  postalCode = component.long_name;
                }
              });

              const fullAddress = route ? `${route}${streetNumber ? ' No:' + streetNumber : ''}` : results[0].formatted_address.split(',')[0];

              setFormData((prev) => ({
                ...prev,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
                address: fullAddress,
                state: district || prev.state,
                zipCode: postalCode || prev.zipCode
              }));
            } else {
              // Geocoding başarısız olsa bile koordinatları kaydet
              setFormData((prev) => ({
                ...prev,
                latitude: latitude.toString(),
                longitude: longitude.toString()
              }));
            }
          }
        );
      },
      (error) => {
        setGettingLocation(false);
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(t('parkingList.permissionDenied'));
            break;
          case error.POSITION_UNAVAILABLE:
            alert(t('parkingList.positionUnavailable'));
            break;
          case error.TIMEOUT:
            alert(t('parkingList.timeout'));
            break;
          default:
            alert(t('parkingList.unknownError'));
        }
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadProgress('');

    try {
      // Upload images first if any are selected
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadProgress(`${t('createSpace.uploadProgress')} ${selectedFiles.length} ${t('createSpace.uploadingImages')}`);
        const uploadResponse = await uploadApi.uploadMultiple(selectedFiles);

        // Handle different response formats
        const uploadData = uploadResponse.data;

        // Extract images array - handle {data: {images: [...]}} format
        if (uploadData.data?.images && Array.isArray(uploadData.data.images)) {
          // Extract just the URL strings from the image objects
          imageUrls = uploadData.data.images.map((img: any) =>
            typeof img === 'string' ? img : img.url
          );
        } else if (uploadData.urls && Array.isArray(uploadData.urls)) {
          imageUrls = uploadData.urls;
        } else if (Array.isArray(uploadData)) {
          imageUrls = uploadData;
        } else if (uploadData.data && Array.isArray(uploadData.data)) {
          imageUrls = uploadData.data;
        }
      }

      setUploadProgress(t('createSpace.creatingSpace'));

      const amenitiesArray = formData.amenities
        ? formData.amenities.split(',').map((a) => a.trim())
        : [];

      // Convert string values to numbers for backend
      const data = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        pricePerHour: parseFloat(formData.pricePerHour) || 0,
        pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : null,
        pricePerMonth: formData.pricePerMonth ? parseFloat(formData.pricePerMonth) : null,
        spaceType: formData.spaceType,
        amenities: amenitiesArray,
        images: imageUrls
      };

      await parkingSpaceApi.create(data);
      alert(t('createSpace.success'));
      navigate('/my-spaces');
    } catch (err: any) {
      console.error('Create parking space error:', err);
      const errorMessage = err.response?.data?.message || err.message || t('createSpace.error');
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="create-space-container">
          <h1>{t('createSpace.title')}</h1>

          <form onSubmit={handleSubmit} className="create-space-form">
            <div className="form-section card">
              <h2>{t('createSpace.basicInfo')}</h2>

              <div className="form-group">
                <label>{t('createSpace.titleLabel')} *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder={t('createSpace.titlePlaceholder')}
                />
              </div>

              <div className="form-group">
                <label>{t('createSpace.description')} *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder={t('createSpace.descriptionPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label>{t('createSpace.spaceType')} *</label>
                <select name="spaceType" value={formData.spaceType} onChange={handleChange}>
                  <option value="COVERED_SITE_PARKING">Kapalı Site Otoparkı</option>
                  <option value="OPEN_SITE_PARKING">Açık Site Otoparkı</option>
                  <option value="SITE_GARAGE">Site Garajı</option>
                  <option value="COMPLEX_PARKING">Kompleks Otoparkı</option>
                </select>
              </div>
            </div>

            <div className="form-section card">
              <h2>{t('createSpace.location')}</h2>

              <div className="form-group">
                <label>{t('createSpace.address')} *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t('createSpace.addressPlaceholder')}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('createSpace.city')} *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled
                    style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                  />
                  <p className="form-hint" style={{ marginTop: '4px', fontSize: '0.85rem', color: '#666' }}>
                    {t('createSpace.cityNote')}
                  </p>
                </div>

                <div className="form-group">
                  <label>{t('createSpace.district')}</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder={t('createSpace.districtPlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('createSpace.zipCode')} *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder={t('createSpace.zipCodePlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleAddressSearch}
                    disabled={!formData.address || !formData.city || !formData.state}
                  >
                    {t('createSpace.findOnMap')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleUseMyLocation}
                    disabled={gettingLocation}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    📍 {gettingLocation ? t('parkingList.gettingLocation') : t('parkingList.useMyLocation')}
                  </button>
                </div>
                <p className="form-hint" style={{ marginTop: '8px' }}>
                  {t('createSpace.mapHint')}
                </p>
              </div>

              <div className="location-map" style={{ width: '100%', height: '400px' }}>
                <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
                  <MapClickHandler
                    mapCenter={mapCenter}
                    markerPosition={markerPosition}
                    setMarkerPosition={setMarkerPosition}
                    setFormData={setFormData}
                    formData={formData}
                    setMapCenter={setMapCenter}
                    t={t}
                  />
                </APIProvider>
              </div>

              {markerPosition && (
                <div className="location-info">
                  <p>
                    <strong>{t('createSpace.selectedLocation')}:</strong> Lat: {markerPosition.lat.toFixed(6)}, Lng:{' '}
                    {markerPosition.lng.toFixed(6)}
                  </p>
                </div>
              )}

              <input type="hidden" name="latitude" value={formData.latitude} />
              <input type="hidden" name="longitude" value={formData.longitude} />
            </div>

            <div className="form-section card">
              <h2>{t('createSpace.pricing')}</h2>

              <div className="form-group">
                <label>{t('createSpace.pricePerHour')} *</label>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  required
                  placeholder={t('createSpace.pricePerHourPlaceholder')}
                />
                <small style={{ color: '#666', fontSize: '0.85rem' }}>
                  {t('createSpace.pricePerHourNote')}
                </small>
              </div>

              <div className="form-group">
                <label>{t('createSpace.pricePerDay')}</label>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  placeholder={t('createSpace.pricePerDayPlaceholder')}
                />
                <small style={{ color: '#666', fontSize: '0.85rem' }}>
                  {t('createSpace.pricePerDayNote')}
                </small>
              </div>

              <div className="form-group">
                <label>{t('createSpace.pricePerMonth')}</label>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerMonth"
                  value={formData.pricePerMonth}
                  onChange={handleChange}
                  placeholder={t('createSpace.pricePerMonthPlaceholder')}
                />
                <small style={{ color: '#666', fontSize: '0.85rem' }}>
                  {t('createSpace.pricePerMonthNote')}
                </small>
              </div>
            </div>

            <div className="form-section card">
              <h2>{t('createSpace.amenities')}</h2>

              <div className="form-group">
                <label>{t('createSpace.amenitiesLabel')}</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder={t('createSpace.amenitiesPlaceholder')}
                />
                <small style={{ color: '#666', fontSize: '0.85rem' }}>
                  {t('createSpace.amenitiesNote')}
                </small>
              </div>
            </div>

            <div className="form-section card">
              <h2>{t('createSpace.photos')}</h2>
              <p className="form-hint">
                {t('createSpace.photosHint')}
              </p>

              <div
                className="image-upload-area"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="upload-label">
                  <div className="upload-icon">📸</div>
                  <p>{t('createSpace.uploadButton')}</p>
                  <p className="upload-hint">{t('createSpace.uploadHint')}</p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="image-preview-grid">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploadProgress && <div className="upload-progress">{uploadProgress}</div>}
            {error && <div className="error">{error}</div>}

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? t('createSpace.submitting') : t('createSpace.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateParkingSpace;
