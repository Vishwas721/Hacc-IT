import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, SegmentedButtons, ActivityIndicator, Card } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { API_URL } from '../config';

const THEME_COLOR = '#6200ee';

const PublicDashboardScreen = () => {
    const [view, setView] = useState('map');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPublicReports = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/reports/public`);
            setReports(response.data);
        } catch (error) {
            console.error("Failed to fetch public reports", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPublicReports();
    }, [fetchPublicReports]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return '#2ecc71';
            case 'in progress': return THEME_COLOR;
            default: return '#f1c40f';
        }
    };

    const renderReportItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <View style={styles.statusContainer}>
                    <Text>Status: </Text>
                    <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold' }}>{item.status}</Text>
                </View>
            </Card.Content>
        </Card>
    );

    if (loading && reports.length === 0) {
        return <ActivityIndicator animating={true} size="large" style={styles.loader} color={THEME_COLOR} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <SegmentedButtons
                    value={view}
                    onValueChange={setView}
                    buttons={[
                        { value: 'map', label: 'Map View', icon: 'map' },
                        { value: 'list', label: 'List View', icon: 'view-list' },
                    ]}
                />
            </View>

            {view === 'map' ? (
                <MapView 
                    style={styles.map} 
                    initialRegion={{
                        latitude: 12.9716, // Bengaluru Latitude
                        longitude: 77.5946, // Bengaluru Longitude
                        latitudeDelta: 0.2,
                        longitudeDelta: 0.2,
                    }}
                >
                    {/* --- This is the corrected and final code for the markers --- */}
                    {reports
                        .filter(report => report.location && report.location.coordinates && report.location.coordinates.length === 2)
                        .map(report => (
                            <Marker
                                key={report.id}
                                coordinate={{ 
                                    latitude: report.location.coordinates[1],  // Latitude is the second value
                                    longitude: report.location.coordinates[0] // Longitude is the first value
                                }}
                                title={report.category}
                                description={report.description}
                                pinColor={getStatusColor(report.status)}
                            />
                        ))
                    }
                </MapView>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderReportItem}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchPublicReports} colors={[THEME_COLOR]} />}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No reports found.</Text> : null}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 16, backgroundColor: '#fff' },
    map: { flex: 1 },
    card: { marginVertical: 6, marginHorizontal: 8 },
    itemDescription: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
    statusContainer: { flexDirection: 'row' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
});

export default PublicDashboardScreen;