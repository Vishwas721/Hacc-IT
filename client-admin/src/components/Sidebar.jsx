// File: src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { House, FileEarmarkText, Building, People, Gear } from 'react-bootstrap-icons';
import styles from './Sidebar.module.css'; // Import the CSS Module

const navItems = [
  { icon: House, label: 'Dashboard', path: '/dashboard' },
  { icon: FileEarmarkText, label: 'Reports', path: '/reports' },
  { icon: Building, label: 'Departments', path: '/departments' },
  { icon: People, label: 'Users', path: '/users' },
  { icon: Gear, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  return (
    // Use the class from our imported styles object
    <div className={styles.sidebar}>
      <div className={styles.header}>
        Civic Admin
      </div>
      <Nav className="flex-column">
        {navItems.map((item) => (
          // Use a function for className to check if the link is active
          <Nav.Link
            as={NavLink}
            to={item.path}
            key={item.label}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} active` // Bootstrap's 'active' class
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