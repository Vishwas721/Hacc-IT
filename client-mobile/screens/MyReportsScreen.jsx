import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Banner, Button as PaperButton } from 'react-native-paper';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const MyReportsScreen = ({ navigation }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { logout } = useAuth();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <PaperButton onPress={logout} textColor="#fff">Logout</PaperButton>
            ),
        });
    }, [navigation, logout]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                const response = await axios.get(`${API_URL}/api/reports/my-reports`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReports(response.data);
            } else {
                logout();
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    }, [logout]);
    
    // useFocusEffect is often better for fetching data when a screen comes into view
    useFocusEffect(
        useCallback(() => {
            fetchReports();
        }, [fetchReports])
    );

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
                return { backgroundColor: '#2ecc71', color: '#fff' };
            case 'in progress':
                return { backgroundColor: '#3498db', color: '#fff' };
            case 'pending':
                return { backgroundColor: '#f1c40f', color: '#333' };
            default:
                return { backgroundColor: '#bdc3c7', color: '#fff' };
        }
    };

    const renderReportItem = ({ item }) => (
        <Card 
            style={styles.card} 
            onPress={() => navigation.navigate('ReportDetails', { reportId: item.id })}
        >
            <Card.Content>
                <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Status:</Text>
                    <View style={[styles.statusTag, getStatusStyle(item.status)]}>
                        <Text style={[styles.statusText, {color: getStatusStyle(item.status).color}]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );

    if (loading && reports.length === 0) {
        return <ActivityIndicator animating={true} size="large" style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            {error && (
                <Banner visible={!!error} actions={[{ label: 'Retry', onPress: fetchReports }]}>
                    <Text>{error}</Text>
                </Banner>
            )}
            <FlatList
                data={reports}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderReportItem}
                ListHeaderComponent={<Text style={styles.title}>My Submitted Reports</Text>}
                ListEmptyComponent={!loading ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No reports found.</Text>
                        <Text style={styles.emptySubText}>Press the '+' button to submit your first report.</Text>
                    </View>
                ) : null}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReports} colors={['#3498db']} />}
                contentContainerStyle={styles.listContent}
            />
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('SubmitReport')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    loader: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    listContent: {
        paddingHorizontal: 8,
        paddingBottom: 80, // To make space for the FAB
    },
    title: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        padding: 16, 
        color: '#333'
    },
    card: { 
        marginVertical: 6,
        marginHorizontal: 8,
    },
    itemDescription: { 
        fontSize: 16, 
        fontWeight: '500', 
        marginBottom: 12,
        lineHeight: 22,
    },
    statusContainer: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    statusLabel: {
        fontSize: 14,
        color: 'gray',
        marginRight: 8,
    },
    statusTag: {
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingTop: 100 
    },
    emptyText: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#555' 
    },
    emptySubText: { 
        fontSize: 14, 
        color: 'gray', 
        marginTop: 8 
    },
    fab: { 
        position: 'absolute', 
        margin: 16, 
        right: 0, 
        bottom: 0,
        backgroundColor: '#6200ee',
    },
});

export default MyReportsScreen;