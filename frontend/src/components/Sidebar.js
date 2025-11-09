import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Database,
  Upload,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'farmer', 'user'],
    },
    {
      title: 'Sensor Data',
      path: '/sensor-data',
      icon: Database,
      roles: ['admin', 'farmer', 'user'],
    },
    {
      title: 'Submit Data',
      path: '/submit-data',
      icon: Upload,
      roles: ['admin', 'farmer', 'user'],
    },
    {
      title: 'Fields',
      path: '/fields',
      icon: MapPin,
      roles: ['admin', 'farmer', 'user'],
    },
    {
      title: 'Users',
      path: '/users',
      icon: Users,
      roles: ['admin'],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    isAdmin ? true : !item.roles.includes('admin')
  );

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon size={20} />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="info-card">
            <h4>📊 SIH 2025</h4>
            <p>Problem Statement: SIH25264</p>
            <p>Team: TechPhantom</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
