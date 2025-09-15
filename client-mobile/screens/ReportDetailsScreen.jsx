// File: client-mobile/screens/ReportDetailsScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; // 1. Import SecureStore
import { API_URL } from '../config';

const ReportDetailsScreen = ({ route }) => {
    const { reportId } = route.params;
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                // 2. Get the token from secure storage
                const token = await SecureStore.getItemAsync('token');
                if (!token) {
                    Alert.alert("Authentication Error", "Token not found.");
                    setLoading(false);
                    return;
                }

                // 3. Send the token in the Authorization header
                const response = await axios.get(`${API_URL}/api/reports/${reportId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setReport(response.data);
            } catch (error) {
                console.error("Failed to fetch report details", error);
                Alert.alert("Error", "Could not load report details.");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [reportId]);

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }
    
    if (!report) {
        return <View><Text style={styles.title}>Report not found.</Text></View>
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