import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import LanguageSwitcher from './LanguageSwitcher';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="11" r="3" fill="url(#logoGradient)"/>
              <defs>
                <linearGradient id="logoGradient" x1="4" y1="2" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#667eea"/>
                  <stop offset="1" stopColor="#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">Ur-Park</span>
        </Link>

        <nav className="nav">
          <Link 
            to="/parking-spaces" 
            className={`nav-link ${location.pathname === '/parking-spaces' ? 'nav-link-active' : ''}`}
          >
            {t('header.findParking')}
          </Link>

          {user ? (
            <>
              <Link 
                to="/create-space" 
                className={`nav-link nav-link-highlight ${location.pathname === '/create-space' ? 'nav-link-active' : ''}`}
              >
                {t('header.listYourSpace')}
              </Link>
              <Link 
                to="/my-spaces" 
                className={`nav-link ${location.pathname === '/my-spaces' ? 'nav-link-active' : ''}`}
              >
                {t('header.mySpaces')}
              </Link>
              <Link 
                to="/my-bookings" 
                className={`nav-link ${location.pathname === '/my-bookings' ? 'nav-link-active' : ''}`}
              >
                {t('header.myBookings')}
              </Link>
              <Link 
                to="/messages" 
                className={`nav-link ${location.pathname === '/messages' ? 'nav-link-active' : ''}`}
              >
                {t('header.messages')}
              </Link>
              <Link 
                to="/analytics" 
                className={`nav-link ${location.pathname === '/analytics' ? 'nav-link-active' : ''}`}
              >
                {t('header.analytics')}
              </Link>
              <Link
                to="/corporate"
                className={`nav-link nav-link-corporate ${location.pathname === '/corporate' ? 'nav-link-active' : ''}`}
              >
                {t('header.corporate')}
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/approval"
                  className={`nav-link nav-link-admin ${location.pathname === '/admin/approval' ? 'nav-link-active' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}
                >
                  🔐 Admin Panel
                </Link>
              )}
              <NotificationCenter />
              <LanguageSwitcher />
              <Link to="/profile" className="nav-link nav-link-profile">
                {user.firstName}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                {t('header.logout')}
              </button>
            </>
          ) : (
            <>
              <LanguageSwitcher />
              <Link to="/login" className="btn btn-outline">
                {t('header.login')}
              </Link>
              <Link to="/register" className="btn btn-gradient">
                {t('header.signUp')}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
