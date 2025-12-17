import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { parkingSpaceApi, uploadApi } from '../services/api';
import './CreateParkingSpace.css';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

const EditParkingSpace: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    pricePerHour: '',
    pricePerDay: '',
    pricePerMonth: '',
    spaceType: 'COVERED_SITE_PARKING',
    amenities: ''
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    fetchParkingSpace();
  }, [id]);

  const fetchParkingSpace = async () => {
    try {
      setLoading(true);
      const response = await parkingSpaceApi.getById(id!);
      const space = response.data.data;

      setFormData({
        title: space.title,
        description: space.description,
        address: space.address,
        city: space.city,
        state: space.state,
        zipCode: space.zipCode,
        latitude: space.latitude.toString(),
        longitude: space.longitude.toString(),
        pricePerHour: space.pricePerHour.toString(),
        pricePerDay: space.pricePerDay?.toString() || '',
        pricePerMonth: space.pricePerMonth?.toString() || '',
        spaceType: space.spaceType,
        amenities: space.amenities.join(', ')
      });

      setExistingImages(space.images || []);

      // Set marker and center map on the parking space location
      const position = { lat: space.latitude, lng: space.longitude };
      setMarkerPosition(position);
      setMapCenter(position);
    } catch (err: any) {
      setError('Failed to load parking space details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const newPreviews = imageFiles.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...imageFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
        alert('Could not find location. Please try again or click on the map.');
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setUploadProgress('');

    try {
      // Upload new images if any are selected
      let newImageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        setUploadProgress(`Uploading ${selectedFiles.length} new image(s)...`);
        const uploadResponse = await uploadApi.uploadMultiple(selectedFiles);
        newImageUrls = uploadResponse.data.urls;
      }

      setUploadProgress('Updating parking space...');

      const amenitiesArray = formData.amenities
        ? formData.amenities.split(',').map((a) => a.trim())
        : [];

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      const data = {
        ...formData,
        amenities: amenitiesArray,
        images: allImages
      };

      await parkingSpaceApi.update(id!, data);
      alert('Parking space updated successfully!');
      navigate('/my-spaces');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update parking space');
    } finally {
      setSaving(false);
      setUploadProgress('');
    }
  };

  if (loading) {
    return <div className="loading">Loading parking space...</div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="create-space-container">
          <h1>Edit Parking Space</h1>

          <form onSubmit={handleSubmit} className="create-space-form">
            <div className="form-section card">
              <h2>Basic Information</h2>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Covered parking near downtown"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe your parking space..."
                />
              </div>

              <div className="form-group">
                <label>Space Type *</label>
                <select name="spaceType" value={formData.spaceType} onChange={handleChange}>
                  <option value="COVERED_SITE_PARKING">Kapalı Site Otoparkı</option>
                  <option value="OPEN_SITE_PARKING">Açık Site Otoparkı</option>
                  <option value="SITE_GARAGE">Site Garajı</option>
                  <option value="COMPLEX_PARKING">Kompleks Otoparkı</option>
                </select>
              </div>
            </div>

            <div className="form-section card">
              <h2>Location</h2>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
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
                  Find Location on Map
                </button>
                <p className="form-hint" style={{ marginTop: '8px' }}>
                  Click the button to geocode the address, or click directly on the map to set location
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
                    <strong>Selected Location:</strong> Lat: {markerPosition.lat.toFixed(6)}, Lng:{' '}
                    {markerPosition.lng.toFixed(6)}
                  </p>
                </div>
              )}

              <input type="hidden" name="latitude" value={formData.latitude} />
              <input type="hidden" name="longitude" value={formData.longitude} />
            </div>

            <div className="form-section card">
              <h2>Pricing</h2>

              <div className="form-group">
                <label>Price per Hour * ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price per Day ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerDay"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Price per Month ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerMonth"
                  value={formData.pricePerMonth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-section card">
              <h2>Amenities</h2>

              <div className="form-group">
                <label>Amenities (comma-separated)</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="e.g., Security cameras, Electric charging, 24/7 access"
                />
              </div>
            </div>

            <div className="form-section card">
              <h2>Photos</h2>

              {existingImages.length > 0 && (
                <>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Current Photos</h3>
                  <div className="image-preview-grid">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={imageUrl} alt={`Space ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeExistingImage(index)}
                          aria-label="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <p className="form-hint" style={{ marginTop: '20px' }}>
                Add more photos of your parking space
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
                  <p>Click to upload or drag and drop images here</p>
                  <p className="upload-hint">PNG, JPG, GIF up to 10MB each</p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <>
                  <h3 style={{ fontSize: '16px', marginTop: '20px', marginBottom: '12px' }}>
                    New Photos (not yet saved)
                  </h3>
                  <div className="image-preview-grid">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeNewImage(index)}
                          aria-label="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {uploadProgress && <div className="upload-progress">{uploadProgress}</div>}
            {error && <div className="error">{error}</div>}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary btn-large" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-large"
                onClick={() => navigate('/my-spaces')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditParkingSpace;
