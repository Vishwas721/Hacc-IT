import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Text, Button } from 'react-native-paper';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        <View style={styles.content}>
            <Text style={styles.title}>NagarikOne</Text>
            <Text style={styles.tagline}>The Bridge Between Citizens and Governance.</Text>
        </View>

        <View style={styles.buttonContainer}>
            <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Login')} // Or 'Register'
                style={styles.button}
                labelStyle={styles.buttonLabel}
            >
                 Login / Sign Up
            </Button>
            
            <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('PublicDashboard')}
                style={styles.button}
                labelStyle={styles.buttonLabel}
            >
                View Public Dashboard
            </Button>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f8ff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 52,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    tagline: {
        fontSize: 18,
        color: '#34495e',
        marginBottom: 50,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 30,
        paddingBottom: 40, 
    },
    button: {
        width: '100%',
        marginVertical: 8,
        borderRadius: 30,
    },
    buttonLabel: {
        paddingVertical: 10,
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default WelcomeScreen;