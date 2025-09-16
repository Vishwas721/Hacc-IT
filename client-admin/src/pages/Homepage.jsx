import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Phone, CpuFill, BarChartLineFill } from 'react-bootstrap-icons';

const Homepage = () => {
    const navigate = useNavigate();

    const styles = {
        homepage: {
            fontFamily: "'Inter', sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
            backgroundColor: '#ffffff',
        },
        hero: {
            // --- UPDATED: Indian flag-inspired gradient for the hero background ---
            background: 'linear-gradient(120deg, #FF9933 30%, #FFFFFF 50%, #138808 70%)',
            // --- UPDATED: Text color changed to dark blue for readability ---
            color: '#000080', // Dark navy blue (Ashoka Chakra color)
            padding: '6rem 0',
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
        },
        heroTitle: {
            fontSize: '3.5rem',
            fontWeight: '700',
            // --- UPDATED: Text shadow for dark text ---
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.2)',
            letterSpacing: '-1px',
        },
        heroSubtitle: {
            fontSize: '1.25rem',
            marginTop: '1.5rem',
            marginBottom: '2.5rem',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
        },
        heroButton: {
            // --- UPDATED: Button style changed for better contrast ---
            backgroundColor: '#000080',
            borderColor: '#000080',
            fontWeight: '600',
            padding: '0.75rem 2rem',
            transition: 'all 0.3s ease',
        },
        features: {
            padding: '6rem 0',
            backgroundColor: '#ffffff',
        },
        sectionTitle: {
            fontWeight: '700',
            fontSize: '2.5rem',
            marginBottom: '4rem',
        },
        featureCard: {
            border: 'none',
            borderRadius: '15px',
            boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        },
        featureIcon: {
            fontSize: '3rem',
            marginBottom: '1.5rem',
            color: '#0052D4', // A bright blue for the icons
        },
        footer: {
            backgroundColor: '#212529',
            color: '#adb5bd',
            padding: '2rem 0',
        }
    };

    return (
        <div style={styles.homepage}>
            {/* --- Hero Section --- */}
            <header style={styles.hero}>
                <Container className="text-center">
                    <h1 style={styles.heroTitle}>Welcome to NagarikOne</h1>
                    <p style={styles.heroSubtitle}>
                        Empowering citizens and enabling data-driven governance for smarter, more responsive cities.
                    </p>
                    <Button
                        style={styles.heroButton}
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/login')}
                    >
                        Admin & Staff Login
                    </Button>
                </Container>
            </header>

            {/* --- Features Section --- */}
            <section style={styles.features}>
                <Container>
                    <h2 className="text-center" style={styles.sectionTitle}>A 360° Platform for Civic Management</h2>
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 text-center" style={styles.featureCard}>
                                <Card.Body className="p-4">
                                    <div style={styles.featureIcon}><Phone /></div>
                                    <Card.Title className="fw-bold">Citizen Empowerment</Card.Title>
                                    <Card.Text>
                                        An inclusive mobile app allows any citizen to report issues easily with photos, voice, and live tracking.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 text-center" style={styles.featureCard}>
                                <Card.Body className="p-4">
                                    <div style={styles.featureIcon}><CpuFill /></div>
                                    <Card.Title className="fw-bold">AI-Powered Efficiency</Card.Title>
                                    <Card.Text>
                                        Automated issue categorization, prioritization, and routing to the correct department, saving time and resources.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="h-100 text-center" style={styles.featureCard}>
                                <Card.Body className="p-4">
                                    <div style={styles.featureIcon}><BarChartLineFill /></div>
                                    <Card.Title className="fw-bold">Data-Driven Governance</Card.Title>
                                    <Card.Text>
                                        Powerful analytics dashboards provide insights for proactive planning and improved accountability.
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

             {/* --- Footer --- */}
             <footer style={styles.footer}>
                 <Container className="text-center">
                     <p>&copy; 2025 NagarikOne. All Rights Reserved.</p>
                 </Container>
             </footer>
        </div>
    );
};

export default Homepage;