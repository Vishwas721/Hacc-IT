import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from './Dashboard.module.css';
import { useReports } from '../hooks/useReports';
import api from '../api/api';
import Leaderboard from '../components/Leaderboard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#4b5563' } },
        x: { grid: { display: false }, ticks: { color: '#4b5563' } }
    }
};

const Dashboard = () => {
    const { stats, loadingStats, fetchDashboardStats } = useReports();
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    useEffect(() => {
        fetchDashboardStats();
        const fetchChartData = async () => {
            try {
                const categoryRes = await api.get('/reports/by-category');
                const labels = categoryRes.data.map(item => item.category);
                const data = categoryRes.data.map(item => item.count);
                setChartData({
                    labels,
                    datasets: [{
                        label: '# of Reports',
                        data,
                        backgroundColor: 'rgba(10, 35, 81, 0.8)',
                        borderColor: 'rgba(10, 35, 81, 1)',
                        borderWidth: 1,
                        borderRadius: 8,
                        hoverBackgroundColor: 'rgba(255, 153, 51, 0.9)'
                    }]
                });
            } catch (error) {
                console.error("Failed to fetch chart data", error);
            }
        };
        fetchChartData();
    }, [fetchDashboardStats]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    if (loadingStats) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container fluid>
            <h1 className="page-title">Dashboard Overview</h1>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <Row>
                    <Col md={3} className="mb-4">
                        <motion.div variants={itemVariants}>
                            <Card className={`frosted-card text-center ${styles.statCard}`}>
                                <Card.Body>
                                    <Card.Title className={styles.statCardTitle}>TOTAL REPORTS</Card.Title>
                                    <p className={styles.statCardValue}>{stats.total}</p>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                    <Col md={3} className="mb-4">
                        <motion.div variants={itemVariants}>
                             <Card className={`frosted-card text-center ${styles.statCard}`}>
                                <Card.Body>
                                    <Card.Title className={styles.statCardTitle}>PENDING REVIEW</Card.Title>
                                    <p className={`${styles.statCardValue} text-warning`}>{stats.pending}</p>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                    <Col md={3} className="mb-4">
                        <motion.div variants={itemVariants}>
                             <Card className={`frosted-card text-center ${styles.statCard}`}>
                                <Card.Body>
                                    <Card.Title className={styles.statCardTitle}>IN PROGRESS</Card.Title>
                                    <p className={`${styles.statCardValue} text-primary`}>{stats.inProgress}</p>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                    <Col md={3} className="mb-4">
                        <motion.div variants={itemVariants}>
                             <Card className={`frosted-card text-center ${styles.statCard}`}>
                                <Card.Body>
                                    <Card.Title className={styles.statCardTitle}>RESOLVED</Card.Title>
                                    <p className={`${styles.statCardValue} text-success`}>{stats.resolved}</p>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
                <Row>
                    <Col lg={8} className="mb-4">
                        <motion.div variants={itemVariants}>
                            <Card className={`frosted-card h-100 ${styles.chartCard}`}>
                                <Card.Body>
                                    <Card.Title>Reports by Category</Card.Title>
                                    <div className={styles.chartContainer}>
                                        <Bar data={chartData} options={chartOptions} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                    <Col lg={4} className="mb-4">
                        <motion.div variants={itemVariants}>
                            <div className="frosted-card h-100">
                                <Leaderboard />
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </motion.div>
        </Container>
    );
};

export default Dashboard;