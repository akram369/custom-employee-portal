import axios from 'axios';
import { authUtil } from '../utils/auth';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT Bearer Token into requests
api.interceptors.request.use(
  (config) => {
    const token = authUtil.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle authentication failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      authUtil.clearSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session_expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  getDemoAccounts: async () => {
    const res = await api.get('/auth/demo-accounts');
    return res.data;
  }
};

// Zoho integration endpoints
export const zohoAPI = {
  getAuthorizedApps: async () => {
    const res = await api.get('/zoho/apps');
    return res.data;
  },
  getAppData: async (appId) => {
    const res = await api.get(`/zoho/app/${appId}/data`);
    return res.data;
  },
  launchApp: async (appId) => {
    const res = await api.post(`/zoho/app/${appId}/launch`);
    return res.data;
  },
  getStatus: async () => {
    const res = await api.get('/zoho/status');
    return res.data;
  }
};

// Admin endpoints
export const adminAPI = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  createUser: async (userData) => {
    const res = await api.post('/admin/users', userData);
    return res.data;
  },
  updateUser: async (id, userData) => {
    const res = await api.put(`/admin/users/${id}`, userData);
    return res.data;
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
  getRoles: async () => {
    const res = await api.get('/admin/roles');
    return res.data;
  },
  updateRolePermissions: async (roleId, permissionIds) => {
    const res = await api.put(`/admin/roles/${roleId}/permissions`, { permissionIds });
    return res.data;
  },
  getAuditLogs: async (params = {}) => {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  }
};

export default api;
