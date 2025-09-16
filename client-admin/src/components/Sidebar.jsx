// File: src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { House, FileEarmarkText, Building, People, Gear, Map } from 'react-bootstrap-icons';
import styles from './Sidebar.module.css';
import { useAuth } from '../context/AuthContext';

// In client-admin/src/components/Sidebar.jsx
const allNavItems = [
  { icon: House, label: 'Dashboard', path: '/dashboard', roles: ['super-admin', 'municipal-admin', 'dept-admin'] }, // All admins see dashboard
  { icon: FileEarmarkText, label: 'Reports', path: '/reports', roles: ['municipal-admin', 'dept-admin'] }, // Only managers see report list
  { icon: Map, label: 'Map View', path: '/map-view', roles: ['super-admin', 'municipal-admin', 'dept-admin'] },
  { icon: Building, label: 'Departments', path: '/departments', roles: ['municipal-admin'] }, // Municipal admin manages depts
  { icon: People, label: 'Users', path: '/users', roles: ['municipal-admin'] }, // Municipal admin manages users
  { icon: Gear, label: 'Settings', path: '/settings', roles: ['super-admin', 'municipal-admin', 'dept-admin'] },
];

const Sidebar = () => {
  const { user } = useAuth();

  // Filter navigation items based on the logged-in user's role
  const navItems = allNavItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        Civic Admin
      </div>
      <Nav className="flex-column">
        {navItems.map((item) => (
          <Nav.Link
            as={NavLink}
            to={item.path}
            key={item.label}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} active`
                : styles.navLink
            }
          >
            <item.icon className="me-3" size={20} />
            {item.label}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
};

export default Sidebar;