import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        setLoading(true);
        const result = await login(username, password);
        if (!result.success) {
            Alert.alert('Login Failed', result.message);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back!</Text>
            <TextInput 
                label="Username" 
                value={username} 
                onChangeText={setUsername} 
                style={styles.input} 
                mode="outlined" 
            />
            <TextInput 
                label="Password" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                style={styles.input}
                mode="outlined" 
            />
            <Button 
                mode="contained" 
                onPress={handleLogin} 
                style={styles.button}
                loading={loading}
                disabled={loading}
            >
                Login
            </Button>
            <Button 
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
            >
                Don't have an account? Sign Up
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 8 },
});

export default LoginScreen;