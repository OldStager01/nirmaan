import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
  TrendingUp,
  Database,
  MapPin,
  Droplet,
  AlertCircle,
  CheckCircle,
  Loader,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './DashboardPage.css';

const COLORS = ['#2c5530', '#ff9933', '#ffcc66', '#dc2626', '#3b82f6'];

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [maturityData, setMaturityData] = useState([]);
  const [sucroseTrend, setSucroseTrend] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, maturityRes, trendRes, alertsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getMaturityDistribution(),
        dashboardAPI.getSucroseTrend(),
        dashboardAPI.getAlerts(),
      ]);

      console.log('Stats Response:', statsRes.data);
      console.log('Maturity Response:', maturityRes.data);
      console.log('Trend Response:', trendRes.data);
      console.log('Alerts Response:', alertsRes.data);

      setStats(statsRes.data.data?.stats || statsRes.data);
      setMaturityData(maturityRes.data.data?.chartData || maturityRes.data.distribution || []);
      setSucroseTrend(trendRes.data.data?.chartData || trendRes.data.trend || []);
      setAlerts(alertsRes.data.data?.alerts || alertsRes.data.alerts || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={48} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time monitoring and analytics for sugarcane fields</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-icon">
            <Database size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Readings</h3>
            <p className="stat-value">{stats?.totalReadings || 0}</p>
            <span className="stat-label">All-time sensor data</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Today's Readings</h3>
            <p className="stat-value">{stats?.readingsToday || 0}</p>
            <span className="stat-label">Collected today</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <Droplet size={24} />
          </div>
          <div className="stat-content">
            <h3>Avg. Sucrose</h3>
            <p className="stat-value">{stats?.averageSucroseLevel ? parseFloat(stats.averageSucroseLevel).toFixed(1) : 0}%</p>
            <span className="stat-label">Across all fields</span>
          </div>
        </div>

        <div className="stat-card error">
          <div className="stat-icon">
            <MapPin size={24} />
          </div>
          <div className="stat-content">
            <h3>Active Fields</h3>
            <p className="stat-value">{stats?.activeFields || 0}</p>
            <span className="stat-label">Being monitored</span>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h2>Alerts & Notifications</h2>
          <div className="alerts-grid">
            {alerts.map((alert, index) => (
              <div key={index} className={`alert alert-${alert.type}`}>
                <div className="alert-icon">
                  {alert.type === 'success' && <CheckCircle size={20} />}
                  {alert.type === 'warning' && <AlertCircle size={20} />}
                  {alert.type === 'error' && <AlertCircle size={20} />}
                </div>
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  {alert.field && <span className="alert-field">Field: {alert.field}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="charts-section">
        {/* Sucrose Trend Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Sucrose Level Trend</h2>
            <p>Average sucrose levels over the past 7 days</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sucroseTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" label={{ value: 'Sucrose %', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgSucrose"
                stroke="#2c5530"
                strokeWidth={3}
                dot={{ fill: '#2c5530', r: 4 }}
                name="Average Sucrose %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Maturity Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Maturity Distribution</h2>
            <p>Current status of all monitored fields</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={maturityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {maturityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Maturity Stats Bar Chart */}
      {maturityData.length > 0 && (
        <div className="chart-card full-width">
          <div className="chart-header">
            <h2>Maturity Statistics</h2>
            <p>Number of fields in each maturity stage</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={maturityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="status" stroke="#6b7280" />
              <YAxis stroke="#6b7280" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#2c5530" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* System Info */}
      <div className="info-banner">
        <div className="info-icon">ℹ️</div>
        <div className="info-text">
          <strong>Real-time Monitoring Active</strong>
          <p>Dashboard updates automatically every 30 seconds with latest sensor readings</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
