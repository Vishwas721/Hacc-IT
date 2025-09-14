// File: src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/api'; // Import our configured Axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add a loading state
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // **REAL API CALL** to verify the token
                    const response = await api.get('/auth/profile');
                    setUser(response.data);
                } catch (error) {
                    // Token is invalid or expired
                    console.error("Session check failed", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false); // Finished checking
        };
        checkLoggedIn();
    }, []);

    const login = async (username, password) => {
        try {
            // **REAL API CALL** to the login endpoint
            const response = await api.post('/auth/login', { username, password });
            const { user, token } = response.data;

            // Save to localStorage and state
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            setUser(user);

            toast.success('Login Successful! Welcome back.');
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.error || 'Login failed!';
            toast.error(message);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const value = { user, login, logout, loading };

    // Render a loading screen while we check for a valid session
    if (loading) {
        return <div>Loading Application...</div>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};