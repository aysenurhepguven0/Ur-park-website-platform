import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { parkingSpaceApi } from '../services/api';
import './Home.css';

interface ParkingSpace {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
}

const defaultCenter = {
  lat: 41.0082,
  lng: 29.0300 // İstanbul (Kadıköy, Beşiktaş, Ataşehir bölgesi)
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  // Fetch parking spaces for the map
  useEffect(() => {
    const fetchParkingSpaces = async () => {
      try {
        const response = await parkingSpaceApi.getAll({ limit: 20 });
        setParkingSpaces(response.data.data.parkingSpaces);
      } catch (error) {
        console.error('Failed to fetch parking spaces for map:', error);
      } finally {
        setMapLoading(false);
      }
    };
    fetchParkingSpaces();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-badge">{t('home.badge')}</div>
          <h1>
            {t('home.hero.title')}
            <span className="gradient-text"> {t('home.hero.titleHighlight')}</span>
          </h1>
          <p className="hero-subtitle">
            {t('home.hero.subtitle')}
          </p>
          <div className="hero-buttons">
            <Link to="/parking-spaces" className="btn btn-hero-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              {t('home.hero.findParking')}
            </Link>
            <Link to="/create-space" className="btn btn-hero-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t('home.hero.listSpace')}
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">{t('home.stats.parkingSpots')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">{t('home.stats.happyUsers')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">3+</span>
              <span className="stat-label">{t('home.stats.cities')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t('home.features.badge')}</span>
            <h2>{t('home.features.title')}</h2>
            <p>{t('home.features.subtitle')}</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <div className="feature-number">01</div>
              <h3>{t('home.features.step1')}</h3>
              <p>{t('home.features.step1Desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M9 16l2 2 4-4" />
                </svg>
              </div>
              <div className="feature-number">02</div>
              <h3>{t('home.features.step2')}</h3>
              <p>{t('home.features.step2Desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div className="feature-number">03</div>
              <h3>{t('home.features.step3')}</h3>
              <p>{t('home.features.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="map-preview">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t('home.map.badge')}</span>
            <h2>{t('home.map.title')}</h2>
            <p>{t('home.map.subtitle')}</p>
          </div>
          <div className="map-container">
            <div className="map-wrapper">
              {mapLoading ? (
                <div className="map-loading">
                  <div className="loading-spinner"></div>
                  <p>Harita yükleniyor...</p>
                </div>
              ) : (
                <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden' }}>
                  <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
                    <Map
                      defaultCenter={parkingSpaces.length > 0 ? { lat: parkingSpaces[0].latitude, lng: parkingSpaces[0].longitude } : defaultCenter}
                      defaultZoom={12}
                      mapId="DEMO_MAP_ID"
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* Red parking markers */}
                      {parkingSpaces.map((space) => (
                        <AdvancedMarker
                          key={space.id}
                          position={{ lat: space.latitude, lng: space.longitude }}
                          title={space.title}
                          onClick={() => setSelectedSpace(space)}
                        >
                          <Pin
                            background="#DC2626"
                            glyphColor="#ffffff"
                            borderColor="#ffffff"
                          />
                        </AdvancedMarker>
                      ))}

                      {/* Info window for selected space */}
                      {selectedSpace && (
                        <InfoWindow
                          position={{ lat: selectedSpace.latitude, lng: selectedSpace.longitude }}
                          onCloseClick={() => setSelectedSpace(null)}
                        >
                          <div className="home-map-info-window">
                            <h4>{selectedSpace.title}</h4>
                            <p>{selectedSpace.city}, {selectedSpace.state}</p>
                            <p className="info-price">₺{selectedSpace.pricePerHour}/saat</p>
                            <Link to={`/parking-spaces/${selectedSpace.id}`} className="btn btn-primary btn-sm">
                              Detayları Gör
                            </Link>
                          </div>
                        </InfoWindow>
                      )}
                    </Map>
                  </APIProvider>
                </div>
              )}
            </div>
            <div className="map-explore-btn">
              <Link to="/parking-spaces" className="btn btn-map-explore">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {t('home.map.explore')}
              </Link>
            </div>
            <div className="map-cities">
              <div className="city-tag">
                <span className="city-dot"></span>
                Kadıköy
              </div>
              <div className="city-tag">
                <span className="city-dot"></span>
                Beşiktaş
              </div>
              <div className="city-tag">
                <span className="city-dot"></span>
                Ataşehir
              </div>
              <div className="city-tag">
                <span className="city-dot"></span>
                Üsküdar
              </div>
              <div className="city-tag">
                <span className="city-dot"></span>
                Levent
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon benefit-icon-time">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              </div>
              <h4>{t('home.benefits.saveTime')}</h4>
              <p>{t('home.benefits.saveTimeDesc')}</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon benefit-icon-money">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h4>{t('home.benefits.saveMoney')}</h4>
              <p>{t('home.benefits.saveMoneyDesc')}</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon benefit-icon-secure">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h4>{t('home.benefits.secure')}</h4>
              <p>{t('home.benefits.secureDesc')}</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon benefit-icon-support">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h4>{t('home.benefits.support')}</h4>
              <p>{t('home.benefits.supportDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="corporate">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">{t('home.corporate.badge')}</span>
            <h2>{t('home.corporate.title')}</h2>
            <p>{t('home.corporate.subtitle')}</p>
          </div>
          <div className="corporate-grid">
            <div className="corporate-card">
              <div className="corporate-icon corporate-icon-fleet">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h3>{t('home.corporate.fleet')}</h3>
              <p>{t('home.corporate.fleetDesc')}</p>
            </div>
            <div className="corporate-card">
              <div className="corporate-icon corporate-icon-bulk">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3>{t('home.corporate.bulk')}</h3>
              <p>{t('home.corporate.bulkDesc')}</p>
            </div>
            <div className="corporate-card">
              <div className="corporate-icon corporate-icon-report">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h3>{t('home.corporate.reporting')}</h3>
              <p>{t('home.corporate.reportingDesc')}</p>
            </div>
            <div className="corporate-card">
              <div className="corporate-icon corporate-icon-support">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h3>{t('home.corporate.priority')}</h3>
              <p>{t('home.corporate.priorityDesc')}</p>
            </div>
          </div>
          <div className="corporate-cta">
            <Link to="/corporate" className="btn btn-corporate">
              {t('home.corporate.goToCorporate')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>{t('home.cta.title')}</h2>
              <p>{t('home.cta.subtitle')}</p>
            </div>
            <Link to="/register" className="btn btn-cta">
              {t('home.cta.button')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
