import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <>
      <div className="gov-header"></div>
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <button className="menu-btn" onClick={onMenuClick}>
              <Menu size={24} />
            </button>
            <div className="header-logo">
              <div className="logo-icon">🌾</div>
              <div className="logo-text">
                <h1>निर्माण NIRMAAN</h1>
                <p>Sugarcane Maturity Prediction System</p>
              </div>
            </div>
          </div>

          <div className="header-right">
            <div className="gov-badge">
              <span>🇮🇳</span>
              <span>Government of India</span>
            </div>

            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">{user?.fullName || user?.username}</span>
                <span className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Farmer'}</span>
              </div>
              <button className="user-avatar">
                <User size={20} />
              </button>
              <button className="logout-btn" onClick={logout} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
