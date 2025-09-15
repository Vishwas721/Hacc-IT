// File: src/context/ReportsProvider.jsx
import React, { useState, useCallback } from 'react';
import api from '../api/api';
import { ReportsContext } from './ReportContextObject';

export const ReportsProvider = ({ children }) => {
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, inProgress: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchDashboardStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const response = await api.get('/reports/stats');
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    const value = {
        stats,
        loadingStats,
        fetchDashboardStats,
    };

    return (
        <ReportsContext.Provider value={value}>
            {children}
        </ReportsContext.Provider>
    );
};