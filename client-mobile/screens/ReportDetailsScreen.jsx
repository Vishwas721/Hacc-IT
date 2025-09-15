// File: client-mobile/screens/ReportDetailsScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config'; // ADD THIS LINE
// DELETE the old line: const API_URL = 'http://...';

const ReportDetailsScreen = ({ route }) => {
    const { reportId } = route.params;
    const [report, setReport] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/reports/${reportId}`);
                setReport(response.data);
            } catch (error) {
                console.error("Failed to fetch report details", error);
            }
        };
        fetchReport();
    }, [reportId]);

    if (!report) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: report.imageUrl }} style={styles.image} />
            <Text style={styles.title}>Report #{report.id}</Text>
            <Text style={styles.description}>{report.description}</Text>
            
            <View style={styles.timelineContainer}>
                <Text style={styles.timelineTitle}>Tracking History</Text>
                {report.statusHistory.map((item, index) => (
                    <View key={index} style={styles.timelineItem}>
                        <View style={styles.timelineIcon} />
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineStatus}>{item.status}</Text>
                            <Text style={styles.timelineTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#fff' },
    image: { width: '100%', height: 250 },
    title: { fontSize: 24, fontWeight: 'bold', padding: 16 },
    description: { fontSize: 16, paddingHorizontal: 16, paddingBottom: 16, color: 'gray' },
    timelineContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
    timelineTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    timelineItem: { flexDirection: 'row', marginBottom: 20 },
    timelineIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#007bff', marginTop: 4, marginRight: 12 },
    timelineContent: { flex: 1 },
    timelineStatus: { fontSize: 18, fontWeight: 'bold' },
    timelineTimestamp: { fontSize: 14, color: 'gray' },
});

export default ReportDetailsScreen;