import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleRegister = async () => {
        setLoading(true);
        const result = await register(username, password);
        if (!result.success) {
            Alert.alert('Registration Failed', result.message);
        }
        // On success, the AuthContext will handle the login and navigation
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
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
                onPress={handleRegister}
                style={styles.button}
                loading={loading}
                disabled={loading}
            >
                Register
            </Button>
             <Button onPress={() => navigation.navigate('Login')} disabled={loading}>
                Already have an account? Login
            </Button>
        </View>
    );
};
// Use the same styles as LoginScreen
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 8 },
});

export default RegisterScreen;