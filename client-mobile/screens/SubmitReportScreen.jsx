import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Alert, ScrollView } from 'react-native';
import { Text, Button, Card, TextInput, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

const THEME_COLOR = '#6200ee';

export default function SubmitReportScreen({ navigation }) {
    const [photo, setPhoto] = useState(null);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
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
            Alert.alert('Permission Denied', 'Camera access is required.');
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

            try {
                let geocodedResults = await Location.reverseGeocodeAsync({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                });

                // --- THIS IS THE FINAL, ROBUST ADDRESS FORMATTING ---
                if (geocodedResults && geocodedResults.length > 0) {
                    const firstAddress = geocodedResults[0];
                    // Build the address by prioritizing the most useful fields
                    const addressParts = [
                        firstAddress.street,
                        firstAddress.district,
                        firstAddress.city,
                        firstAddress.postalCode,
                    ];
                    // Filter out any null or undefined parts and join them
                    const formattedAddress = addressParts.filter(part => part).join(', ');
                    setAddress(formattedAddress);
                } else {
                    setAddress('Address not found');
                }
                // --- END OF FIX ---

            } catch (error) {
                console.error("Reverse geocoding failed", error);
                setAddress('Could not determine address');
            }
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
            navigation.navigate('MyReports');

        } catch (error) {
            console.error(error.response ? error.response.data : error.message);
            Alert.alert('❌ Submission Failed', 'An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.card}>
                <Card.Title 
                    title="Submit New Report"
                    subtitle="Your contribution helps build a better city."
                    titleStyle={{ textAlign: 'center' }}
                    subtitleStyle={{ textAlign: 'center' }}
                />
                <Card.Content>
                    {photo ? (
                        <View>
                            <Image source={{ uri: photo.uri }} style={styles.image} />
                            {address ? (
                                <View style={styles.addressContainer}>
                                    <Text style={styles.addressText}>📍 {address}</Text>
                                </View>
                            ) : null}
                        </View>
                    ) : (
                        <View style={styles.placeholder}>
                            <Text style={styles.placeholderText}>Step 1: Take a Photo</Text>
                        </View>
                    )}
                    <Button 
                        icon="camera"
                        mode="contained" 
                        onPress={takePictureAndGetLocation} 
                        style={styles.button}
                    >
                        Take Photo & Get Location
                    </Button>
                    <TextInput
                        label="Step 2: Describe the issue..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        mode="outlined"
                        style={styles.input}
                    />
                </Card.Content>
                 <Card.Actions style={styles.actions}>
                    {isSubmitting ? (
                        <ActivityIndicator animating={true} size="large" color={THEME_COLOR} />
                    ) : (
                        <Button 
                            mode="contained" 
                            onPress={handleSubmit}
                            style={styles.submitButton}
                            labelStyle={{ color: '#fff' }}
                        >
                            Step 3: Submit Report
                        </Button>
                    )}
                </Card.Actions>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flexGrow: 1, 
        justifyContent: 'center', 
        padding: 10, 
        backgroundColor: '#f5f5f5' 
    },
    card: { 
        margin: 5, 
        borderRadius: 12 
    },
    placeholder: { 
        height: 250, 
        backgroundColor: '#e9ecef', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 15, 
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#dee2e6',
        borderStyle: 'dashed',
    },
    placeholderText: { 
        color: '#6c757d' 
    },
    image: { 
        height: 250, 
        borderRadius: 10 
    },
    addressContainer: { 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        paddingVertical: 6, 
        paddingHorizontal: 10, 
        borderRadius: 6, 
        position: 'absolute', 
        bottom: 10, 
        left: 10, 
        right: 10 
    },
    addressText: { 
        color: '#fff', 
        textAlign: 'center', 
        fontSize: 12 
    },
    button: { 
        marginTop: 15, 
        marginBottom: 15, 
        paddingVertical: 5, 
        backgroundColor: THEME_COLOR 
    },
    input: { 
        marginBottom: 15 
    },
    actions: { 
        padding: 16, 
        justifyContent: 'center' 
    },
    submitButton: { 
        flex: 1, 
        paddingVertical: 8, 
        backgroundColor: THEME_COLOR 
    }
});