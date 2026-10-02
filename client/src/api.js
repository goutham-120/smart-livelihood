/* api.js: Axios client and API helpers for SIH26097 PM-AJAY */
import axios from 'axios';

const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

/* Attach JWT from localStorage on every request */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmajay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* On 401, clear token and redirect to login */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pmajay_token');
      localStorage.removeItem('pmajay_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* AUTH */
export const authLogin = (data) => api.post('/auth/login', data);
export const authRegister = (data) => api.post('/auth/register', data);
export const authOtpSend = (phone) => api.post('/auth/otp/send', { phone });
export const authOtpVerify = (data) => api.post('/auth/otp/verify', data);
export const authDemoLogin = (role, district) => api.post('/auth/demo-login', { role, district });
export const authMe = () => api.get('/auth/me');

/* PROFILE */
export const getProfile = (forUserId) =>
  api.get('/profile', forUserId ? { params: { forUserId } } : {});
export const putProfile = (data) => api.put('/profile', data);

/* ASSISTANT */
export const postMessage = (data) => api.post('/assistant/message', data);

/* OPPORTUNITIES */
export const getOpportunities = () => api.get('/opportunities');
export const getSelfEmployment = (occupationKey) =>
  api.get(`/self-employment/${occupationKey}`);

/* PRIVACY */
export const postConsent = (data) => api.post('/consent', data);
export const getPrivacyExport = () => api.get('/privacy/export');
export const deletePrivacyMe = () => api.delete('/privacy/me');

/* PLACEMENTS */
export const getPlacements = (params) => api.get('/placements', { params });
export const postPlacement = (data) => api.post('/placements', data);
export const patchPlacement = (id, data) => api.patch(`/placements/${id}`, data);

/* JOBS */
export const getJobs = (params) => api.get('/jobs', { params });
export const getJobCandidates = (id) => api.get(`/jobs/${id}/candidates`);

/* TASKS */
export const getTasks = (params) => api.get('/tasks', { params });
export const postTask = (data) => api.post('/tasks', data);
export const patchTask = (id, data) => api.patch(`/tasks/${id}`, data);

/* ANALYTICS */
export const getAnalyticsOverview = (district) =>
  api.get('/analytics/overview', district ? { params: { district } } : {});

/* OFFICER */
export const getOfficerBeneficiaries = (params) =>
  api.get('/officer/beneficiaries', { params });
export const postOfficerBeneficiary = (data) =>
  api.post('/officer/beneficiaries', data);

/* ADMIN */
export const postAdminOfficer = (data) => api.post('/admin/officers', data);
export const getAdminUsers = (params) => api.get('/admin/users', { params });

/* PLANS */
export const postGeneratePlan = (data) => api.post('/plans/generate', data);
export const getPlans = (params) => api.get('/plans', { params });

/* DIRECTORY */
export const getDirectoryCenters = (params) =>
  api.get('/directory/centers', { params });
export const getDirectoryCounselors = (params) =>
  api.get('/directory/counselors', { params });
export const getDirectorySchemes = (params) =>
  api.get('/directory/schemes', { params });

export default api;
