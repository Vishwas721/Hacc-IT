import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    // If a token exists, try to fetch the user profile
    if (token) {
      // In a real app, you'd have a /profile or /me endpoint
      // For the hackathon, we'll decode the token or just store user data in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      // MOCK API CALL - Replace with real call later
      // const response = await api.post('/auth/login', { username, password });
      // const { user, token } = response.data;
      
      // For now, we will mock the response for the demo
      if (username === 'admin' && password === 'password') {
        const mockUser = { id: 1, username: 'admin', role: 'super-admin' };
        const mockToken = 'mock-jwt-token-for-hackathon';

        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', mockToken);
        setUser(mockUser);
        setToken(mockToken);
        toast.success('Login Successful! Welcome back.');
        navigate('/dashboard'); // Redirect to dashboard on successful login
        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed!');
      // Clear any leftover junk
      logout();
      return { success: false, message: error.message || 'Login failed!' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const value = { user, token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context easily
export const useAuth = () => {
  return useContext(AuthContext);
};