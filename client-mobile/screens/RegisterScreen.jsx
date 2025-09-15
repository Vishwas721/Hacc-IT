import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();

    const handleRegister = async () => {
        const result = await register(username, password);
        if (!result.success) {
            Alert.alert('Registration Failed', result.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Register" onPress={handleRegister} />
        </View>
    );
};

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
export default RegisterScreen;