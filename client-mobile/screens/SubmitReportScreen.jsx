// File: client-mobile/screens/SubmitReportScreen.jsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

export default function SubmitReportScreen({ navigation }) {
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [hasLocationPermission, setHasLocationPermission] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [location, setLocation] = useState(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        (async () => {
            await ImagePicker.requestCameraPermissionsAsync();
            await Location.requestForegroundPermissionsAsync();
        })();
    }, []);

    const takePictureAndGetLocation = async () => {
        const { status: cameraStatus } = await ImagePicker.getCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
            Alert.alert('Permission Denied', 'Camera access is required to submit a report.');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0]);
            const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
            if (locationStatus !== 'granted') {
                Alert.alert('Permission Denied', 'Location access is required.');
                return;
            }
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            Alert.alert('Location Captured!', `Lat: ${loc.coords.latitude.toFixed(4)}, Lon: ${loc.coords.longitude.toFixed(4)}`);
        }
    };

    const handleSubmit = async () => {
        if (!photo || !location || !description) {
            Alert.alert('Error', 'Please take a photo, capture location, and enter a description.');
            return;
        }
        setIsSubmitting(true);

        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                Alert.alert('Authentication Error', 'You are not logged in.');
                setIsSubmitting(false);
                return;
            }
            
            const formData = new FormData();
            const uriParts = photo.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];

            formData.append('image', {
                uri: photo.uri,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            });

            formData.append('description', description);
            formData.append('latitude', location.coords.latitude);
            formData.append('longitude', location.coords.longitude);

            await axios.post(`${API_URL}/api/reports`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });

            Alert.alert('✅ Success!', 'Your report has been submitted.');
            // Go back to the list screen after a successful submission
            navigation.navigate('MyReports');

        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
            Alert.alert('❌ Submission Failed', 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📌 Submit a Civic Report</Text>

            {photo ? (
                <Image source={{ uri: photo.uri }} style={styles.image} />
            ) : (
                <View style={styles.placeholder}><Text>No photo taken</Text></View>
            )}

            <Button title="Take Photo & Get Location" onPress={takePictureAndGetLocation} />

            <TextInput
                style={styles.input}
                placeholder="Describe the issue..."
                value={description}
                onChangeText={setDescription}
                multiline
            />

            {isSubmitting ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : (
                <Button title="Submit Report" onPress={handleSubmit} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    placeholder: { width: 200, height: 200, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderRadius: 10 },
    image: { width: 200, height: 200, marginBottom: 20, borderRadius: 10 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, width: '100%', marginTop: 20, marginBottom: 20, borderRadius: 5, minHeight: 80, textAlignVertical: 'top' },
});