// File: src/pages/Users.jsx
import React, { useState, useMemo } from 'react';
import { Container, Table, Button, Badge, Modal, Form } from 'react-bootstrap';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import styles from './Users.module.css';

// Mock Data
const mockUsers = [
  { id: 1, username: 'superadmin', role: 'super-admin' },
  { id: 2, username: 'john.doe', role: 'dept-admin' },
  { id: 3, username: 'jane.smith', role: 'staff' },
  { id: 4, username: 'mike.williams', role: 'staff' },
];

const RoleBadge = ({ role }) => {
    const variant = {
        'super-admin': 'danger',
        'dept-admin': 'info',
        'staff': 'secondary',
    }[role];
    return <Badge bg={variant} className={styles.roleBadge}>{role.replace('-', ' ')}</Badge>;
};

const Users = () => {
    const [users, setUsers] = useState(mockUsers);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const handleRoleChange = (e) => {
        setSelectedUser({ ...selectedUser, role: e.target.value });
    };

    const handleSaveChanges = () => {
        // API call to update user role would go here
        setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
        handleCloseModal();
    };
    
    const columns = useMemo(() => [
        { header: 'User ID', accessorKey: 'id' },
        { header: 'Username', accessorKey: 'username' },
        { header: 'Role', accessorKey: 'role', cell: info => <RoleBadge role={info.getValue()} /> },
        { header: 'Actions', id: 'actions', cell: ({ row }) => (
            <Button variant="outline-secondary" size="sm" onClick={() => handleOpenModal(row.original)}>
                Change Role
            </Button>
        )},
    ], []);

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

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
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Role Change Modal */}
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
                            <option value="super-admin">Super Admin</option>
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