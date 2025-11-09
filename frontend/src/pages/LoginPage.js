import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
    } catch (error) {
      // Error handling is done in AuthContext
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === 'admin') {
      setFormData({ username: 'admin', password: 'Admin@123' });
    } else {
      setFormData({ username: 'farmer', password: 'Farmer@123' });
    }
  };

  return (
    <div className="login-page">
      <div className="gov-stripe"></div>

      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">🌾</div>
            <div className="logo-text">
              <h1>निर्माण NIRMAAN</h1>
              <p>Sugarcane Maturity Prediction System</p>
            </div>
          </div>
          <div className="gov-emblem">
            <span>🇮🇳</span>
            <span>Government of India</span>
          </div>
        </div>

        <div className="login-content">
          <div className="login-card">
            <div className="card-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access the system</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="credentials-section">
              <p className="credentials-title">Demo Credentials:</p>
              <div className="credentials-grid">
                <button
                  type="button"
                  className="credential-btn admin"
                  onClick={() => fillCredentials('admin')}
                >
                  <strong>Administrator</strong>
                  <span>username: admin</span>
                  <span>password: Admin@123</span>
                </button>
                <button
                  type="button"
                  className="credential-btn farmer"
                  onClick={() => fillCredentials('farmer')}
                >
                  <strong>Farmer</strong>
                  <span>username: farmer</span>
                  <span>password: Farmer@123</span>
                </button>
              </div>
            </div>
          </div>

          <div className="login-info">
            <div className="info-section">
              <h3>📊 Smart India Hackathon 2025</h3>
              <p><strong>Problem Statement:</strong> SIH25264</p>
              <p><strong>Title:</strong> Nirmaan - Sugarcane Maturity Prediction</p>
              <p><strong>Team:</strong> TechPhantom</p>
            </div>

            <div className="info-section">
              <h3>🌾 Key Features</h3>
              <ul>
                <li>Real-time IoT sensor integration</li>
                <li>NIR spectroscopy for sucrose detection</li>
                <li>ML-based maturity prediction</li>
                <li>Environmental monitoring</li>
                <li>GPS-enabled field tracking</li>
                <li>Automated harvest recommendations</li>
              </ul>
            </div>

            <div className="info-section">
              <h3>🔒 Security Notice</h3>
              <p>This is a secure government system. Unauthorized access is prohibited and will be reported.</p>
            </div>
          </div>
        </div>

        <div className="login-footer">
          <p>© 2025 National Informatics Centre | Government of India</p>
          <p>All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
