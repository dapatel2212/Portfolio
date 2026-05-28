import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const changePassword = (data) => api.post('/auth/change-password', data);

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const uploadPhoto = (formData) => api.post('/profile/photo', formData);
export const getProfileStats = () => api.get('/profile/stats');
export const getPublicProfile = (slug) => api.get(`/profile/public/${slug}`);

// ─── Certificates ─────────────────────────────────────────────────────────────
export const getCertificates = () => api.get('/certificates');
export const uploadCertificate = (formData) => api.post('/certificates', formData);
export const updateCertificate = (id, data) => api.put(`/certificates/${id}`, data);
export const deleteCertificate = (id) => api.delete(`/certificates/${id}`);

// ─── Projects ─────────────────────────────────────────────────────────────────
export const getProjects = () => api.get('/projects');
export const createProject = (formData) => api.post('/projects', formData);
export const updateProject = (id, formData) => api.put(`/projects/${id}`, formData);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// ─── Contact ──────────────────────────────────────────────────────────────────
export const sendContactMessage = (slug, data) => api.post(`/contact/${slug}`, data);
export const getInbox = () => api.get('/contact/inbox');
export const markMessageRead = (id) => api.patch(`/contact/inbox/${id}/read`);

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const toggleUserStatus = (id, is_active) => api.patch(`/admin/users/${id}/status`, { is_active });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminCertificates = (params) => api.get('/admin/certificates', { params });
export const verifyCertificate = (id, is_verified) => api.patch(`/admin/certificates/${id}/verify`, { is_verified });

export default api;
