// File: client-mobile/screens/MyReportsScreen.jsx
import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Button } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const MyReportsScreen = ({ navigation }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { logout } = useAuth(); // Get the logout function from our context

    // This hook adds the button to the header
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button onPress={logout} title="Logout" color="#ff453a" />
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
                setError("Authentication token not found.");
                logout(); // If token is missing, force logout
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchReports();
        });
        return unsubscribe;
    }, [navigation, fetchReports]);


    const EmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reports found.</Text>
            <Text style={styles.emptySubText}>Pull down to refresh or submit a new report.</Text>
        </View>
    );

    if (error && !loading) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.fullScreen}>
            <FlatList
                data={reports}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('ReportDetails', { reportId: item.id })}>
                        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                        <Text style={styles.itemStatus}>Status: {item.status}</Text>
                    </TouchableOpacity>
                )}
                ListHeaderComponent={<Text style={styles.title}>My Submitted Reports</Text>}
                ListEmptyComponent={!loading ? <EmptyListComponent /> : null}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchReports} />}
            />
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('SubmitReport')}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: { flex: 1 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', padding: 16, backgroundColor: '#f7f7f7' },
    itemContainer: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
    itemDescription: { fontSize: 16, fontWeight: '500' },
    itemStatus: { fontSize: 14, color: 'gray', marginTop: 4 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
    emptyText: { fontSize: 18, fontWeight: 'bold' },
    emptySubText: { fontSize: 14, color: 'gray', marginTop: 8 },
    errorText: { fontSize: 16, color: 'red', textAlign: 'center', padding: 20 },
    fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 30, bottom: 30, backgroundColor: '#007bff', borderRadius: 30, elevation: 8 },
    fabIcon: { fontSize: 30, color: 'white' },
});

export default MyReportsScreen;