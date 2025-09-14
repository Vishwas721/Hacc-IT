import React from 'react';
import { Link } from 'react-router-dom';

export default function Homepage() {
  const containerStyle = {
    textAlign: 'center',
    paddingTop: '5rem',
    paddingBottom: '5rem',
  };

  const headingStyle = {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    lineHeight: '1.2',
  };

  const textStyle = {
    marginTop: '1rem',
    color: '#4A5568', // A muted gray color
  };

  const linkStyle = {
    display: 'inline-block',
    marginTop: '1.5rem',
    padding: '0.5rem 1.5rem',
    backgroundColor: '#319795', // A teal color
    color: 'white',
    textDecoration: 'none',
    borderRadius: '0.375rem',
    fontWeight: '600',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Civic Issue Reporting System</h1>
      <p style={textStyle}>The central hub for managing and resolving civic issues efficiently.</p>
      <Link to="/login" style={linkStyle}>
        Admin Login
      </Link>
    </div>
  );
}