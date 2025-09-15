import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import axios from 'axios';

// -----------------------------------------------------------------
// Replace with your computer’s local IP (check ipconfig if needed)
const API_URL = 'http://192.168.207.38:5000';
// -----------------------------------------------------------------

export default function SubmitReportScreen({ navigation }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ask for permissions
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');

      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.status === 'granted');
    })();
  }, []);

  // Take picture and get location
  const takePicture = async () => {
    if (!hasCameraPermission) {
      Alert.alert('Permission Denied', 'Cannot access camera without permission.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);

      if (hasLocationPermission) {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        Alert.alert('Location Captured!', `Lat: ${loc.coords.latitude}, Lon: ${loc.coords.longitude}`);
      } else {
        Alert.alert('Permission Denied', 'Cannot get location without permission.');
      }
    }
  };

  // Submit report
  const handleSubmit = async () => {
    if (!photo || !location || !description) {
      Alert.alert('Error', 'Please take a photo, add a description, and allow location.');
      return;
    }

    setIsSubmitting(true);

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

    try {
      const response = await axios.post(`${API_URL}/api/reports`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('✅ Success!', 'Your report has been submitted.');
      // Reset form
      setPhoto(null);
      setLocation(null);
      setDescription('');

    } catch (error) {
      console.error(error.response ? error.response.data : error.message);
      Alert.alert('❌ Submission Failed', 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasCameraPermission === null || hasLocationPermission === null) {
    return <View />;
  }

  if (hasCameraPermission === false) {
    return <Text>No access to camera. Please enable it in your settings.</Text>;
  }

  if (hasLocationPermission === false) {
    return <Text>No access to location. Please enable it in your settings.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📌 Submit a Civic Report</Text>

      {photo ? (
        <Image source={{ uri: photo.uri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text>No photo taken</Text>
        </View>
      )}

      <Button title="Take Photo & Get Location" onPress={takePicture} />

      <TextInput
        style={styles.input}
        placeholder="Describe the issue..."
        value={description}
        onChangeText={setDescription}
      />

      <Button
        title={isSubmitting ? "Submitting..." : "Submit Report"}
        onPress={handleSubmit}
        disabled={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  placeholder: {
    width: 200,
    height: 200,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 5,
  },
});
