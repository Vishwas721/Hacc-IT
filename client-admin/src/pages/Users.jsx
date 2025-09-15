// File: src/pages/Users.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Container, Table, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { useAuth } from '../context/AuthContext'; // Import useAuth to know who is logged in
import styles from './Users.module.css';
import api from '../api/api';
import { toast } from 'react-toastify';

const RoleBadge = ({ role }) => {
    const variant = { 'super-admin': 'danger', 'dept-admin': 'info', 'staff': 'secondary' }[role];
    return <Badge bg={variant} className={styles.roleBadge}>{role.replace('-', ' ')}</Badge>;
};

const Users = () => {
    const { user: currentUser } = useAuth(); // Get the currently logged-in user from context
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };
    const handleCloseModal = () => setShowModal(false);
    const handleRoleChange = (e) => setSelectedUser({ ...selectedUser, role: e.target.value });

    const handleSaveChanges = async () => {
        try {
            await api.put(`/users/${selectedUser.id}/role`, { role: selectedUser.role });
            toast.success(`Role for ${selectedUser.username} updated!`);
            fetchUsers();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update role.');
        }
    };
    
    const columns = useMemo(() => [
        // The ID column has been removed for a cleaner UI
        { header: 'Username', accessorKey: 'username' },
        { header: 'Role', accessorKey: 'role', cell: info => <RoleBadge role={info.getValue()} /> },
        { header: 'Actions', id: 'actions', cell: ({ row }) => (
            // Hide the button if the user in this row is the same as the logged-in user
            currentUser && row.original.id !== currentUser.id && (
                <Button variant="outline-secondary" size="sm" onClick={() => handleOpenModal(row.original)}>
                    Change Role
                </Button>
            )
        )},
    ], [currentUser]); // Add currentUser to dependency array

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    if (loading) return <Spinner animation="border" />;

    return (
        <Container fluid>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>User Management</h1>
            </div>
            <Table hover responsive className={styles.table}>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} onClick={header.column.getToggleSortingHandler()} style={{ cursor: 'pointer' }}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? null}
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
                    <Modal.Title>Change Role for {selectedUser?.username}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="roleSelect">
                        <Form.Label>Select New Role</Form.Label>
                        <Form.Select value={selectedUser?.role} onChange={handleRoleChange}>
                            <option value="staff">Staff</option>
                            <option value="dept-admin">Department Admin</option>
                            {/* The 'super-admin' option is intentionally removed for security */}
                        </Form.Select>
                    </Form.Group>
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