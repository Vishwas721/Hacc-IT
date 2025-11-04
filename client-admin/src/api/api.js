import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'https://nagarikone.onrender.com/api', // Production backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Your Request Interceptor (Looks Great!) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RECOMMENDED: Add a Response Interceptor ---
api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // Check if the error is a 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // 1. Remove the expired token
      localStorage.removeItem('token');
      
      // 2. (Optional) Remove other user data from storage
      // localStorage.removeItem('user');

      // 3. Redirect to the login page
      // Using window.location forces a page reload, clearing all state.
      window.location.href = '/login'; 
    }

    // For all other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default api;