import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parkingSpaceApi } from '../services/api';

const MySpaces: React.FC = () => {
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
    if (!window.confirm('Are you sure you want to delete this parking space?')) {
      return;
    }

    try {
      await parkingSpaceApi.delete(id);
      setSpaces(spaces.filter((space) => space.id !== id));
      alert('Parking space deleted successfully');
    } catch (error) {
      console.error('Failed to delete parking space:', error);
      alert('Failed to delete parking space');
    }
  };

  if (loading) {
    return <div className="loading">Loading your parking spaces...</div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>My Parking Spaces</h1>
          <Link to="/create-space" className="btn btn-primary">
            Add New Space
          </Link>
        </div>

        {spaces.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <p>You haven't listed any parking spaces yet.</p>
            <Link to="/create-space" className="btn btn-primary" style={{ marginTop: '16px' }}>
              List Your First Space
            </Link>
          </div>
        ) : (
          <div className="grid">
            {spaces.map((space) => (
              <div key={space.id} className="card">
                <h3>{space.title}</h3>
                <p style={{ color: '#666', marginBottom: '8px' }}>
                  {space.city}, {space.state}
                </p>
                <p style={{ color: '#28a745', fontWeight: '600', marginBottom: '8px' }}>
                  ₺{space.pricePerHour}/hr
                </p>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  {space.bookingCount} booking{space.bookingCount !== 1 ? 's' : ''}
                </p>
                {space.reviewCount > 0 && (
                  <p style={{ fontSize: '14px' }}>
                    {space.averageRating} ({space.reviewCount} reviews)
                  </p>
                )}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <Link to={`/parking-spaces/${space.id}`} className="btn btn-primary">
                    View
                  </Link>
                  <Link to={`/edit-space/${space.id}`} className="btn btn-secondary">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(space.id)} className="btn btn-danger">
                    Delete
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
