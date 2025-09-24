import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Banner, Divider, Chip, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

const THEME_COLOR = '#6200ee'; // Your purple theme color

// This component renders a single item in the timeline
const TimelineItem = ({ item, isLastItem }) => {
    const isCompleted = true; // For visual purposes, we'll mark all past events as complete
    const icon = isCompleted ? "check-circle" : "circle-slice-8";
    const color = isCompleted ? '#2ecc71' : THEME_COLOR; // Green for completed steps

    return (
        <View style={styles.timelineItemContainer}>
            <View style={styles.timelineIconContainer}>
                <Avatar.Icon size={32} icon={icon} color={color} style={{backgroundColor: 'transparent'}}/>
                {!isLastItem && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{item.status}</Text>
                <Text style={styles.timelineTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
                {item.notes && <Text style={styles.timelineNotes}>{item.notes}</Text>}
            </View>
        </View>
    );
};


const ReportDetailsScreen = ({ route }) => {
    const { reportId } = route.params;
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                // Handle not logged in
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}/api/reports/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReport(response.data);
        } catch (error) {
            console.error("Failed to fetch report details", error);
        } finally {
            setLoading(false);
        }
    }, [reportId]);

    useFocusEffect(
        useCallback(() => {
            fetchReport();
        }, [fetchReport])
    );

    if (loading && !report) {
        return <ActivityIndicator size="large" style={styles.loader} color={THEME_COLOR} />;
    }
    
    if (!report) {
        return <View><Text style={styles.title}>Report not found.</Text></View>;
    }

    const currentStatusIcon = report.status === 'Resolved' ? 'check-decagram' : 'progress-clock';
    const currentStatusColor = report.status === 'Resolved' ? '#2ecc71' : THEME_COLOR;

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReport} colors={[THEME_COLOR]} />}
        >
            <Image source={{ uri: report.imageUrl }} style={styles.image} />
            
            <Card style={styles.card}>
                <Card.Content>
                    <Chip icon={currentStatusIcon} style={[styles.statusChip, {backgroundColor: currentStatusColor}]}>
                        STATUS: {report.status.toUpperCase()}
                    </Chip>
                    <Text style={styles.title}>Report #{report.id}</Text>
                    <Text style={styles.description}>{report.description}</Text>
                </Card.Content>
            </Card>

            {report.slaDeadline && (
                <Card style={styles.card}>
                    <Card.Title 
                        title="Estimated Resolution Time"
                        left={(props) => <Avatar.Icon {...props} icon="clock-time-three-outline" />}
                    />
                    <Card.Content>
                        <Text style={styles.slaText}>
                            {new Date(report.slaDeadline).toLocaleString()}
                        </Text>
                    </Card.Content>
                </Card>
            )}

            <Card style={styles.card}>
                <Card.Title title="Tracking History" />
                <Card.Content>
                    {report.statusHistory.map((item, index) => (
                        <TimelineItem 
                            key={index} 
                            item={item} 
                            isLastItem={index === report.statusHistory.length - 1} 
                        />
                    ))}
                </Card.Content>
            </Card>

            {report.status === 'Resolved' && report.resolvedImageUrl && (
                <Card style={[styles.card, styles.resolvedCard]}>
                    <Card.Title 
                        title="Proof of Resolution"
                        titleStyle={{color: '#2ecc71'}}
                        left={(props) => <Avatar.Icon {...props} icon="check-all" color="#2ecc71" style={{backgroundColor: 'transparent'}} />}
                    />
                    <Card.Cover source={{ uri: report.resolvedImageUrl }} style={styles.resolutionImage} />
                    {report.resolvedNotes && (
                        <Card.Content>
                            <Text style={styles.resolutionNotes}>Admin Notes: "{report.resolvedNotes}"</Text>
                        </Card.Content>
                    )}
                </Card>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    card: { margin: 10, borderRadius: 12 },
    image: { width: '100%', height: 250 },
    statusChip: { alignSelf: 'flex-start', marginBottom: 16 },
    title: { fontSize: 26, fontWeight: 'bold', marginTop: 8, color: '#333' },
    description: { fontSize: 16, marginTop: 8, color: '#555', lineHeight: 24 },
    slaText: { fontSize: 16, fontWeight: '500', color: THEME_COLOR },
      imageContainer: {
        backgroundColor: '#fff', // A white background behind the image
        padding: 8, // This creates the border effect
        margin: 10,
        borderRadius: 12,
        // Add a subtle shadow for a floating effect
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    image: { 
        width: '100%', 
        height: 250,
        borderRadius: 6, // Slightly rounded corners for the image itself
    },
    
    // Timeline Styles
    timelineItemContainer: { flexDirection: 'row', alignItems: 'flex-start' },
    timelineIconContainer: { alignItems: 'center', marginRight: 12 },
    timelineLine: { flex: 1, width: 2, backgroundColor: '#e0e0e0' },
    timelineContent: { flex: 1, paddingBottom: 20 },
    timelineStatus: { fontSize: 16, fontWeight: 'bold' },
    timelineTimestamp: { fontSize: 12, color: 'gray' },
    timelineNotes: { fontSize: 14, color: '#555', fontStyle: 'italic', marginTop: 4 },

    // Resolution Card Styles
    resolvedCard: {
        borderColor: '#2ecc71',
        borderWidth: 1,
    },
    resolutionImage: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
    },
    resolutionNotes: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#333',
        paddingBottom: 10,
    },
    
});

export default ReportDetailsScreen;