// File: src/pages/Dashboard.jsx
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from './Dashboard.module.css';

// Register the components Chart.js needs
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Mock Data
const stats = { total: 125, pending: 32, resolved: 93 };
const categoryData = {
  labels: ['Potholes', 'Garbage', 'Streetlight', 'Water Leak'],
  datasets: [ { label: '# of Reports', data: [45, 30, 22, 28], backgroundColor: 'rgba(0, 123, 255, 0.5)', borderRadius: 4 } ],
};

// THIS IS THE MISSING LINE
const chartOptions = { 
  responsive: true, 
  maintainAspectRatio: false,
  plugins: {
    legend: {
        display: false, // Hides the legend
    }
  },
  scales: {
    y: {
        beginAtZero: true
    }
  }
};


const Dashboard = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <Container fluid>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
      </motion.div>

      <Row>
        {/* Stat Cards ... */}
        <Col md={4} className="mb-4">
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Card className={`${styles.customCard} h-100`}>
              <Card.Body className="p-4">
                <Card.Title className={styles.statCardTitle}>TOTAL REPORTS</Card.Title>
                <p className={styles.statCardValue}>{stats.total}</p>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={4} className="mb-4">
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className={`${styles.customCard} h-100`}>
              <Card.Body className="p-4">
                <Card.Title className={styles.statCardTitle}>PENDING REVIEW</Card.Title>
                <p className={`${styles.statCardValue} text-warning`}>{stats.pending}</p>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={4} className="mb-4">
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
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
                  <Bar data={categoryData} options={chartOptions} />
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