import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import api from '../services/api';
import '../styles/ManageAvailability.css';

interface TimeSlot {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface ParkingSpace {
  id: string;
  title: string;
  address: string;
}

const ManageAvailability: React.FC = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const [parkingSpace, setParkingSpace] = useState<ParkingSpace | null>(null);
  const [availabilities, setAvailabilities] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingChanges, setPendingChanges] = useState(false);

  useEffect(() => {
    if (spaceId) {
      fetchParkingSpaceAndAvailability();
    }
  }, [spaceId]);

  const fetchParkingSpaceAndAvailability = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch parking space details
      const spaceResponse = await api.get(`/parking-spaces/${spaceId}`);
      setParkingSpace(spaceResponse.data);

      // Fetch existing availability
      const availabilityResponse = await api.get(`/parking-spaces/${spaceId}/availability`);
      setAvailabilities(availabilityResponse.data);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load parking space data');
      if (err.response?.status === 403) {
        setError('You do not have permission to manage this parking space');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (updatedAvailabilities: TimeSlot[]) => {
    setAvailabilities(updatedAvailabilities);
    setPendingChanges(true);
    setSuccessMessage('');
  };

  const handleSave = async () => {
    if (!spaceId) return;

    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      // Convert availabilities to the format expected by the backend
      const availabilityData = availabilities.map(slot => ({
        parkingSpaceId: spaceId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable
      }));

      await api.post(`/parking-spaces/${spaceId}/availability`, {
        availabilities: availabilityData
      });

      setSuccessMessage('Availability saved successfully!');
      setPendingChanges(false);

      // Refresh the data to get IDs for newly created slots
      await fetchParkingSpaceAndAvailability();

    } catch (err: any) {
      console.error('Error saving availability:', err);
      setError(err.response?.data?.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSetup = async (preset: 'weekdays' | 'weekends' | 'all-week') => {
    const today = new Date();
    const slots: TimeSlot[] = [];

    // Generate slots for the next 4 weeks
    for (let week = 0; week < 4; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(today.getDate() + (week * 7) + day);
        const dayOfWeek = date.getDay();

        let shouldAdd = false;
        if (preset === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) {
          shouldAdd = true;
        } else if (preset === 'weekends' && (dayOfWeek === 0 || dayOfWeek === 6)) {
          shouldAdd = true;
        } else if (preset === 'all-week') {
          shouldAdd = true;
        }

        if (shouldAdd) {
          const dateStr = date.toISOString().split('T')[0];
          slots.push({
            date: dateStr,
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: true
          });
        }
      }
    }

    // Merge with existing slots (don't override)
    const existingDates = new Set(availabilities.map(a => a.date));
    const newSlots = slots.filter(slot => !existingDates.has(slot.date));
    const mergedSlots = [...availabilities, ...newSlots];

    setAvailabilities(mergedSlots);
    setPendingChanges(true);
    setSuccessMessage('');
  };

  const handleClearFuture = () => {
    const today = new Date().toISOString().split('T')[0];
    const pastSlots = availabilities.filter(slot => slot.date < today);
    setAvailabilities(pastSlots);
    setPendingChanges(true);
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <div className="manage-availability-container">
        <div className="loading">Loading availability...</div>
      </div>
    );
  }

  if (!parkingSpace) {
    return (
      <div className="manage-availability-container">
        <div className="error-message">Parking space not found</div>
      </div>
    );
  }

  return (
    <div className="manage-availability-container">
      <div className="page-header">
        <button onClick={() => navigate('/my-spaces')} className="back-button">
          ← Back to My Spaces
        </button>
        <h1>Manage Availability</h1>
        <div className="space-info">
          <h2>{parkingSpace.title}</h2>
          <p>{parkingSpace.address}</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <div className="quick-actions">
        <h3>Quick Setup</h3>
        <p>Automatically set availability for the next 4 weeks:</p>
        <div className="quick-action-buttons">
          <button
            onClick={() => handleQuickSetup('weekdays')}
            className="quick-action-button"
          >
            Weekdays (Mon-Fri)
            <span>9 AM - 5 PM</span>
          </button>
          <button
            onClick={() => handleQuickSetup('weekends')}
            className="quick-action-button"
          >
            Weekends (Sat-Sun)
            <span>9 AM - 5 PM</span>
          </button>
          <button
            onClick={() => handleQuickSetup('all-week')}
            className="quick-action-button"
          >
            All Week
            <span>9 AM - 5 PM</span>
          </button>
          <button
            onClick={handleClearFuture}
            className="quick-action-button danger"
          >
            Clear Future Availability
          </button>
        </div>
      </div>

      <div className="calendar-section">
        <h3>Set Custom Availability</h3>
        <p>Click on any date to add or modify time slots:</p>
        <AvailabilityCalendar
          parkingSpaceId={spaceId || ''}
          availabilities={availabilities}
          onAvailabilityChange={handleAvailabilityChange}
          readOnly={false}
        />
      </div>

      <div className="save-section">
        {pendingChanges && (
          <div className="pending-changes-notice">
            You have unsaved changes
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !pendingChanges}
          className="save-button"
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
};

export default ManageAvailability;
