import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Alert } from 'react-bootstrap';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Container className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!user) {
    // Now we check for user object instead of token
    return <Navigate to="/login" replace />;
  }



  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>403 - Unauthorized</Alert.Heading>
          <p>You do not have the necessary permissions to view this page.</p>
        </Alert>
      </Container>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;