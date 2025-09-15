// File: src/pages/ReportDetails.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Image, Button, Form, Badge, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import styles from './ReportDetails.module.css';
import api from '../api/api';
import { toast } from 'react-toastify';
import { useReports } from '../hooks/useReports';

const StatusBadge = ({ status }) => {
    const variant = { Pending: 'warning', 'In Progress': 'primary', Resolved: 'success' }[status];
    return <Badge bg={variant}>{status}</Badge>;
};

const ReportDetails = () => {
    const { fetchDashboardStats } = useReports();
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [status, setStatus] = useState('');
    const [map, setMap] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`/reports/${id}`);
                setReport(response.data);
                setStatus(response.data.status);
            } catch (error) { toast.error("Could not load report details."); }
        };
        fetchReport();
    }, [id]);

    useEffect(() => {
        if (map) {
            const timer = setTimeout(() => map.invalidateSize(), 100);
            return () => clearTimeout(timer);
        }
    }, [map]);

    const handleStatusChange = (e) => setStatus(e.target.value);
    const handleSaveChanges = async () => {
        try {
            await api.put(`/reports/${id}`, { status });
            toast.success(`Report status updated!`);
            fetchDashboardStats();
            navigate('/reports');
        } catch (error) { toast.error("Failed to update report."); }
    };

    if (!report) return <Spinner animation="border" />;
    
    const position = [report.location.coordinates[1], report.location.coordinates[0]];

    return (
        <Container fluid>
            <Button variant="light" className={styles.backButton} onClick={() => navigate('/reports')}>
                &larr; Back to Reports
            </Button>
            <h1 className={styles.pageHeader}>Report Details #{report.id}</h1>
            <Row>
                <Col lg={7} className="mb-4">
                    <Image src={report.imageUrl} fluid className={styles.reportImage} />
                    <div className={styles.mapContainer}>
                        <MapContainer 
                            center={position} 
                            zoom={16} 
                            style={{ height: '100%', width: '100%' }}
                            whenCreated={setMap}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={position}></Marker>
                        </MapContainer>
                    </div>
                </Col>
                <Col lg={5}>
                    <Card className={styles.detailsCard}>
                        <Card.Body className="p-4">
                            <h5 className={styles.cardTitle}>Issue Details</h5>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Status</span>
                                <div className={styles.detailValue}><StatusBadge status={report.status} /></div>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Category</span>
                                <p className={styles.detailValue}>{report.category}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Description</span>
                                <p className={styles.detailValue}>{report.description}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Reported On</span>
                                <p className={styles.detailValue}>{new Date(report.createdAt).toLocaleString()}</p>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className={styles.actionsCard}>
                        <Card.Body className="p-4">
                            <h5 className={styles.cardTitle}>Admin Actions</h5>
                             <Form.Group controlId="statusSelect">
                                <Form.Label className={styles.detailLabel}>Change Status</Form.Label>
                                <Form.Select value={status} onChange={handleStatusChange}>
                                    <option>Pending</option>
                                    <option>In Progress</option>
                                    <option>Resolved</option>
                                </Form.Select>
                            </Form.Group>
                            <Button variant="primary" className="w-100 mt-3" onClick={handleSaveChanges}>
                                Save Changes
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ReportDetails;