// File: src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Form } from 'react-bootstrap';
import styles from './Settings.module.css';

const Settings = () => {
  // State to hold the current theme, defaulting to the value in localStorage or 'light'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Effect to apply the theme to the document body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme); // Save preference to localStorage
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <Container fluid>
      <h1 className={styles.pageTitle}>Settings</h1>
      <Card className={styles.settingsCard}>
        <Card.Body>
          <Card.Title>Appearance</Card.Title>
          <Card.Text>
            Adjust the look and feel of your dashboard.
          </Card.Text>
          <hr />
          <Form>
            <Form.Group className="d-flex justify-content-between align-items-center">
              <Form.Label htmlFor="theme-switch" className="mb-0">
                <strong>Dark Mode</strong>
              </Form.Label>
              <Form.Check
                type="switch"
                id="theme-switch"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings;