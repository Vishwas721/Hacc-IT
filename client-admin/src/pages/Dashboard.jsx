// File: src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from './Dashboard.module.css';
import api from '../api/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartOptions = { 
  responsive: true, 
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } }
};

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data concurrently for better performance
        const [statsRes, categoryRes] = await Promise.all([
          api.get('/reports/stats'),
          api.get('/reports/by-category')
        ]);

        // Set the statistics for the cards
        setStats(statsRes.data);

        // Format the data for the chart
        const labels = categoryRes.data.map(item => item.category);
        const data = categoryRes.data.map(item => item.count);
        setChartData({
          labels,
          datasets: [{
            label: '# of Reports',
            data,
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderRadius: 4
          }]
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };
  
  if (loading) {
    return (
        <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Container>
    );
  }

  return (
    <Container fluid>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
      </motion.div>

      <Row>
            <Col md={3} className="mb-4">
                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                    <Card className={`${styles.customCard} h-100`}>
                        <Card.Body className="p-4">
                            <Card.Title className={styles.statCardTitle}>TOTAL REPORTS</Card.Title>
                            <p className={styles.statCardValue}>{stats.total}</p>
                        </Card.Body>
                    </Card>
                </motion.div>
            </Col>
            <Col md={3} className="mb-4">
                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                    <Card className={`${styles.customCard} h-100`}>
                        <Card.Body className="p-4">
                            <Card.Title className={styles.statCardTitle}>PENDING REVIEW</Card.Title>
                            <p className={`${styles.statCardValue} text-warning`}>{stats.pending}</p>
                        </Card.Body>
                    </Card>
                </motion.div>
            </Col>
            <Col md={3} className="mb-4">
                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                    <Card className={`${styles.customCard} h-100`}>
                        <Card.Body className="p-4">
                            <Card.Title className={styles.statCardTitle}>IN PROGRESS</Card.Title>
                            <p className={`${styles.statCardValue} text-primary`}>{stats.inProgress}</p>
                        </Card.Body>
                    </Card>
                </motion.div>
            </Col>
            <Col md={3} className="mb-4">
                <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                    <Card className={`${styles.customCard} h-100`}>
                        <Card.Body className="p-4">
                            <Card.Title className={styles.statCardTitle}>RESOLVED ISSUES</Card.Title>
                            <p className={`${styles.statCardValue} text-success`}>{stats.resolved}</p>
                        </Card.Body>
                    </Card>
                </motion.div>
            </Col>
        </Row>

      <Row>
        <Col>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className={`${styles.customCard}`}>
              <Card.Body className="p-4">
                <Card.Title className={styles.chartCardTitle}>Reports by Category</Card.Title>
                <div style={{ height: '350px' }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;