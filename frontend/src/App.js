import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// import SensorDataPage from './pages/SensorDataPage';
// import SubmitDataPage from './pages/SubmitDataPage';
// import FieldsPage from './pages/FieldsPage';
// import UsersPage from './pages/UsersPage';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="app">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: '#2c5530',
              secondary: '#fff',
            },
          },
        }}
      />

      {isAuthenticated && !isLoginPage && (
        <>
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      )}

      <main className={`main-content ${isAuthenticated && !isLoginPage ? 'with-layout' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          {/* <Route
            path="/sensor-data"
            element={
              <PrivateRoute>
                <SensorDataPage />
              </PrivateRoute>
            }
          /> */}
          {/* <Route
            path="/submit-data"
            element={
              <PrivateRoute>
                <SubmitDataPage />
              </PrivateRoute>
            }
          /> */}
          {/* <Route
            path="/fields"
            element={
              <PrivateRoute>
                <FieldsPage />
              </PrivateRoute>
            }
          /> */}

          {/* Admin Only Routes */}
          {/* <Route
            path="/users"
            element={
              <PrivateRoute adminOnly>
                <UsersPage />
              </PrivateRoute>
            }
          /> */}

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
