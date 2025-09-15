// File: src/pages/Departments.jsx
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import styles from './Departments.module.css';
import api from '../api/api';
import { toast } from 'react-toastify';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Add a saving state for better UX
  const [currentDept, setCurrentDept] = useState({ id: null, name: '' });

  // Function to fetch departments from the API
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/departments');
      setDepartments(response.data);
    } catch (error) {
      toast.error('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when the component first loads
  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setCurrentDept({ id: null, name: '' });
    setIsEditing(false);
  };

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentDept({ id: null, name: '' });
    setShowModal(true);
  };
  
  const handleEdit = (dept) => {
    setIsEditing(true);
    setCurrentDept(dept);
    setShowModal(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/departments/${id}`);
        toast.success('Department deleted successfully!');
        fetchDepartments(); // CRITICAL: Re-fetch data to update the UI
      } catch (error) {
        toast.error('Failed to delete department.');
      }
    }
  };

  const handleSave = async () => {
    if (!currentDept.name) {
        toast.warn('Department name cannot be empty.');
        return;
    }
    setIsSaving(true);
    const action = isEditing ? 'update' : 'create';
    try {
      if (isEditing) {
        await api.put(`/departments/${currentDept.id}`, { name: currentDept.name });
      } else {
        await api.post('/departments', { name: currentDept.name });
      }
      toast.success(`Department ${action}d successfully!`);
      fetchDepartments(); // CRITICAL: Re-fetch data to update the UI
      handleClose();
    } catch (error) {
      toast.error(`Failed to ${action} department.`);
    } finally {
        setIsSaving(false);
    }
  };

  if (loading && departments.length === 0) {
    return <Spinner animation="border" />;
  }

  return (
    <Container fluid>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Manage Departments</h1>
        <Button variant="primary" onClick={handleAdd}>
          Add New Department
        </Button>
      </div>

      <Table hover responsive className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Department Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(dept => (
            <tr key={dept.id}>
              <td>{dept.id}</td>
              <td>{dept.name}</td>
              <td className={styles.actionsCell}>
                <Button variant="outline-secondary" size="sm" onClick={() => handleEdit(dept)}>Edit</Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(dept.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Department' : 'Add New Department'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <Form.Group controlId="departmentName">
              <Form.Label>Department Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter department name" 
                value={currentDept.name}
                onChange={(e) => setCurrentDept({...currentDept, name: e.target.value})}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Spinner as="span" animation="border" size="sm" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Departments;