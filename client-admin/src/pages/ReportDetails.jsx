import 'leaflet/dist/leaflet.css'; // <-- CRITICAL: The map fix starts here.
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
    const variantMap = {
        'Submitted': 'secondary',
        'Pending': 'warning',
        'In Progress': 'primary',
        'Resolved': 'success'
    };
    return <Badge bg={variantMap[status] || 'dark'}>{status}</Badge>;
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

    // Fetch report and departments data
    const fetchReportAndDepartments = useCallback(async () => {
        try {
            const [reportRes, deptsRes] = await Promise.all([
                api.get(`/reports/${id}`),
                api.get('/departments')
            ]);
            setReport(reportRes.data);
            setDepartments(deptsRes.data);
            setAssignedDept(reportRes.data.DepartmentId || '');
        } catch (error) {
            toast.error("Could not load report details.");
            navigate('/reports'); // Go back if report can't be loaded
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchReportAndDepartments();
    }, [fetchReportAndDepartments]);

    // Handle assigning a department (Municipal Admin action)
    const handleDepartmentAssign = async () => {
        try {
            await api.put(`/reports/${report.id}`, { departmentId: assignedDept });
            toast.success(`Report assigned successfully!`);
            fetchReportAndDepartments(); // Refetch to get the latest data
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to assign department.");
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
            toast.error(error.response?.data?.error || "Failed to update report.");
        }
    };

    if (!report) {
        return <Spinner animation="border" className="d-block mx-auto mt-5" />;
    }
    
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
                            <div className={styles.detailItem}><span className={styles.detailLabel}>Assigned Department</span><p className={styles.detailValue}>{report.Department ? report.Department.name : 'Unassigned'}</p></div>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>Category</span><p className={styles.detailValue}>{report.category}</p></div>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>Description</span><p className={styles.detailValue}>{report.description}</p></div>
                            <div className={styles.detailItem}><span className={styles.detailLabel}>Reported On</span><p className={styles.detailValue}>{new Date(report.createdAt).toLocaleString()}</p></div>
                        </Card.Body>
                    </Card>

                    {/* --- NEW: ROLE-BASED ACTIONS CARD --- */}
                    {/* This card only shows for the two operational admin roles */}
                    {user && (user.role === 'municipal-admin' || user.role === 'dept-admin') && (
                        <Card className={styles.actionsCard}>
                            <Card.Body className="p-4">
                                <h5 className={styles.cardTitle}>Admin Actions</h5>
                                
                                {/* ONLY Municipal Admins can assign/re-assign departments */}
                                {user.role === 'municipal-admin' && (
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
                                        {(report.status === 'Submitted' || report.status === 'Pending') && (
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
                            </Card.Body>
                        </Card>
                    )}
                    
                    {/* This section for showing resolution proof is visible to everyone */}
                    {report.status === 'Resolved' && report.resolvedImageUrl && (
                        <Card className={styles.detailsCard}>
                             <Card.Body className="p-4">
                                <h5 className={styles.cardTitle}>Proof of Resolution</h5>
                                <Image src={report.resolvedImageUrl} fluid rounded className="mt-2" />
                                {report.resolvedNotes && <p className="mt-2 fst-italic">Notes: {report.resolvedNotes}</p>}
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            {/* Modal for "Resolved" action - no changes needed here */}
            <Modal show={showResolveModal} onHide={() => setShowResolveModal(false)} centered>
                {/* ... your existing modal code ... */}
            </Modal>
        </Container>
    );
};

export default ReportDetails;