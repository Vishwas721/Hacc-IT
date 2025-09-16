import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert, RefreshControl } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';
import { useFocusEffect } from '@react-navigation/native';

const ReportDetailsScreen = ({ route }) => {
    const { reportId } = route.params;
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                Alert.alert("Authentication Error", "Token not found.");
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}/api/reports/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReport(response.data);
        } catch (error) {
            console.error("Failed to fetch report details", error);
            Alert.alert("Error", "Could not load report details.");
        } finally {
            setLoading(false);
        }
    }, [reportId]);

    useFocusEffect(
        useCallback(() => {
            fetchReport();
        }, [fetchReport])
    );

    if (loading && !report) { // Show loader only on initial load
        return <ActivityIndicator size="large" style={styles.loader} />;
    }
    
    if (!report) {
        return <View><Text style={styles.title}>Report not found.</Text></View>
    }

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReport} />}
        >
            <Image source={{ uri: report.imageUrl }} style={styles.image} />
            <View style={styles.mainContent}>
                <Text style={styles.title}>Report #{report.id}</Text>
                <Text style={styles.description}>{report.description}</Text>
            </View>
            
            {/* SLA Display Section */}
            {report.slaDeadline && (
                <View style={styles.slaContainer}>
                    <Text style={styles.slaText}>
                        🕒 Expected Resolution By: {new Date(report.slaDeadline).toLocaleString()}
                    </Text>
                </View>
            )}

            <View style={styles.timelineContainer}>
                <Text style={styles.timelineTitle}>Tracking History</Text>
                {report.statusHistory.map((item, index) => (
                    <View key={index} style={styles.timelineItem}>
                        <View style={styles.timelineIcon} />
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineStatus}>{item.status}</Text>
                            <Text style={styles.timelineTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
                            {item.notes && <Text style={styles.timelineNotes}>{item.notes}</Text>}
                        </View>
                    </View>
                ))}
            </View>

            {/* Proof of Resolution Section */}
            {report.status === 'Resolved' && report.resolvedImageUrl && (
                <View style={styles.resolutionContainer}>
                    <Text style={styles.resolutionTitle}>Proof of Resolution</Text>
                    <Image source={{ uri: report.resolvedImageUrl }} style={styles.resolutionImage} />
                    {report.resolvedNotes && (
                        <Text style={styles.resolutionNotes}>
                            Admin Notes: <Text style={{ fontStyle: 'italic' }}>"{report.resolvedNotes}"</Text>
                        </Text>
                    )}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#fff' },
    image: { width: '100%', height: 250 },
    mainContent: { padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold' },
    description: { fontSize: 16, marginTop: 8, color: 'gray', lineHeight: 22 },
    
    // Styles for the SLA display
    slaContainer: {
        backgroundColor: '#e7f3fe',
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#bde0fe',
    },
    slaText: {
        fontSize: 15,
        color: '#0c5460',
        textAlign: 'center',
        fontWeight: '500',
    },

    timelineContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
    timelineTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    timelineItem: { flexDirection: 'row', marginBottom: 20 },
    timelineIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#007bff', marginTop: 4, marginRight: 12 },
    timelineContent: { flex: 1 },
    timelineStatus: { fontSize: 18, fontWeight: 'bold' },
    timelineTimestamp: { fontSize: 14, color: 'gray' },
    timelineNotes: { fontSize: 14, color: '#555', fontStyle: 'italic', marginTop: 4 },

    // Styles for the resolution section
    resolutionContainer: {
        padding: 16,
        marginTop: 10,
        borderTopWidth: 8,
        borderTopColor: '#eaf5e9',
        backgroundColor: '#f9f9f9',
    },
    resolutionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#2e7d32',
    },
    resolutionImage: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    resolutionNotes: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
});

export default ReportDetailsScreen;