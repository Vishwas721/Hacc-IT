// File: src/pages/Reports.jsx
import React, { useMemo, useState } from 'react';
import { Container, Table, Button, Badge, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

import styles from './Reports.module.css';

// Mock Data - Replace with API later
const mockData = [
  { id: 125, description: 'Huge pothole on Main St.', category: 'Pothole', status: 'Pending', createdAt: '2025-09-14T10:00:00Z' },
  { id: 124, description: 'Overflowing bin near park', category: 'Garbage', status: 'In Progress', createdAt: '2025-09-13T14:30:00Z' },
  { id: 123, description: 'Streetlight flickering on 5th Ave', category: 'Streetlight', status: 'Resolved', createdAt: '2025-09-12T09:00:00Z' },
  { id: 122, description: 'Water leakage from pipe', category: 'Water Leak', status: 'Resolved', createdAt: '2025-09-11T18:00:00Z' },
];

const StatusBadge = ({ status }) => {
  const variant = {
    Pending: 'warning',
    'In Progress': 'primary',
    Resolved: 'success',
  }[status];
  return <Badge bg={variant} className={styles.statusBadge}>{status}</Badge>;
};

const Reports = () => {
  const navigate = useNavigate();
  const data = useMemo(() => mockData, []);

  const columns = useMemo(
    () => [
      {
        header: 'ID',
        accessorKey: 'id',
      },
      {
        header: 'Description',
        accessorKey: 'description',
      },
      {
        header: 'Category',
        accessorKey: 'category',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: info => <StatusBadge status={info.getValue()} />,
      },
      {
        header: 'Reported On',
        accessorKey: 'createdAt',
        cell: info => new Date(info.getValue()).toLocaleDateString(),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => navigate(`/reports/${row.original.id}`)}
          >
            View Details
          </Button>
        ),
      },
    ],
    [navigate]
  );

  // --- Table state ---
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

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
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted()] ?? null}
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
    </Container>
  );
};

export default Reports;
