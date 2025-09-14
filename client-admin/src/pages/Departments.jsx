// File: src/pages/Departments.jsx
import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form } from 'react-bootstrap';
import styles from './Departments.module.css';

// Mock Data
const mockDepartments = [
  { id: 1, name: 'Public Works' },
  { id: 2, name: 'Sanitation' },
  { id: 3, name: 'Electrical Department' },
  { id: 4, name: 'Water Authority' },
];

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDept, setCurrentDept] = useState({ id: null, name: '' });

  useEffect(() => {
    // API call to fetch departments would go here
    setDepartments(mockDepartments);
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setCurrentDept({ id: null, name: '' });
    setIsEditing(false);
  };

  const handleShow = () => setShowModal(true);

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentDept({ id: null, name: '' });
    handleShow();
  };
  
  const handleEdit = (dept) => {
    setIsEditing(true);
    setCurrentDept(dept);
    handleShow();
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      // API call to delete would go here
      setDepartments(departments.filter(d => d.id !== id));
    }
  };

  const handleSave = () => {
    if (isEditing) {
      // API call to update would go here
      setDepartments(departments.map(d => d.id === currentDept.id ? currentDept : d));
    } else {
      // API call to create would go here
      const newDept = { ...currentDept, id: Date.now() }; // Use timestamp for mock ID
      setDepartments([...departments, newDept]);
    }
    handleClose();
  };

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
      
      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Department' : 'Add New Department'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="departmentName">
              <Form.Label>Department Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter department name" 
                value={currentDept.name}
                onChange={(e) => setCurrentDept({...currentDept, name: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Departments;