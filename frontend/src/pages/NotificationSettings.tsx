import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import '../styles/NotificationSettings.css';

interface NotificationPreferences {
  // Email preferences
  emailBookingConfirm: boolean;
  emailBookingReminder: boolean;
  emailBookingCancelled: boolean;
  emailNewMessage: boolean;
  emailReviewReceived: boolean;
  emailPaymentReceived: boolean;
  emailMarketingUpdates: boolean;
  // Push preferences
  pushEnabled: boolean;
  pushBookingConfirm: boolean;
  pushBookingReminder: boolean;
  pushBookingCancelled: boolean;
  pushNewMessage: boolean;
  pushReviewReceived: boolean;
  pushPaymentReceived: boolean;
  // In-app preferences
  inAppEnabled: boolean;
}

const NotificationSettings: React.FC = () => {
  const {
    isPushSupported,
    isPushSubscribed,
    subscribeToPush,
    unsubscribeFromPush
  } = useNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailBookingConfirm: true,
    emailBookingReminder: true,
    emailBookingCancelled: true,
    emailNewMessage: true,
    emailReviewReceived: true,
    emailPaymentReceived: true,
    emailMarketingUpdates: false,
    pushEnabled: true,
    pushBookingConfirm: true,
    pushBookingReminder: true,
    pushBookingCancelled: true,
    pushNewMessage: true,
    pushReviewReceived: true,
    pushPaymentReceived: true,
    inAppEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data.data.preferences);
    } catch (err: any) {
      console.error('Error fetching preferences:', err);
      setError(err.response?.data?.message || 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSuccessMessage('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      await api.patch('/notifications/preferences', preferences);

      setSuccessMessage('Notification preferences saved successfully!');
    } catch (err: any) {
      console.error('Error saving preferences:', err);
      setError(err.response?.data?.message || 'Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = async () => {
    setPushLoading(true);
    try {
      if (isPushSubscribed) {
        await unsubscribeFromPush();
        setSuccessMessage('Push notifications disabled');
      } else {
        const success = await subscribeToPush();
        if (success) {
          setSuccessMessage('Push notifications enabled! You will now receive browser notifications.');
        } else {
          setError('Failed to enable push notifications. Please allow notifications in your browser settings.');
        }
      }
    } catch (err: any) {
      setError('Failed to update push notification settings');
    } finally {
      setPushLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="notification-settings-container">
        <div className="loading">Loading your preferences...</div>
      </div>
    );
  }

  return (
    <div className="notification-settings-container">
      <div className="settings-header">
        <h1>Notification Preferences</h1>
        <p>Manage how and when you receive notifications from us</p>
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

      {/* Push Notifications Section */}
      {isPushSupported && (
        <div className="settings-section push-section">
          <h2>Push Notifications</h2>
          <p className="section-description">
            Get instant notifications in your browser
          </p>

          <div className="push-status-card">
            <div className="push-status-info">
              <div className={`push-status-indicator ${isPushSubscribed ? 'active' : ''}`}></div>
              <div>
                <h3>Browser Push Notifications</h3>
                <p>
                  {isPushSubscribed
                    ? 'Push notifications are enabled on this device'
                    : 'Enable push notifications to get instant updates'}
                </p>
              </div>
            </div>
            <button
              className={`push-toggle-button ${isPushSubscribed ? 'enabled' : ''}`}
              onClick={handlePushToggle}
              disabled={pushLoading}
            >
              {pushLoading ? 'Processing...' : isPushSubscribed ? 'Disable' : 'Enable'}
            </button>
          </div>

          {isPushSubscribed && (
            <>
              <div className="preference-item">
                <div className="preference-info">
                  <h3>Push Enabled</h3>
                  <p>Master switch for all push notifications</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.pushEnabled}
                    onChange={() => handleToggle('pushEnabled')}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h3>Booking Confirmations</h3>
                  <p>Push notifications for booking confirmations</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.pushBookingConfirm}
                    onChange={() => handleToggle('pushBookingConfirm')}
                    disabled={!preferences.pushEnabled}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h3>Booking Reminders</h3>
                  <p>Push notifications for upcoming bookings</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.pushBookingReminder}
                    onChange={() => handleToggle('pushBookingReminder')}
                    disabled={!preferences.pushEnabled}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="preference-item">
                <div className="preference-info">
                  <h3>New Messages</h3>
                  <p>Push notifications for new messages</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={preferences.pushNewMessage}
                    onChange={() => handleToggle('pushNewMessage')}
                    disabled={!preferences.pushEnabled}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {/* In-App Notifications Section */}
      <div className="settings-section">
        <h2>In-App Notifications</h2>
        <p className="section-description">
          Notifications displayed in the notification center
        </p>

        <div className="preference-item">
          <div className="preference-info">
            <h3>In-App Notifications</h3>
            <p>Show notifications in the notification bell</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.inAppEnabled}
              onChange={() => handleToggle('inAppEnabled')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Email Notifications Sections */}
      <div className="settings-section">
        <h2>Email - Booking Notifications</h2>
        <p className="section-description">
          Get email updates about your parking bookings
        </p>

        <div className="preference-item">
          <div className="preference-info">
            <h3>Booking Confirmations</h3>
            <p>Receive an email when your booking is confirmed</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.emailBookingConfirm}
              onChange={() => handleToggle('emailBookingConfirm')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="preference-item">
          <div className="preference-info">
            <h3>Booking Reminders</h3>
            <p>Receive a reminder 24 hours before your booking starts</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.emailBookingReminder}
              onChange={() => handleToggle('emailBookingReminder')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="preference-item">
          <div className="preference-info">
            <h3>Booking Cancellations</h3>
            <p>Get notified when a booking is cancelled</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.emailBookingCancelled}
              onChange={() => handleToggle('emailBookingCancelled')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h2>Email - Communication</h2>
        <p className="section-description">
          Stay connected with other users
        </p>

        <div className="preference-item">
          <div className="preference-info">
            <h3>New Messages</h3>
            <p>Receive emails when you get new messages</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.emailNewMessage}
              onChange={() => handleToggle('emailNewMessage')}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="preference-item">
          <div className="preference-info">
            <h3>Reviews Received</h3>
            <p>Get notified when someone reviews your parking space</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.emailReviewReceived}
              onChange={() => handleToggle('emailReviewReceived')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h2>Email - Financial</h2>
        <p className="section-description">
          Payment and earnings notifications
        </p>

        <div className="preference-item">
          <div className="preference-info">
            <h3>Payment Confirmations</h3>
            <p>Receive emails for payment confirmations and receipts</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.emailPaymentReceived}
              onChange={() => handleToggle('emailPaymentReceived')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h2>Email - Marketing & Updates</h2>
        <p className="section-description">
          Optional promotional content
        </p>

        <div className="preference-item">
          <div className="preference-info">
            <h3>Marketing Emails</h3>
            <p>Receive promotional offers and platform updates</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={preferences.emailMarketingUpdates}
              onChange={() => handleToggle('emailMarketingUpdates')}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <div className="save-section">
        <button
          onClick={handleSave}
          disabled={saving}
          className="save-button"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
