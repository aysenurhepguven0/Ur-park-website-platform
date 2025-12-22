import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { parkingSpaceApi, bookingApi } from '../services/api';
import './CorporateDashboard.css';

interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: string;
  driverName: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface BulkReservation {
  parkingSpaceId: string;
  parkingSpaceName: string;
  vehicles: string[];
  timeSlots: TimeSlot[];
  startDate: string;
  endDate: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

interface GeneratedReservation {
  id: string;
  date: string;
  timeSlot: string;
  parkingSpace: string;
  vehicle: string;
  status: 'upcoming' | 'active' | 'completed';
}

const CorporateDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'reservations' | 'schedule'>('overview');
  // Araç filosu - Kullanıcı kendi araçlarını ekleyecek
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedReservations, setGeneratedReservations] = useState<GeneratedReservation[]>([]);
  const [showReservationPreview, setShowReservationPreview] = useState(false);

  // Zaman dilimleri - Kullanıcı mesai saatleri dışında (09:00-17:00) ayarlayabilir
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', startTime: '09:00', endTime: '12:00', isActive: true },
    { id: '2', startTime: '12:00', endTime: '15:00', isActive: true },
    { id: '3', startTime: '15:00', endTime: '17:00', isActive: true },
  ]);

  const [newVehicle, setNewVehicle] = useState({
    plateNumber: '',
    vehicleType: 'Shuttle Minibus',
    driverName: ''
  });

  const [bulkReservation, setBulkReservation] = useState({
    startDate: '',
    endDate: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    selectedTimeSlots: [] as string[]
  });

  useEffect(() => {
    fetchParkingSpaces();
  }, []);

  const fetchParkingSpaces = async () => {
    try {
      const response = await parkingSpaceApi.getAll({ limit: 20 });
      setParkingSpaces(response.data.parkingSpaces || []);
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
    }
  };

  const handleAddVehicle = () => {
    if (newVehicle.plateNumber && newVehicle.driverName) {
      setVehicles([...vehicles, {
        id: Date.now().toString(),
        ...newVehicle
      }]);
      setNewVehicle({ plateNumber: '', vehicleType: 'Shuttle Minibus', driverName: '' });
    }
  };

  const handleRemoveVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  // Toplu rezervasyon tarihleri hesaplama
  const generateDates = (start: string, end: string, frequency: 'daily' | 'weekly' | 'monthly'): string[] => {
    const dates: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);

      // Frequency'ye göre ileri sar
      switch (frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    return dates;
  };

  const handleBulkReservation = async () => {
    // Validasyon
    if (vehicles.length === 0) {
      alert(t('corporateDash.reservations.noVehiclesError') || 'Lütfen önce araç ekleyin!');
      setActiveTab('fleet');
      return;
    }
    if (selectedSpaces.length === 0) {
      alert(t('corporateDash.reservations.selectSpaceError'));
      return;
    }
    if (!bulkReservation.startDate || !bulkReservation.endDate) {
      alert(t('corporateDash.reservations.selectDateError'));
      return;
    }
    if (bulkReservation.selectedTimeSlots.length === 0) {
      alert(t('corporateDash.reservations.selectTimeSlotError') || 'Lütfen en az bir zaman dilimi seçin!');
      return;
    }

    setLoading(true);
    try {
      // Tarihleri hesapla
      const dates = generateDates(
        bulkReservation.startDate,
        bulkReservation.endDate,
        bulkReservation.frequency
      );

      // Seçili zaman dilimlerini al
      const selectedSlots = timeSlots.filter(slot =>
        bulkReservation.selectedTimeSlots.includes(slot.id)
      );

      // Mock rezervasyonlar oluştur
      const reservations: GeneratedReservation[] = [];
      let vehicleIndex = 0;

      dates.forEach(date => {
        selectedSlots.forEach(slot => {
          selectedSpaces.forEach(spaceId => {
            const space = parkingSpaces.find(s => s.id === spaceId);
            const vehicle = vehicles[vehicleIndex % vehicles.length]; // Round-robin

            const reservation: GeneratedReservation = {
              id: `${date}-${slot.id}-${spaceId}-${Math.random()}`,
              date: date,
              timeSlot: `${slot.startTime} - ${slot.endTime}`,
              parkingSpace: space?.title || 'Unknown',
              vehicle: `${vehicle.plateNumber} (${vehicle.driverName})`,
              status: new Date(date) < new Date() ? 'completed' :
                      new Date(date).toDateString() === new Date().toDateString() ? 'active' : 'upcoming'
            };

            reservations.push(reservation);
            vehicleIndex++; // Bir sonraki araca geç
          });
        });
      });

      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setGeneratedReservations(reservations);
      setShowReservationPreview(true);

      alert(`✅ Başarılı!\n\n${reservations.length} rezervasyon oluşturuldu:\n- ${dates.length} gün\n- ${selectedSlots.length} zaman dilimi\n- ${selectedSpaces.length} park yeri\n- ${vehicles.length} araç kullanıldı`);
    } catch (error) {
      console.error('Bulk reservation error:', error);
      alert('Rezervasyon oluşturulurken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const toggleSpaceSelection = (spaceId: string) => {
    setSelectedSpaces(prev =>
      prev.includes(spaceId)
        ? prev.filter(id => id !== spaceId)
        : [...prev, spaceId]
    );
  };

  const toggleTimeSlot = (slotId: string) => {
    setBulkReservation(prev => ({
      ...prev,
      selectedTimeSlots: prev.selectedTimeSlots.includes(slotId)
        ? prev.selectedTimeSlots.filter(id => id !== slotId)
        : [...prev.selectedTimeSlots, slotId]
    }));
  };

  return (
    <div className="corporate-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-info">
            <h1>{t('corporateDash.title')}</h1>
            <p>{t('corporateDash.subtitle')}</p>
          </div>
          <div className="company-info">
            <span className="company-badge">{t('corporateDash.corporateAccount')}</span>
            <span className="company-name">{user?.firstName} {user?.lastName}</span>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon vehicles">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{vehicles.length}</span>
              <span className="stat-label">{t('corporateDash.stats.vehicles')}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon reservations">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">12</span>
              <span className="stat-label">{t('corporateDash.stats.activeReservations')}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon savings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">₺2,450</span>
              <span className="stat-label">{t('corporateDash.stats.savingsThisMonth')}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">09:00-17:00</span>
              <span className="stat-label">{t('corporateDash.stats.parkingTimeSlot')}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {t('corporateDash.tabs.overview')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveTab('fleet')}
          >
            {t('corporateDash.tabs.fleet')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservations')}
          >
            {t('corporateDash.tabs.reservations')}
          </button>
          <button
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            {t('corporateDash.tabs.schedule')}
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="info-card">
                <h3>{t('corporateDash.overview.title')}</h3>
                <p>{t('corporateDash.overview.description')}</p>
                <div className="time-info">
                  <div className="time-block service">
                    <span className="time-label">{t('corporateDash.overview.serviceHours')}</span>
                    <span className="time-value">{t('corporateDash.overview.serviceHoursTime')}</span>
                    <span className="time-desc">{t('corporateDash.overview.serviceHoursDesc')}</span>
                  </div>
                  <div className="time-block parking">
                    <span className="time-label">{t('corporateDash.overview.parkingHours')}</span>
                    <span className="time-value">{t('corporateDash.overview.parkingHoursTime')}</span>
                    <span className="time-desc">{t('corporateDash.overview.parkingHoursDesc')}</span>
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <h3>{t('corporateDash.overview.quickActions')}</h3>
                <div className="action-grid">
                  <button className="action-btn" onClick={() => setActiveTab('reservations')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    {t('corporateDash.overview.newBulkReservation')}
                  </button>
                  <button className="action-btn" onClick={() => setActiveTab('fleet')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
                      <circle cx="7" cy="17" r="2"/>
                      <circle cx="17" cy="17" r="2"/>
                    </svg>
                    {t('corporateDash.overview.addVehicle')}
                  </button>
                  <Link to="/parking-spaces" className="action-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {t('corporateDash.overview.parkingSpaces')}
                  </Link>
                  <Link to="/analytics" className="action-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 20V10M12 20V4M6 20v-6"/>
                    </svg>
                    {t('corporateDash.overview.reports')}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="fleet-section">
              <div className="fleet-header">
                <h3>{t('corporateDash.fleet.title')}</h3>
                <p>{t('corporateDash.fleet.subtitle')}</p>
              </div>

              <div className="add-vehicle-form">
                <h4>{t('corporateDash.fleet.addVehicle')}</h4>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder={t('corporateDash.fleet.platePlaceholder')}
                    value={newVehicle.plateNumber}
                    onChange={(e) => setNewVehicle({...newVehicle, plateNumber: e.target.value})}
                  />
                  <select
                    value={newVehicle.vehicleType}
                    onChange={(e) => setNewVehicle({...newVehicle, vehicleType: e.target.value})}
                  >
                    <option value="Shuttle Minibus">{t('corporateDash.fleet.vehicleTypes.shuttleMinibus')}</option>
                    <option value="Shuttle Bus">{t('corporateDash.fleet.vehicleTypes.shuttleBus')}</option>
                    <option value="Staff Vehicle">{t('corporateDash.fleet.vehicleTypes.staffVehicle')}</option>
                  </select>
                  <input
                    type="text"
                    placeholder={t('corporateDash.fleet.driverPlaceholder')}
                    value={newVehicle.driverName}
                    onChange={(e) => setNewVehicle({...newVehicle, driverName: e.target.value})}
                  />
                  <button className="btn-add" onClick={handleAddVehicle}>{t('corporateDash.fleet.addButton')}</button>
                </div>
              </div>

              <div className="vehicles-list">
                <h4>{t('corporateDash.fleet.registeredVehicles')} ({vehicles.length})</h4>
                <div className="vehicles-grid">
                  {vehicles.map(vehicle => (
                    <div key={vehicle.id} className="vehicle-card">
                      <div className="vehicle-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-4H8L6 10l-2.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/>
                          <circle cx="7" cy="17" r="2"/>
                          <circle cx="17" cy="17" r="2"/>
                        </svg>
                      </div>
                      <div className="vehicle-info">
                        <span className="plate">{vehicle.plateNumber}</span>
                        <span className="type">{vehicle.vehicleType}</span>
                        <span className="driver">{vehicle.driverName}</span>
                      </div>
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveVehicle(vehicle.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="reservations-section">
              <div className="reservations-header">
                <h3>{t('corporateDash.reservations.title')}</h3>
                <p>{t('corporateDash.reservations.subtitle')}</p>
              </div>

              <div className="reservation-form">
                <div className="form-group">
                  <label>{t('corporateDash.reservations.dateRange')}</label>
                  <div className="date-inputs">
                    <input
                      type="date"
                      value={bulkReservation.startDate}
                      onChange={(e) => setBulkReservation({...bulkReservation, startDate: e.target.value})}
                    />
                    <span>-</span>
                    <input
                      type="date"
                      value={bulkReservation.endDate}
                      onChange={(e) => setBulkReservation({...bulkReservation, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('corporateDash.reservations.frequency')}</label>
                  <select
                    value={bulkReservation.frequency}
                    onChange={(e) => setBulkReservation({...bulkReservation, frequency: e.target.value as any})}
                  >
                    <option value="daily">{t('corporateDash.reservations.frequencyOptions.daily')}</option>
                    <option value="weekly">{t('corporateDash.reservations.frequencyOptions.weekly')}</option>
                    <option value="monthly">{t('corporateDash.reservations.frequencyOptions.monthly')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('corporateDash.reservations.timeSlots')}</label>
                  <div className="time-slots">
                    {timeSlots.map(slot => (
                      <button
                        key={slot.id}
                        className={`time-slot-btn ${bulkReservation.selectedTimeSlots.includes(slot.id) ? 'selected' : ''}`}
                        onClick={() => toggleTimeSlot(slot.id)}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <label style={{ margin: 0 }}>
                      {t('corporateDash.reservations.selectSpaces')}
                      <span style={{
                        marginLeft: '8px',
                        padding: '4px 12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {selectedSpaces.length} Seçildi
                      </span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setSelectedSpaces(parkingSpaces.map(s => s.id))}
                        style={{ fontSize: '14px', padding: '6px 12px' }}
                      >
                        ✓ Tümünü Seç
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setSelectedSpaces([])}
                        style={{ fontSize: '14px', padding: '6px 12px' }}
                      >
                        ✗ Temizle
                      </button>
                    </div>
                  </div>
                  <div className="parking-spaces-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '16px'
                  }}>
                    {parkingSpaces.slice(0, 12).map(space => (
                      <div
                        key={space.id}
                        className={`space-card ${selectedSpaces.includes(space.id) ? 'selected' : ''}`}
                        onClick={() => toggleSpaceSelection(space.id)}
                        style={{
                          position: 'relative',
                          border: selectedSpaces.includes(space.id) ? '3px solid #667eea' : '2px solid #e0e0e0',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: selectedSpaces.includes(space.id) ? '#f0f4ff' : 'white',
                          boxShadow: selectedSpaces.includes(space.id) ? '0 4px 12px rgba(102, 126, 234, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: selectedSpaces.includes(space.id) ? '#667eea' : 'white',
                          border: selectedSpaces.includes(space.id) ? 'none' : '2px solid #ccc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}>
                          {selectedSpaces.includes(space.id) && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width: '20px', height: '20px' }}>
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>

                        {/* Image */}
                        {space.images && space.images.length > 0 ? (
                          <img
                            src={space.images[0]}
                            alt={space.title}
                            style={{
                              width: '100%',
                              height: '160px',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '160px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '48px'
                          }}>
                            🅿️
                          </div>
                        )}

                        {/* Content */}
                        <div style={{ padding: '16px' }}>
                          <h4 style={{
                            margin: '0 0 8px 0',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            {space.title}
                          </h4>
                          <p style={{
                            margin: '0 0 12px 0',
                            fontSize: '13px',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            📍 {space.address}, {space.city}
                          </p>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '12px',
                            borderTop: '1px solid #e0e0e0'
                          }}>
                            <div>
                              <div style={{ fontSize: '20px', fontWeight: '700', color: '#667eea' }}>
                                ₺{space.pricePerHour}
                              </div>
                              <div style={{ fontSize: '11px', color: '#999' }}>
                                saat başı
                              </div>
                            </div>
                            {space.pricePerDay && (
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#555' }}>
                                  ₺{space.pricePerDay}
                                </div>
                                <div style={{ fontSize: '11px', color: '#999' }}>
                                  günlük
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Space Type Badge */}
                          <div style={{
                            marginTop: '12px',
                            padding: '6px 10px',
                            background: '#f5f5f5',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#666',
                            textAlign: 'center'
                          }}>
                            {space.spaceType?.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {parkingSpaces.length > 12 && (
                    <p style={{
                      textAlign: 'center',
                      marginTop: '16px',
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      İlk 12 park yeri gösteriliyor. Toplam {parkingSpaces.length} park yeri mevcut.
                    </p>
                  )}
                </div>

                <div className="reservation-summary">
                  <h4>{t('corporateDash.reservations.summary')}</h4>
                  <div className="summary-item">
                    <span>{t('corporateDash.reservations.selectedVehicles')}</span>
                    <strong>{vehicles.length}</strong>
                  </div>
                  <div className="summary-item">
                    <span>{t('corporateDash.reservations.selectedSpaces')}</span>
                    <strong>{selectedSpaces.length}</strong>
                  </div>
                  <div className="summary-item">
                    <span>{t('corporateDash.reservations.timeSlotsLabel')}</span>
                    <strong>{bulkReservation.selectedTimeSlots.length > 0
                      ? timeSlots.filter(s => bulkReservation.selectedTimeSlots.includes(s.id)).map(s => `${s.startTime}-${s.endTime}`).join(', ')
                      : t('corporateDash.reservations.notSelected')
                    }</strong>
                  </div>
                </div>

                <button
                  className="btn-create-reservation"
                  onClick={handleBulkReservation}
                  disabled={loading}
                >
                  {loading ? t('corporateDash.reservations.creating') : t('corporateDash.reservations.createButton')}
                </button>
              </div>

              {/* Oluşturulan Rezervasyonlar Preview */}
              {showReservationPreview && generatedReservations.length > 0 && (
                <div className="reservations-preview" style={{ marginTop: '32px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h4>📋 Oluşturulan Rezervasyonlar ({generatedReservations.length})</h4>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowReservationPreview(false)}
                    >
                      Gizle
                    </button>
                  </div>

                  <div className="stats-summary" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '16px',
                      borderRadius: '8px',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>
                        {generatedReservations.filter(r => r.status === 'upcoming').length}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Gelecek Rezervasyonlar</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      padding: '16px',
                      borderRadius: '8px',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>
                        {generatedReservations.filter(r => r.status === 'active').length}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Aktif Rezervasyonlar</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      padding: '16px',
                      borderRadius: '8px',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '24px', fontWeight: '700' }}>
                        {generatedReservations.filter(r => r.status === 'completed').length}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Tamamlanan</div>
                    </div>
                  </div>

                  <div style={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse'
                    }}>
                      <thead style={{
                        background: '#f5f5f5',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                      }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>#</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Tarih</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Saat</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Park Yeri</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Araç</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedReservations.map((reservation, index) => (
                          <tr key={reservation.id} style={{
                            background: index % 2 === 0 ? 'white' : '#fafafa'
                          }}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              {index + 1}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              {new Date(reservation.date).toLocaleDateString('tr-TR')}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              {reservation.timeSlot}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              {reservation.parkingSpace}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              {reservation.vehicle}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e0e0e0' }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background:
                                  reservation.status === 'upcoming' ? '#e3f2fd' :
                                  reservation.status === 'active' ? '#fff3e0' : '#f1f8e9',
                                color:
                                  reservation.status === 'upcoming' ? '#1976d2' :
                                  reservation.status === 'active' ? '#f57c00' : '#689f38'
                              }}>
                                {reservation.status === 'upcoming' ? '⏳ Gelecek' :
                                 reservation.status === 'active' ? '🔴 Aktif' : '✅ Tamamlandı'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="schedule-section">
              <div className="schedule-header">
                <h3>{t('corporateDash.schedule.title')}</h3>
                <p>{t('corporateDash.schedule.subtitle')}</p>
              </div>

              <div className="weekly-schedule">
                <div className="schedule-grid">
                  <div className="schedule-header-row">
                    <div className="time-column">{t('corporateDash.schedule.time')}</div>
                    <div className="day-column">{t('corporateDash.schedule.days.monday')}</div>
                    <div className="day-column">{t('corporateDash.schedule.days.tuesday')}</div>
                    <div className="day-column">{t('corporateDash.schedule.days.wednesday')}</div>
                    <div className="day-column">{t('corporateDash.schedule.days.thursday')}</div>
                    <div className="day-column">{t('corporateDash.schedule.days.friday')}</div>
                  </div>

                  <div className="schedule-row service-time">
                    <div className="time-column">07:00 - 09:00</div>
                    <div className="day-column"><span className="service-label">{t('corporateDash.schedule.service')}</span></div>
                    <div className="day-column"><span className="service-label">{t('corporateDash.schedule.service')}</span></div>
                    <div className="day-column"><span className="service-label">{t('corporateDash.schedule.service')}</span></div>
                    <div className="day-column"><span className="service-label">{t('corporateDash.schedule.service')}</span></div>
                    <div className="day-column"><span className="service-label">{t('corporateDash.schedule.service')}</span></div>
                  </div>

                  <div className="schedule-row parking-time">
                    <div className="time-column">09:00 - 12:00</div>
                    <div className="day-column"><span className="parking-label">{t('corporateDash.schedule.parking')} - Downtown</span></div>
                    <div className="day-column"><span className="parking-label">{t('corporateDash.schedule.parking')} - Downtown</span></div>
                    <div className="day-column"><span className="parking-label">{t('corporateDash.schedule.parking')} - Uptown</span></div>
                    <div className="day-column"><span className="parking-label">{t('corporateDash.schedule.parking')} - Downtown</span></div>
                    <div className="day-column"><span className="parking-label">{t('corporateDash.schedule.parking')} - Downtown</span></div>
                  </div>

                  <div className="schedule-row parking-time">
                    <div className="time-column">12:00 - 17:00</div>
                    <div className="day-column"><span className="parking-label">{t('corporateDash.schedule.parking')} - Downtown</span></div>
                    <div className="day-column"><span className="parking-label">{t('corporateDash.schedule.parking')} - Downtown</span></div>
                    <div className="day-column"><span className="parking-label">{t('corporateDash.schedule.parking')} - Uptown</span></div>
                    <div className="day-column"><span className="parking-label">{t('corporateDash.schedule.parking')} - Downtown</span></div>
                    <div className="day-column"><span className="parking-label">{t('corporateDash.schedule.parking')} - Downtown</span></div>
                  </div>

                  <div className="schedule-row service-time">
                    <div className="time-column">17:00 - 19:00</div>
                    <div className="day-column"><span className="service-label">{t('corporateDash.schedule.service')}</span></div>
                    <div className="day-column"><span className="service-label">{t('corporateDash.schedule.service')}</span></div>
                    <div className="day-column"><span className="service-label">{t('corporateDash.schedule.service')}</span></div>
                    <div className="day-column"><span className="service-label">{t('corporateDash.schedule.service')}</span></div>
                    <div className="day-column"><span className="service-label">{t('corporateDash.schedule.service')}</span></div>
                  </div>
                </div>
              </div>

              <div className="schedule-legend">
                <div className="legend-item">
                  <span className="legend-color service"></span>
                  <span>{t('corporateDash.schedule.legend.serviceHours')}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color parking"></span>
                  <span>{t('corporateDash.schedule.legend.parkingHours')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateDashboard;
