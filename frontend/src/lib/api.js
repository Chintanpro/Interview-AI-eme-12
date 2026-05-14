import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Interviews
export const interviewAPI = {
  start: (data) => api.post('/interviews/start', data),
  submitAnswer: (sessionId, data) => api.post(`/interviews/${sessionId}/answer`, data),
  nextQuestion: (sessionId) => api.post(`/interviews/${sessionId}/next-question`),
  complete: (sessionId) => api.post(`/interviews/${sessionId}/complete`),
  getSession: (sessionId) => api.get(`/interviews/${sessionId}`),
  list: (params) => api.get('/interviews', { params }),
};

// Company Prep
export const companyAPI = {
  generate: (data) => api.post('/company-prep', data),
};

// Resume
export const resumeAPI = {
  analyze: (formData) => api.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  history: () => api.get('/resume/history'),
};

// Salary
export const salaryAPI = {
  start: (data) => api.post('/salary/start', data),
  message: (sessionId, data) => api.post(`/salary/${sessionId}/message`, data),
};

// Dashboard
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
  progress: () => api.get('/dashboard/progress'),
};

// Plan
export const planAPI = {
  upgrade: (data) => api.post('/plan/upgrade', data),
};

// Payments (Stripe)
export const paymentsAPI = {
  createCheckout: (data) => api.post('/payments/create-checkout', data),
  getStatus: (sessionId) => api.get(`/payments/status/${sessionId}`),
};

export default api;
