import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { parkingSpaceApi, uploadApi } from '../services/api';
import './CreateParkingSpace.css';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

// İstanbul merkez koordinatları
const defaultCenter = {
  lat: 41.0082,
  lng: 28.9784
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
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddressSearch}
                  disabled={!formData.address || !formData.city || !formData.state}
                >
                  {t('createSpace.findOnMap')}
                </button>
                <p className="form-hint" style={{ marginTop: '8px' }}>
                  {t('createSpace.mapHint')}
                </p>
              </div>

              <div className="location-map">
                <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={13}
                    onClick={handleMapClick}
                  >
                    {markerPosition && <Marker position={markerPosition} />}
                  </GoogleMap>
                </LoadScript>
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
