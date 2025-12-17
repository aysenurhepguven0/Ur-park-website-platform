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

const CorporateDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'reservations' | 'schedule'>('overview');
  // Araç filosu - Kullanıcı kendi araçlarını ekleyecek
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleBulkReservation = async () => {
    if (selectedSpaces.length === 0) {
      alert(t('corporateDash.reservations.selectSpaceError'));
      return;
    }
    if (!bulkReservation.startDate || !bulkReservation.endDate) {
      alert(t('corporateDash.reservations.selectDateError'));
      return;
    }

    setLoading(true);
    try {
      // Simulated bulk reservation
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`${vehicles.length} ${t('corporateDash.reservations.successMessage')} ${selectedSpaces.length}`);
      setSelectedSpaces([]);
    } catch (error) {
      console.error('Bulk reservation error:', error);
      alert('An error occurred while creating the reservation');
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
                  <label>{t('corporateDash.reservations.selectSpaces')} ({selectedSpaces.length} {t('corporateDash.reservations.selectedCount')})</label>
                  <div className="parking-spaces-grid">
                    {parkingSpaces.slice(0, 6).map(space => (
                      <div
                        key={space.id}
                        className={`space-card ${selectedSpaces.includes(space.id) ? 'selected' : ''}`}
                        onClick={() => toggleSpaceSelection(space.id)}
                      >
                        <div className="space-checkbox">
                          {selectedSpaces.includes(space.id) && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <div className="space-info">
                          <span className="space-title">{space.title}</span>
                          <span className="space-address">{space.address}</span>
                          <span className="space-price">₺{space.pricePerHour}/hour</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
