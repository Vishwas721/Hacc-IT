import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import ReportDetails from './pages/ReportDetails';
// Import other pages as needed

// A simple layout wrapper
const MainLayout = () => {
  return (
    <Container fluid>
      <Row>
        <Col md={3} lg={2} className="p-0 d-none d-md-block">
          <Sidebar />
        </Col>
        <Col md={9} lg={10} className="main-content">
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute allowedRoles={['super-admin', 'dept-admin']} />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/:id" element={<ReportDetails />} />
            {/* Add other protected routes here later */}
          </Route>
        </Route>
      </Routes>
      <ToastContainer theme="colored" />
    </AuthProvider>
  );
}

export default App;