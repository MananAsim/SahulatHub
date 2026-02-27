import axios from 'axios';

// Placeholder for the actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        // Normally you'd get the token from localStorage or cookies
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('sahulat_user') : null;
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user?.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (e) {
                // ignore
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
