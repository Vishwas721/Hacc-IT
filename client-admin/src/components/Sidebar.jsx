// File: src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { House, FileEarmarkText, Building, People, Gear, Map } from 'react-bootstrap-icons';
import styles from './Sidebar.module.css';
import { useAuth } from '../context/AuthContext';

const allNavItems = [
  { icon: House, label: 'Dashboard', path: '/dashboard', roles: ['super-admin', 'dept-admin'] },
  { icon: FileEarmarkText, label: 'Reports', path: '/reports', roles: ['super-admin', 'dept-admin', 'staff'] },
  { icon: Map, label: 'Map View', path: '/map-view', roles: ['super-admin', 'dept-admin'] },
  { icon: Building, label: 'Departments', path: '/departments', roles: ['super-admin'] },
  { icon: People, label: 'Users', path: '/users', roles: ['super-admin'] },
  { icon: Gear, label: 'Settings', path: '/settings', roles: ['super-admin', 'dept-admin', 'staff'] },
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