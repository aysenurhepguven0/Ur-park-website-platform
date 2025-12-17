import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import PhoneVerification from '../components/PhoneVerification';
import '../styles/Profile.css';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await userApi.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Update local storage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const updatedUser = { ...JSON.parse(storedUser), ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page profile-page">
      <div className="container" style={{ maxWidth: '700px' }}>
        <h1>My Profile</h1>

        {/* Basic Profile Info */}
        <div className="card profile-card">
          <h2>Account Information</h2>
          {!isEditing ? (
            <>
              <div className="profile-field">
                <span className="field-label">Name</span>
                <span className="field-value">
                  {user.firstName} {user.lastName}
                </span>
              </div>

              <div className="profile-field">
                <span className="field-label">Email</span>
                <span className="field-value">
                  {user.email}
                  {user.isEmailVerified && (
                    <span className="verified-badge">Verified</span>
                  )}
                </span>
              </div>

              <div className="profile-actions">
                <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                  Edit Profile
                </button>
                <button onClick={logout} className="btn btn-danger">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user.email} disabled />
                <small>Email cannot be changed</small>
              </div>

              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Phone Verification Section */}
        <div className="profile-section">
          <PhoneVerification />
        </div>

        {/* Account Stats */}
        <div className="card profile-card">
          <h2>Account Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Member Since</span>
              <span className="status-value">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Email Status</span>
              <span className={`status-badge ${user.isEmailVerified ? 'verified' : 'unverified'}`}>
                {user.isEmailVerified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Account Type</span>
              <span className="status-value">{user.role || 'User'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
