// File: src/pages/Users.jsx
/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { Container, Table, Button, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import styles from './Users.module.css';
import api from '../api/api';
import { toast } from 'react-toastify';

const RoleBadge = ({ role }) => {
    const variant = { 'super-admin': 'danger', 'dept-admin': 'info', 'staff': 'secondary' }[role];
    return <Badge bg={variant} className={styles.roleBadge}>{role.replace('-', ' ')}</Badge>;
};

const Users = () => {
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
            fetchUsers(); // Re-fetch the user list to show the change
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update role.');
        }
    };
    
    const columns = useMemo(() => [
        { header: 'User ID', accessorKey: 'id' },
        { header: 'Username', accessorKey: 'username' },
        { header: 'Role', accessorKey: 'role', cell: info => <RoleBadge role={info.getValue()} /> },
        { header: 'Actions', id: 'actions', cell: ({ row }) => (
            <Button variant="outline-secondary" size="sm" onClick={() => handleOpenModal(row.original)}>Change Role</Button>
        )},
    ], []);

    const table = useReactTable({ data: users, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

    if (loading) return <Spinner animation="border" />;

    return (
        <Container fluid>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>User Management</h1>
            </div>
            {/* Table and Modal JSX is the same as before */}
            <Table hover responsive className={styles.table}>
                {/* ... table head ... */}
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
                {/* ... modal content ... */}
            </Modal>
        </Container>
    );
};

export default Users;