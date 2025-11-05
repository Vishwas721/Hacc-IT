// File: src/pages/Users.jsx
// File: src/pages/Users.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Container, Table, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { useAuth } from '../context/AuthContext';
import styles from './Users.module.css';
import api from '../api/api';
import { toast } from 'react-toastify';

const RoleBadge = ({ role }) => {
    const variantMap = { 
        'super-admin': 'danger', 
        'municipal-admin': 'success',
        'dept-admin': 'info', 
        'staff': 'secondary' 
    };
    const variant = variantMap[role] || 'dark';
    return <Badge bg={variant} className={styles.roleBadge}>{role.replace('-', ' ')}</Badge>;
};

const Users = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, deptsRes] = await Promise.all([
                api.get('/users'),
                api.get('/departments')
            ]);
            setUsers(usersRes.data);
            setDepartments(deptsRes.data);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };
    
    const handleAddNewUser = () => {
        setIsEditing(false);
        setSelectedUser({ username: '', password: '', role: 'staff', DepartmentId: null });
        setShowModal(true);
    };
    
    const handleEditUser = (user) => {
        setIsEditing(true);
        setSelectedUser({ ...user, DepartmentId: user.Department?.id || null });
        setShowModal(true);
    };

    const handleStateChange = (e) => {
        const { name, value } = e.target;
        setSelectedUser(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            if (isEditing) {
                await api.put(`/users/${selectedUser.id}/role`, {
                    role: selectedUser.role,
                    departmentId: selectedUser.DepartmentId
                });
                toast.success(`User ${selectedUser.username} updated!`);
            } else {
await api.post('/auth/register/admin', {
                    username: selectedUser.username,
                    password: selectedUser.password,
                    role: selectedUser.role,
                    departmentId: selectedUser.DepartmentId,
                });
                toast.success(`User ${selectedUser.username} created successfully!`);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.details || error.response?.data?.error || 'An error occurred.');
        }
    };
    
    const columns = useMemo(() => [
        { header: 'Username', accessorKey: 'username' },
        { header: 'Role', accessorKey: 'role', cell: info => <RoleBadge role={info.getValue()} /> },
        { header: 'Department', accessorFn: row => row.Department ? row.Department.name : 'N/A' },
        { 
            header: 'Actions', 
            id: 'actions', 
            cell: ({ row }) => (
            currentUser && 
                row.original.id !== currentUser.id && // Can't edit yourself
                row.original.role !== 'super-admin' &&  // <-- AND can't edit a super-admin
                (
                    <Button variant="outline-secondary" size="sm" onClick={() => handleEditUser(row.original)}>
                        Edit User
                    </Button>
                )
            )},
    ], [currentUser]);

    const table = useReactTable({ data: users, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

    if (loading) return <Spinner animation="border" />;
    return (
        <Container fluid>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>User Management</h1>
                <Button variant="primary" onClick={handleAddNewUser}>Add New User</Button>
            </div>
            
            {/* --- THIS IS THE CORRECTED PART --- */}
            <Table hover responsive className={styles.table}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? `Edit User: ${selectedUser?.username}` : 'Add New User'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!isEditing && (
                        <>
                            <Form.Group controlId="username" className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control name="username" type="text" value={selectedUser?.username || ''} onChange={handleStateChange} />
                            </Form.Group>
                            <Form.Group controlId="password">
                                <Form.Label>Password</Form.Label>
                                <Form.Control name="password" type="password" value={selectedUser?.password || ''} onChange={handleStateChange} />
                            </Form.Group>
                        </>
                    )}
                    <Form.Group controlId="roleSelect" className="my-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Select name="role" value={selectedUser?.role || 'staff'} onChange={handleStateChange}>
                            <option value="staff">Staff</option>
                            <option value="dept-admin">Department Admin</option>
                        </Form.Select>
                    </Form.Group>
                    {(selectedUser?.role === 'dept-admin' || selectedUser?.role === 'staff') && (
                        <Form.Group controlId="deptSelect">
                            <Form.Label>Assign to Department</Form.Label>
                            <Form.Select name="DepartmentId" value={selectedUser?.DepartmentId || ''} onChange={handleStateChange}>
                                <option value="">Select a department...</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Users;