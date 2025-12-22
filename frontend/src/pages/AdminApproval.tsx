import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminApproval.css';

interface ParkingSpace {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  pricePerHour: number;
  pricePerDay: number | null;
  pricePerMonth: number | null;
  spaceType: string;
  images: string[];
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const AdminApproval: React.FC = () => {
  const navigate = useNavigate();
  const [pendingSpaces, setPendingSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingSpaces();
  }, []);

  const fetchPendingSpaces = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

      const response = await axios.get(`${API_URL}/admin/spaces/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPendingSpaces(response.data.data.spaces);
    } catch (err: any) {
      console.error('Failed to fetch pending spaces:', err);
      if (err.response?.status === 403) {
        setError('Bu sayfaya erişim yetkiniz yok. Sadece admin kullanıcılar erişebilir.');
      } else {
        setError('Onay bekleyen park yerleri yüklenemedi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (spaceId: string) => {
    if (!window.confirm('Bu park yerini onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

      await axios.patch(
        `${API_URL}/admin/spaces/${spaceId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Park yeri başarıyla onaylandı!');
      fetchPendingSpaces(); // Refresh list
    } catch (err: any) {
      console.error('Approval failed:', err);
      alert(err.response?.data?.message || 'Onaylama işlemi başarısız oldu.');
    }
  };

  const handleReject = async (spaceId: string) => {
    const reason = window.prompt('Reddetme sebebi (opsiyonel):');
    if (reason === null) return; // User cancelled

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

      await axios.patch(
        `${API_URL}/admin/spaces/${spaceId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Park yeri reddedildi.');
      fetchPendingSpaces(); // Refresh list
    } catch (err: any) {
      console.error('Rejection failed:', err);
      alert(err.response?.data?.message || 'Reddetme işlemi başarısız oldu.');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="loading">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>Hata</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page admin-approval-page">
      <div className="container">
        <div className="admin-header">
          <h1>🔐 Admin - Park Yeri Onay Paneli</h1>
          <p className="admin-subtitle">
            Onay bekleyen park yerlerini inceleyin ve onaylayın/reddedin
          </p>
        </div>

        {pendingSpaces.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2>Onay Bekleyen Park Yeri Yok</h2>
            <p style={{ color: '#666', marginTop: '8px' }}>
              Tüm park yerleri onaylanmış durumda.
            </p>
          </div>
        ) : (
          <div className="pending-spaces-grid">
            {pendingSpaces.map((space) => (
              <div key={space.id} className="card pending-space-card">
                {/* Image */}
                {space.images && space.images.length > 0 ? (
                  <img
                    src={space.images[0]}
                    alt={space.title}
                    className="space-image"
                  />
                ) : (
                  <div className="space-image-placeholder">
                    📸 Resim Yok
                  </div>
                )}

                {/* Content */}
                <div className="space-content">
                  <h3 className="space-title">{space.title}</h3>

                  <div className="space-info">
                    <div className="info-item">
                      <strong>📍 Konum:</strong> {space.city}, {space.state}
                    </div>
                    <div className="info-item">
                      <strong>📫 Adres:</strong> {space.address}
                    </div>
                    <div className="info-item">
                      <strong>🏷️ Tip:</strong> {space.spaceType}
                    </div>
                    <div className="info-item">
                      <strong>💰 Fiyat:</strong> ₺{space.pricePerHour}/saat
                      {space.pricePerDay && ` | ₺${space.pricePerDay}/gün`}
                      {space.pricePerMonth && ` | ₺${space.pricePerMonth}/ay`}
                    </div>
                    <div className="info-item">
                      <strong>📝 Açıklama:</strong>
                      <p style={{ marginTop: '4px', color: '#666' }}>{space.description}</p>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div className="owner-info">
                    <strong>👤 Sahibi:</strong> {space.owner.firstName} {space.owner.lastName}
                    <br />
                    <small style={{ color: '#666' }}>{space.owner.email}</small>
                  </div>

                  {/* Created Date */}
                  <div className="created-date">
                    <small style={{ color: '#999' }}>
                      Oluşturulma: {new Date(space.createdAt).toLocaleString('tr-TR')}
                    </small>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(space.id)}
                    >
                      ✓ Onayla
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(space.id)}
                    >
                      ✗ Reddet
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApproval;
