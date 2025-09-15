// File: src/hooks/useReports.js
import { useContext } from 'react';
import { ReportsContext } from '../context/ReportContextObject'; // Update this import path

export const useReports = () => {
    const context = useContext(ReportsContext);
    if (!context) {
        throw new Error('useReports must be used within a ReportsProvider');
    }
    return context;
};