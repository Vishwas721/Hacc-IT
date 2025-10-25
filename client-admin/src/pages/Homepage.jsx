import React from 'react';
import { Container, Row, Col, Button, Card, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// --- SVGs for Illustrations and Icons ---

const HeroIllustration = () => (
    <svg viewBox="0 0 500 350" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f7fa" />
                <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
        </defs>
        <rect width="500" height="350" fill="url(#skyGradient)" rx="20"/>
        {/* Cityscape */}
        <path d="M 50 300 L 50 150 L 80 120 L 110 150 L 110 300 Z" fill="#d0d9e3"/>
        <path d="M 120 300 L 120 180 C 140 160, 160 160, 180 180 L 180 300 Z" fill="#e0e7f1"/>
        <rect x="190" y="100" width="80" height="200" fill="#d0d9e3" rx="5"/>
        <circle cx="230" cy="80" r="30" fill="#ffffff"/>
        <circle cx="230" cy="80" r="10" fill="#FF9933"/>
        <path d="M 280 300 L 280 160 L 320 120 L 360 160 L 360 300 Z" fill="#e0e7f1"/>
        <path d="M 370 300 L 370 200 L 450 200 L 450 300 Z" fill="#d0d9e3"/>

        {/* Flag */}
        <rect x="215" y="15" width="30" height="6" fill="#FF9933"/>
        <rect x="215" y="21" width="30" height="6" fill="#FFFFFF"/>
        <rect x="215" y="27" width="30" height="6" fill="#138808"/>
        <circle cx="230" cy="24" r="2" fill="#000080"/>
        <line x1="230" y1="33" x2="230" y2="50" stroke="#a0aec0" strokeWidth="2"/>

        {/* People */}
        <g transform="translate(100, 180)">
            <circle cx="35" cy="40" r="20" fill="#fde68a"/>
            <path d="M 15 60 C 25 90, 45 90, 55 60 L 55 120 L 15 120 Z" fill="#fb923c"/>
            <rect x="25" y="80" width="20" height="30" rx="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
        </g>
        <g transform="translate(200, 170)">
            <circle cx="50" cy="45" r="25" fill="#e5e7eb"/>
            <path d="M 25 70 C 40 110, 60 110, 75 70 L 75 130 L 25 130 Z" fill="#4ade80"/>
             <rect x="40" y="90" width="20" height="30" rx="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
        </g>
        <g transform="translate(300, 180)">
            <circle cx="35" cy="40" r="20" fill="#fde047"/>
            <path d="M 15 60 C 25 90, 45 90, 55 60 L 55 120 L 15 120 Z" fill="#f9a8d4"/>
             <rect x="25" y="80" width="20" height="30" rx="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1"/>
        </g>
    </svg>
);


const CitizenEmpowermentIcon = () => (
    <svg viewBox="0 0 100 80"><path d="M20,70 l-10,-20 a5,5 0 0,1 10,0 l5,10" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round"/><path d="M30,50 a20,20 0 0,1 40,0" fill="none" stroke="#9ca3af" strokeWidth="2"/><rect x="25" y="20" width="50" height="60" rx="5" fill="#e5e7eb"/><rect x="30" y="25" width="40" height="45" rx="3" fill="white"/><circle cx="50" cy="70" r="3" fill="#9ca3af"/><path d="M70,25 l10,-10 a5,5 0 0,1 0,10 l-5,5" fill="#fef08a"/></svg>
);

const AIEfficiencyIcon = () => (
    <svg viewBox="0 0 100 80"><circle cx="50" cy="40" r="20" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3"/><circle cx="50" cy="40" r="15" fill="#dbeafe"/><path d="M50,25 v-10 m15,15 l10,-10 m10,15 h10 M75,55 l10,10 M50,55 v10 M25,55 l-10,10 M20,40 h-10 M25,25 l-10,-10" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round"/><circle cx="80" cy="30" r="3" fill="#4ade80"/><circle cx="80" cy="40" r="3" fill="#facc15"/><circle cx="80" cy="50" r="3" fill="#f87171"/></svg>
);

const DataGovernanceIcon = () => (
    <svg viewBox="0 0 100 80"><rect x="10" y="10" width="80" height="60" rx="5" fill="#e0e7f1"/><path d="M10,20 h80 M30,10 v60 M70,10 v60" stroke="white" strokeWidth="2"/><rect x="15" y="25" width="10" height="40" fill="#60a5fa" opacity="0.8"/><rect x="35" y="45" width="30" height="20" fill="#4ade80"/><circle cx="50" cy="35" r="5" fill="#fb923c"/><path d="M75,25 l10,10 -10,10" fill="#f472b6"/></svg>
);

const AshokaChakraIcon = () => (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="#000080" strokeWidth="4"/>
        <circle cx="50" cy="50" r="8" fill="#000080"/>
        <g stroke="#000080" strokeWidth="3" strokeLinecap="round">
            {Array.from({ length: 24 }).map((_, i) => (
                <line key={i} x1="50" y1="50" x2="50" y2="10" transform={`rotate(${i * 15}, 50, 50)`} />
            ))}
        </g>
    </svg>
);

const Homepage = () => {
    const navigate = useNavigate();

    const styles = {
        homepage: {
            fontFamily: "'Inter', sans-serif",
            // UPDATED: Page-wide subtle gradient
            background: 'linear-gradient(180deg, rgba(255, 249, 242, 0.4) 0%, rgba(255, 255, 255, 0) 50%, rgba(242, 255, 245, 0.4) 100%)',
        },
        navbar: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            padding: '1rem 2rem',
        },
        navLink: {
            color: '#4b5563',
            fontWeight: '600',
            margin: '0 1rem',
        },
        navLinkActive: {
            color: '#0a2351',
            fontWeight: '600',
            margin: '0 1rem',
            borderBottom: '2px solid #FF9933'
        },
        hero: {
            padding: '4rem 2rem',
             // UPDATED: Clearer, more vibrant hero gradient
            background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.1) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(19, 136, 8, 0.1) 100%)',
        },
        heroTitle: {
            fontSize: '3.5rem',
            fontWeight: '800',
            color: '#0a2351',
            lineHeight: '1.2',
        },
        heroButton: {
            backgroundColor: '#000080',
            borderColor: '#000080',
            color: '#FFFFFF',
            fontWeight: '700',
            padding: '0.75rem 2rem',
            borderRadius: '0.5rem',
            transition: 'all 0.3s ease',
        },
        features: {
            padding: '5rem 2rem',
            // REMOVED background color to inherit from homepage style
        },
        sectionTitle: {
            fontWeight: '700',
            fontSize: '2.5rem',
            marginBottom: '4rem',
            color: '#0a2351'
        },
        featureCard: {
            border: '1px solid rgba(229, 231, 235, 0.5)',
            borderRadius: '1.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            // UPDATED: Frosted glass effect
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(8px)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        },
        cardIconWrapper: {
            height: '80px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        cardTitle: {
            color: '#0a2351',
            fontWeight: '700',
            fontSize: '1.5rem',
            marginBottom: '1rem',
        },
        cardText: {
            color: '#4b5563',
        },
        footer: {
            color: '#4b5563',
            paddingTop: '4rem',
            position: 'relative',
            // REMOVED background color
        },
        footerWave: {
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            height: '100px',
            // UPDATED: More vibrant gradient wave
            background: 'linear-gradient(90deg, rgba(255,153,51,0.5) 33%, rgba(255,255,255,0.1) 33%, rgba(255,255,255,0.1) 66%, rgba(19,136,8,0.5) 66%)',
            zIndex: '0',
            clipPath: 'path("M0,50 C150,100 350,0 500,50 L500,100 L0,100 Z")',
            transform: 'scaleX(4)',
            opacity: '0.7'
        },
        footerContent: {
            position: 'relative',
            zIndex: '1',
            padding: '2rem',
        }
    };

    return (
        <div style={styles.homepage}>
            <Navbar style={styles.navbar} expand="lg" fixed="top">
                <Container>
                    <Navbar.Brand href="#home" className="fw-bold fs-4" style={{color: '#0a2351'}}>NagarikOne</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">

                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <main style={{paddingTop: '80px'}}>
                <section style={styles.hero}>
                    <Container>
                        <Row className="align-items-center">
                            <Col md={6} className="text-center text-md-start mb-5 mb-md-0">
                                <h1 style={styles.heroTitle}>Welcome to NagarikOne</h1>
                                <p className="text-muted my-4 fs-5">Empowering citizens and enabling data-driven governance for smarter, more responsive cities.</p>
                                <Button
                                    style={styles.heroButton}
                                    size="lg"
                                    onClick={() => navigate('/login')}
                                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    Admin & Staff Login
                                </Button>
                            </Col>
                            <Col md={6}>
                                <HeroIllustration />
                            </Col>
                        </Row>
                    </Container>
                </section>

                <section style={styles.features}>
                    <Container>
                        <h2 className="text-center" style={styles.sectionTitle}>A 360° Platform for Civic Management</h2>
                        <Row>
                            <Col md={4} className="mb-4">
                                <Card className="h-100 text-center" style={styles.featureCard}>
                                    <div style={styles.cardIconWrapper}><CitizenEmpowermentIcon/></div>
                                    <Card.Body>
                                        <Card.Title style={styles.cardTitle}>Citizen Empowerment</Card.Title>
                                        <Card.Text style={styles.cardText}>
                                            An inclusive mobile app allows any citizen to report issues easily with photos, voice, and live tracking.
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4} className="mb-4">
                                <Card className="h-100 text-center" style={styles.featureCard}>
                                    <div style={styles.cardIconWrapper}><AIEfficiencyIcon/></div>
                                    <Card.Body>
                                        <Card.Title style={styles.cardTitle}>AI-Powered Efficiency</Card.Title>
                                        <Card.Text style={styles.cardText}>
                                            Automated issue categorization, prioritization, and routing to the correct department, saving time and resources.
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={4} className="mb-4">
                                <Card className="h-100 text-center" style={styles.featureCard}>
                                    <div style={styles.cardIconWrapper}><DataGovernanceIcon/></div>
                                    <Card.Body>
                                        <Card.Title style={styles.cardTitle}>Data-Driven Governance</Card.Title>
                                        <Card.Text style={styles.cardText}>
                                            Powerful analytics dashboards provide insights for proactive planning and improved accountability.
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </section>
            </main>

             <footer style={styles.footer}>
                <div style={styles.footerWave}></div>
                 <Container style={styles.footerContent}>
                     <Row className="align-items-center text-center">
                         <Col md={4} className="mb-3 mb-md-0">
                             <p className="mb-0">&copy; 2025 NagarikOne. All Rights Reserved.</p>
                         </Col>
                         <Col md={4} className="mb-3 mb-md-0">
                            <AshokaChakraIcon/>
                         </Col>
                         <Col md={4}>
                            <a href="#" className="text-decoration-none me-3" style={{color: '#4b5563'}}>Privacy</a>
                            <a href="#" className="text-decoration-none" style={{color: '#4b5563'}}>Terms</a>
                         </Col>
                     </Row>
                 </Container>
             </footer>
        </div>
    );
};

export default Homepage;

