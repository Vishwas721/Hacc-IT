// File: client-mobile/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserFromStorage = async () => {
            const storedToken = await SecureStore.getItemAsync('token');
            if (storedToken) {
                try {
                    // Verify the token with the backend's /profile endpoint
                    const response = await axios.get(`${API_URL}/api/auth/profile`, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });
                    // If successful, we have a valid session
                    setUser(response.data);
                    setToken(storedToken);
                } catch (error) {
                    // Token is invalid or expired, clear it
                    await SecureStore.deleteItemAsync('token');
                }
            }
            setLoading(false);
        };
        loadUserFromStorage();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, { username, password });
            const { token, user: loggedInUser } = response.data;
            await SecureStore.setItemAsync('token', token);
            setToken(token);
            setUser(loggedInUser);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.error || 'Invalid credentials' };
        }
    };

    const register = async (username, password) => {
        try {
            await axios.post(`${API_URL}/api/auth/register`, { username, password, role: 'citizen' });
            return await login(username, password);
        } catch (error) {
            return { success: false, message: error.response?.data?.error || 'Registration failed' };
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);