import axios from 'axios';

// Determine API base URL:
// - In production (Vercel): uses VITE_API_URL env var set in Vercel Dashboard
// - In local dev: Vite proxy forwards /api -> localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('synapse_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Improve error messages for common cases
    if (!error.response) {
      // Network error — server unreachable
      error.message = `Cannot reach the Synapse server. Make sure VITE_API_URL is set correctly in your Vercel environment variables. (${API_BASE})`;
    } else if (error.response.status === 404) {
      error.message = `API route not found (404). Check that your Render server is running and the Root Directory is set to synapse-enterprise-ai/server.`;
    } else if (error.response.status === 401) {
      const isAuthRoute = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthRoute) {
        localStorage.removeItem('synapse_token');
        localStorage.removeItem('synapse_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
