import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Image, Button, Form, Badge, Spinner, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import styles from './ReportDetails.module.css';
import api from '../api/api';
import { toast } from 'react-toastify';
import { useReports } from '../hooks/useReports';
import MapResizeComponent from '../components/MapResizeComponent';
import { useAuth } from '../context/AuthContext';

// Helper component to display the status with a colored badge
const StatusBadge = ({ status }) => {
    const variant = { Pending: 'warning', 'In Progress': 'primary', Resolved: 'success' }[status];
    return <Badge bg={variant}>{status}</Badge>;
};

const ReportDetails = () => {
    const { user } = useAuth();
    const { fetchDashboardStats } = useReports();
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State hooks
    const [report, setReport] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [assignedDept, setAssignedDept] = useState('');
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolvedNotes, setResolvedNotes] = useState('');
    const [resolvedImage, setResolvedImage] = useState(null);

    // Fetch report and departments in a single API call for efficiency
    const fetchReportAndDepartments = useCallback(async () => {
        try {
            const [reportRes, deptsRes] = await Promise.all([
                api.get(`/reports/${id}`),
                api.get('/departments') // Also fetch departments
            ]);
            setReport(reportRes.data);
            setDepartments(deptsRes.data);
            setAssignedDept(reportRes.data.DepartmentId || '');
        } catch (error) {
            toast.error("Could not load report details.");
        }
    }, [id]);

    useEffect(() => {
        fetchReportAndDepartments();
    }, [fetchReportAndDepartments]);

    // Handle assigning a department (Super Admin action)
    const handleDepartmentAssign = async () => {
        try {
            await api.put(`/reports/${report.id}`, { departmentId: assignedDept });
            toast.success(`Report assigned to department!`);
            fetchReportAndDepartments(); // Refetch to get the latest data
        } catch (error) {
            toast.error("Failed to assign department.");
        }
    };

    // Handle updating report status (Dept Admin action)
    const handleUpdateStatus = async (newStatus) => {
        const formData = new FormData();
        formData.append('status', newStatus);

        if (newStatus === 'Resolved') {
            if (!resolvedImage) {
                toast.error("A proof image is required to resolve an issue.");
                return;
            }
            formData.append('resolvedNotes', resolvedNotes);
            formData.append('resolvedImage', resolvedImage);
        }

        try {
            await api.put(`/reports/${report.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`Report status updated to "${newStatus}"!`);
            fetchDashboardStats();
            setShowResolveModal(false);
            fetchReportAndDepartments(); // Refetch to show updated status/details
        } catch (error) {
            toast.error("Failed to update report.");
        }
    };

    // Show a spinner while the report is loading
    if (!report) {
        return <Spinner animation="border" className="d-block mx-auto mt-5" />;
    }
    
    // Set map position from report coordinates
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
                        <MapContainer center={position} zoom={16} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={position}></Marker>
                            <MapResizeComponent />
                        </MapContainer>
                    </div>
                </Col>
                
                <Col lg={5}>
                    <Card className={styles.detailsCard}>
                        <Card.Body className="p-4">
                            <h5 className={styles.cardTitle}>Issue Details</h5>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>Status</span><div className={styles.detailValue}><StatusBadge status={report.status} /></div></div>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>Category</span><p className={styles.detailValue}>{report.category}</p></div>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>Description</span><p className={styles.detailValue}>{report.description}</p></div>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>Reported On</span><p className={styles.detailValue}>{new Date(report.createdAt).toLocaleString()}</p></div>
                        </Card.Body>
                    </Card>

                    {/* Admin Actions Card based on user role */}
                    {user && (user.role === 'super-admin' || user.role === 'dept-admin') && (
                        <Card className={styles.actionsCard}>
                            <Card.Body className="p-4">
                                <h5 className={styles.cardTitle}>Admin Actions</h5>
                                
                                {/* ONLY Super Admins can assign departments */}
                                {user.role === 'super-admin' && (
                                    <Form.Group controlId="deptAssign" className="mb-3">
                                        <Form.Label className={styles.detailLabel}>Assign to Department</Form.Label>
                                        <div className="d-flex">
                                            <Form.Select value={assignedDept} onChange={(e) => setAssignedDept(e.target.value)}>
                                                <option value="">-- Unassigned --</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </Form.Select>
                                            <Button variant="secondary" onClick={handleDepartmentAssign} className="ms-2">Assign</Button>
                                        </div>
                                    </Form.Group>
                                )}

                                {/* ONLY Dept Admins can change the status */}
                                {user.role === 'dept-admin' && (
                                    <>
                                        {(report.status !== 'In Progress' && report.status !== 'Resolved') && (
                                            <Button variant="info" className="w-100 mb-2" onClick={() => handleUpdateStatus('In Progress')}>
                                                Mark as "In Progress"
                                            </Button>
                                        )}
                                        {report.status !== 'Resolved' && (
                                            <Button variant="success" className="w-100" onClick={() => setShowResolveModal(true)}>
                                                Mark as "Resolved"
                                            </Button>
                                        )}
                                    </>
                                )}
                                
                                {/* Show proof of resolution if the report is resolved */}
                                {report.status === 'Resolved' && report.resolvedImageUrl && (
                                    <div className="mt-3">
                                        <span className={styles.detailLabel}>Proof of Resolution:</span>
                                        <Image src={report.resolvedImageUrl} fluid rounded className="mt-2" />
                                        {report.resolvedNotes && <p className="mt-2 fst-italic">Notes: {report.resolvedNotes}</p>}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            {/* Modal for "Resolved" action */}
            <Modal show={showResolveModal} onHide={() => setShowResolveModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Resolve Issue #{report.id}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="resolvedNotes" className="mb-3">
                            <Form.Label>Resolution Notes (Optional)</Form.Label>
                            <Form.Control as="textarea" rows={3} value={resolvedNotes} onChange={(e) => setResolvedNotes(e.target.value)} />
                        </Form.Group>
                        <Form.Group controlId="resolvedImage">
                            <Form.Label>Upload Proof Image (Required)</Form.Label>
                            <Form.Control type="file" onChange={(e) => setResolvedImage(e.target.files[0])} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowResolveModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => handleUpdateStatus('Resolved')}>Confirm Resolution</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ReportDetails;