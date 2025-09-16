// File: src/pages/Reports.jsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
// CORRECTED: All react-bootstrap components are now on a single line
import { Container, Table, Button, Badge, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import styles from './Reports.module.css';
import api from '../api/api';
import { toast } from 'react-toastify';

const PriorityBadge = ({ priority }) => {
    const variantMap = { 'High': 'danger', 'Medium': 'warning', 'Low': 'success' };
    return <Badge bg={variantMap[priority] || 'secondary'} className={styles.statusBadge}>{priority}</Badge>;
};

const StatusBadge = ({ status }) => {
    const variant = { Pending: 'warning', 'In Progress': 'primary', Resolved: 'success' }[status];
    return <Badge bg={variant} className={styles.statusBadge}>{status}</Badge>;
};

const Reports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/reports');
            setReports(response.data);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to fetch reports.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);
    
    const columns = useMemo(() => [
        { header: 'Description', accessorKey: 'description' },
        { header: 'Category', accessorKey: 'category' },
        { header: 'Priority', accessorKey: 'priority', cell: info => <PriorityBadge priority={info.getValue()} /> }, // <-- ADD THIS COLUMN
        { header: 'Status', accessorKey: 'status', cell: info => <StatusBadge status={info.getValue()} /> },
        { header: 'Reported On', accessorKey: 'createdAt', cell: info => new Date(info.getValue()).toLocaleDateString() },
        { header: 'Actions', id: 'actions', cell: ({ row }) => (
            <Button variant="outline-primary" size="sm" onClick={() => navigate(`/reports/${row.original.id}`)}>
                View Details
            </Button>
        )},
    ], [navigate]);

    const [globalFilter, setGlobalFilter] = useState('');
    const table = useReactTable({
        data: reports,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container fluid>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Manage Reports</h1>
                <Form.Control
                    type="text"
                    value={globalFilter ?? ''}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="Search all reports..."
                    style={{ maxWidth: '300px' }}
                />
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
        </Container>
    );
};

export default Reports;