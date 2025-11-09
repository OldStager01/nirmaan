import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Sensor Data APIs
export const sensorAPI = {
  submitData: (data) => api.post('/sensors/data', data),
  getAllData: (params) => api.get('/sensors/data', { params }),
  getById: (id) => api.get(`/sensors/data/${id}`),
  getLatest: () => api.get('/sensors/latest'),
  getByDevice: (deviceId) => api.get(`/sensors/device/${deviceId}`),
  deleteData: (id) => api.delete(`/sensors/data/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getMaturityDistribution: () => api.get('/dashboard/charts/maturity-distribution'),
  getSucroseTrend: (days) => api.get('/dashboard/charts/sucrose-trend', { params: { days } }),
  getEnvironmentalData: () => api.get('/dashboard/charts/environmental'),
  getAlerts: () => api.get('/dashboard/alerts'),
};

// Field APIs
export const fieldAPI = {
  create: (data) => api.post('/fields', data),
  getAll: () => api.get('/fields'),
  getById: (id) => api.get(`/fields/${id}`),
  update: (id, data) => api.put(`/fields/${id}`, data),
  delete: (id) => api.delete(`/fields/${id}`),
  getReadings: (id) => api.get(`/fields/${id}/readings`),
};

// User APIs (Admin only)
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
};

export default api;
