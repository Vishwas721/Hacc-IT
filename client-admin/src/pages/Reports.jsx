// File: client-admin/src/pages/Reports.jsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
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

// In client-admin/src/pages/Reports.jsx

const StatusBadge = ({ status }) => {
    const variantMap = {
        'Submitted': 'secondary',
        'Pending Review': 'warning', // <-- Add this new status and color
        'Assigned': 'info',
        'In Progress': 'primary',
        'Resolved': 'success'
    };
    return <Badge bg={variantMap[status] || 'dark'}>{status}</Badge>;
};

const Reports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');

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
        // Using accessorFn for nested properties is more robust
        { header: 'Description', accessorFn: row => row.description, cell: info => <span className={styles.descriptionCell}>{info.getValue()}</span> },
        { header: 'Category', accessorKey: 'category' },
        { header: 'Priority', accessorKey: 'priority', cell: info => <PriorityBadge priority={info.getValue()} /> },
        { header: 'Status', accessorKey: 'status', cell: info => <StatusBadge status={info.getValue()} /> },
        { header: 'Department', accessorFn: row => row.Department?.name || 'N/A' },
        { header: 'Actions', id: 'actions', cell: ({ row }) => (
            <Button variant="primary" size="sm" onClick={() => navigate(`/reports/${row.original.id}`)}>
                View Details
            </Button>
        )},
    ], [navigate]);

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
                <h1 className="page-title">Manage Reports</h1>
                <div className={styles.searchBox}>
                    <Form.Control
                        type="text"
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search reports..."
                        className={styles.searchInput}
                    />
                </div>
            </div>
            
            <div className={`frosted-card ${styles.tableContainer}`}>
                <Table hover responsive className={styles.table}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} onClick={header.column.getToggleSortingHandler()}>
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
            </div>
        </Container>
    );
};

export default Reports;