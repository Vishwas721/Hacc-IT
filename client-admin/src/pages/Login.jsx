import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const Login = () => {
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
    await login(username, password);
  };

  return (
    <Container fluid>
      <Row className="min-vh-100 align-items-center justify-content-center">
        <Col md={8} lg={6} xl={4}>
          <Card className="shadow-lg">
            <Card.Body className="p-5">
              <h2 className="fw-bold mb-5 text-center">Admin Login</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" placeholder="admin" size="lg" />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" placeholder="password" size="lg" />
                </Form.Group>

                <Button variant="primary" type="submit" size="lg" className="w-100">
                  Log in
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;