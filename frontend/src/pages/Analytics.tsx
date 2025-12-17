import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { analyticsApi } from '../services/api';
import './Analytics.css';

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<any>(null);
  const [popularTimes, setPopularTimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, popularTimesRes] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getPopularTimes()
      ]);

      setAnalytics(overviewRes.data.data.overview);
      setPopularTimes(popularTimesRes.data.data.popularTimes);
    } catch (err: any) {
      setError(err.response?.data?.message || t('analytics.error'));
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">{t('analytics.loading')}</div>;
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="page">
        <div className="container">
          <p>{t('analytics.noData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1>{t('analytics.title')}</h1>
        <p className="page-subtitle">{t('analytics.subtitle')}</p>

        <div className="analytics-grid">
          <div className="stat-card card">
            <div className="stat-info">
              <div className="stat-value">{analytics.totalSpaces}</div>
              <div className="stat-label">{t('analytics.totalSpaces')}</div>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-info">
              <div className="stat-value">{analytics.totalBookings}</div>
              <div className="stat-label">{t('analytics.totalBookings')}</div>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-info">
              <div className="stat-value">₺{analytics.totalEarnings}</div>
              <div className="stat-label">{t('analytics.totalEarnings')}</div>
            </div>
          </div>

          <div className="stat-card card highlight">
            <div className="stat-info">
              <div className="stat-value">₺{analytics.monthlyEarnings}</div>
              <div className="stat-label">{t('analytics.thisMonth')}</div>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-info">
              <div className="stat-value">{analytics.upcomingBookings}</div>
              <div className="stat-label">{t('analytics.upcomingBookings')}</div>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-info">
              <div className="stat-value">{analytics.averageRating}</div>
              <div className="stat-label">
                {t('analytics.averageRating')} ({analytics.totalReviews} {t('analytics.reviews')})
              </div>
            </div>
          </div>
        </div>

        {popularTimes.length > 0 && (
          <div className="popular-times-section card">
            <h2>{t('analytics.popularTimes.title')}</h2>
            <p className="section-subtitle">{t('analytics.popularTimes.subtitle')}</p>
            <div className="popular-times-grid">
              {popularTimes.slice(0, 5).map((time) => (
                <div key={time.hour} className="popular-time-item">
                  <div className="time-label">
                    {time.hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="time-bar">
                    <div
                      className="time-bar-fill"
                      style={{
                        width: `${(time.count / popularTimes[0].count) * 100}%`
                      }}
                    />
                  </div>
                  <div className="time-count">{time.count} {t('analytics.popularTimes.bookings')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="insights-section">
          <div className="card">
            <h2>{t('analytics.insights.title')}</h2>
            <ul className="insights-list">
              {analytics.totalSpaces === 0 && (
                <li>{t('analytics.insights.firstSpace')}</li>
              )}
              {analytics.averageRating < 4.0 && analytics.totalReviews > 0 && (
                <li>{t('analytics.insights.lowRating')}</li>
              )}
              {analytics.upcomingBookings > 0 && (
                <li>
                  {t('analytics.insights.upcomingBookings', { count: analytics.upcomingBookings })}
                </li>
              )}
              {analytics.monthlyEarnings > 0 && (
                <li>{t('analytics.insights.monthlyEarnings', { amount: analytics.monthlyEarnings })}</li>
              )}
              {parseFloat(analytics.totalEarnings) > 1000 && (
                <li>{t('analytics.insights.milestone')}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
