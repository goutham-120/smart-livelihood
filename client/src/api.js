/* api.js: Axios client and API helpers for SIH26097 PM-AJAY */
import axios from 'axios';

const BASE_URL = '/api';

const apiInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

/* Attach JWT from localStorage on every request */
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmajay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* On 401, clear token and redirect to login */
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pmajay_token');
      localStorage.removeItem('pmajay_user');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* AUTH */
export const authLogin = (data) => apiInstance.post('/auth/login', data);
export const authRegister = (data) => apiInstance.post('/auth/register', data);
export const authOtpSend = (phone) => apiInstance.post('/auth/otp/send', { phone });
export const authOtpVerify = (data) => apiInstance.post('/auth/otp/verify', data);
export const authDemoLogin = (role, district) => apiInstance.post('/auth/demo-login', { role, district });
export const authMe = () => apiInstance.get('/auth/me');

/* PROFILE */
export const getProfile = (forUserId) =>
  apiInstance.get('/profile', forUserId ? { params: { forUserId } } : {});
export const putProfile = (data) => apiInstance.put('/profile', data);

/* ASSISTANT */
export const postMessage = (data) => apiInstance.post('/assistant/message', data);

/* OPPORTUNITIES */
export const getOpportunities = () => apiInstance.get('/opportunities');
export const getSelfEmployment = (occupationKey) =>
  apiInstance.get(`/self-employment/${occupationKey}`);

/* PRIVACY */
export const postConsent = (data) => apiInstance.post('/consent', data);
export const getPrivacyExport = () => apiInstance.get('/privacy/export');
export const deletePrivacyMe = () => apiInstance.delete('/privacy/me');

/* PLACEMENTS */
export const getPlacements = (params) => apiInstance.get('/placements', { params });
export const postPlacement = (data) => apiInstance.post('/placements', data);
export const patchPlacement = (id, data) => apiInstance.patch(`/placements/${id}`, data);

/* JOBS */
export const getJobs = (params) => apiInstance.get('/jobs', { params });
export const getJobCandidates = (id) => apiInstance.get(`/jobs/${id}/candidates`);

/* TASKS */
export const getTasks = (params) => apiInstance.get('/tasks', { params });
export const postTask = (data) => apiInstance.post('/tasks', data);
export const patchTask = (id, data) => apiInstance.patch(`/tasks/${id}`, data);

/* ANALYTICS */
export const getAnalyticsOverview = (district) =>
  apiInstance.get('/analytics/overview', district ? { params: { district } } : {});

/* OFFICER */
export const getOfficerBeneficiaries = (params) =>
  apiInstance.get('/officer/beneficiaries', { params });
export const postOfficerBeneficiary = (data) =>
  apiInstance.post('/officer/beneficiaries', data);

/* ADMIN */
export const postAdminOfficer = (data) => apiInstance.post('/admin/officers', data);
export const getAdminUsers = (params) => apiInstance.get('/admin/users', { params });

/* PLANS */
export const postGeneratePlan = (data) => apiInstance.post('/plans/generate', data);
export const getPlans = (params) => apiInstance.get('/plans', { params });

/* DIRECTORY */
export const getDirectoryCenters = (params) =>
  apiInstance.get('/directory/centers', { params });
export const getDirectoryCounselors = (params) =>
  apiInstance.get('/directory/counselors', { params });
export const getDirectorySchemes = (params) =>
  apiInstance.get('/directory/schemes', { params });

/* Backward-compatible and helper methods on api */
apiInstance.login = async (identifier, password) => {
  const res = await apiInstance.post('/auth/login', { identifier, password });
  return res.data;
};

apiInstance.demoLogin = async (role = 'beneficiary', district = 'Warangal') => {
  const res = await apiInstance.post('/auth/demo-login', { role, district });
  return res.data;
};

apiInstance.getMe = async () => {
  const res = await apiInstance.get('/auth/me');
  return res.data;
};

apiInstance.sendVoiceMessage = async (text, lang = 'te', channel = 'web') => {
  const res = await apiInstance.post('/assistant/message', { text, lang, channel });
  return res.data;
};

apiInstance.updateProfile = async (data) => {
  const res = await apiInstance.put('/profile', data);
  return res.data;
};

apiInstance.getSkillGaps = async (occKey) => {
  const res = await apiInstance.get(`/pathway/skill-gaps/${occKey}`);
  return res.data;
};

apiInstance.getTraining = async (occKey) => {
  const res = await apiInstance.get(`/pathway/training/${occKey}`);
  return res.data;
};

apiInstance.getRoadmap = async (occKey) => {
  const res = await apiInstance.get(`/pathway/roadmap/${occKey}`);
  return res.data;
};

apiInstance.getProgress = async () => {
  const res = await apiInstance.get('/pathway/progress');
  return res.data;
};

apiInstance.runWhatIf = async (arg1, district) => {
  const payload = typeof arg1 === 'object' && !Array.isArray(arg1) ? arg1 : { skills: arg1, district };
  const res = await apiInstance.post('/pathway/what-if', payload);
  return res.data;
};

apiInstance.getOpportunities = async () => {
  const res = await apiInstance.get('/opportunities');
  return res.data;
};

apiInstance.getSelfEmployment = async (occupationKey) => {
  const res = await apiInstance.get(`/self-employment/${occupationKey}`);
  return res.data;
};

apiInstance.getOfficerAnalytics = async (district) => {
  const res = await apiInstance.get('/analytics/overview', district ? { params: { district } } : {});
  return res.data;
};

export const api = apiInstance;
export default apiInstance;
