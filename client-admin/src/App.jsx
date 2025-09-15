// File: src/App.jsx
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsProvider'; // Corrected import
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import ReportDetails from './pages/ReportDetails';
import Users from './pages/Users';
import Departments from './pages/Departments';
import Settings from './pages/Settings';


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
      <ReportsProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Homepage />} />
          {/* ... other routes ... */}
          <Route element={<ProtectedRoute allowedRoles={['super-admin', 'dept-admin']} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/:id" element={<ReportDetails />} />

              <Route path="/departments" element={<Departments />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer theme="colored" />
      </ReportsProvider>
    </AuthProvider>
  );
}

export default App;