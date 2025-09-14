// File: src/pages/ReportDetails.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Image, Button, Form, Badge, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import styles from './ReportDetails.module.css';

// Re-using the mock data from the Reports page for this example
const mockData = [
  { id: 125, description: 'Huge pothole on Main St. causing traffic issues.', category: 'Pothole', status: 'Pending', createdAt: '2025-09-14T10:00:00Z', imageUrl: 'https://via.placeholder.com/600x400.png?text=Pothole+Report', location: { coordinates: [77.5946, 12.9716] } },
  { id: 124, description: 'The main bin near the central park is overflowing and has not been cleared for 3 days.', category: 'Garbage', status: 'In Progress', createdAt: '2025-09-13T14:30:00Z', imageUrl: 'https://via.placeholder.com/600x400.png?text=Garbage+Report', location: { coordinates: [77.60, 12.97] } },
  // ... add other mock items if needed
];

const StatusBadge = ({ status }) => {
    const variant = { Pending: 'warning', 'In Progress': 'primary', Resolved: 'success' }[status];
    return <Badge bg={variant}>{status}</Badge>;
};

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        // In a real app, you'd fetch this from the API:
        // const response = await api.get(`/reports/${id}`);
        const foundReport = mockData.find(r => r.id.toString() === id);
        setReport(foundReport);
        setStatus(foundReport?.status || '');
    }, [id]);

    const handleStatusChange = (e) => setStatus(e.target.value);

    const handleSaveChanges = () => {
        // In a real app, this would be a PUT request to the API
        // await api.put(`/reports/${id}`, { status });
        alert(`Status for report #${id} would be updated to "${status}"`);
        navigate('/reports');
    };

    if (!report) {
        return <Spinner animation="border" />;
    }
    
    // Leaflet expects [latitude, longitude]
    const position = [report.location.coordinates[1], report.location.coordinates[0]];

    return (
        <Container fluid>
            <Button variant="outline-secondary" className={styles.backButton} onClick={() => navigate('/reports')}>
                &larr; Back to All Reports
            </Button>
            <h1 className={styles.pageHeader}>Report Details: #{report.id}</h1>
            <Row>
                {/* Left Column: Image and Map */}
                <Col lg={6} className="mb-4">
                    <Image src={report.imageUrl} fluid className={styles.reportImage} />
                    <div className={styles.mapContainer}>
                        <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={position}></Marker>
                        </MapContainer>
                    </div>
                </Col>

                {/* Right Column: Details and Actions */}
                <Col lg={6}>
                    <Card className={styles.detailsCard}>
                        <Card.Body className="p-4">
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Status</span>
                                <div className={styles.detailValue}><StatusBadge status={report.status} /></div>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Description</span>
                                <p className={styles.detailValue}>{report.description}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Category</span>
                                <p className={styles.detailValue}>{report.category}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <span className={styles.detailLabel}>Reported On</span>
                                <p className={styles.detailValue}>{new Date(report.createdAt).toLocaleString()}</p>
                            </div>
                            
                            <hr />
                            
                            <h5 className="mt-4">Admin Actions</h5>
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