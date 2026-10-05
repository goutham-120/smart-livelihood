/* api.js: Unified Axios client and complete API helper suite for SIH26097 PM-AJAY */
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

export const login = async (identifier, password) => {
  const res = await apiInstance.post('/auth/login', { identifier, password });
  return res.data;
};

export const demoLogin = async (role = 'beneficiary', district = 'Warangal') => {
  const res = await apiInstance.post('/auth/demo-login', { role, district });
  return res.data;
};

export const getMe = async () => {
  const res = await apiInstance.get('/auth/me');
  return res.data;
};

/* PROFILE */
export const getProfile = async (forUserId) => {
  const res = await apiInstance.get('/profile', forUserId ? { params: { forUserId } } : {});
  const data = res.data || {};
  if (!data.data) data.data = data;
  return data;
};

export const putProfile = async (dataPayload) => {
  const res = await apiInstance.put('/profile', dataPayload);
  const data = res.data || {};
  if (!data.data) data.data = data;
  return data;
};

export const updateProfile = putProfile;

/* ASSISTANT & MULTILINGUAL SPEECH */
export const postMessage = async (dataPayload) => {
  const res = await apiInstance.post('/assistant/message', dataPayload);
  return res.data;
};

export const sendVoiceMessage = async (text, lang = 'te', channel = 'web', conversationId = null, forUserId = null) => {
  const res = await apiInstance.post('/assistant/message', { text, lang, channel, conversationId, forUserId });
  return res.data;
};

export const getConversations = async (forUserId = null) => {
  const res = await apiInstance.get('/assistant/conversations', forUserId ? { params: { forUserId } } : {});
  return res.data;
};

export const getConversation = async (id, forUserId = null) => {
  const res = await apiInstance.get(`/assistant/conversations/${id}`, forUserId ? { params: { forUserId } } : {});
  return res.data;
};

export const createConversation = async (lang = 'te', forUserId = null) => {
  const res = await apiInstance.post('/assistant/conversations', { lang, forUserId });
  return res.data;
};

export const confirmProfileInsight = async (dataPayload) => {
  const res = await apiInstance.post('/assistant/confirm-insight', dataPayload);
  return res.data;
};

export const speechToText = async ({ audioBase64, mimeType = 'audio/webm', transcript = '', language = 'auto' }) => {
  const res = await apiInstance.post('/assistant/speech-to-text', {
    audio: audioBase64,
    mimeType,
    transcript,
    language
  });
  return res.data;
};

export const chatAssistant = async ({ message, language, channel = 'web', phone, forUserId }) => {
  const res = await apiInstance.post('/assistant/chat', {
    message,
    language,
    channel,
    phone,
    forUserId
  });
  return res.data;
};

export const textToSpeech = async ({ text, language, speaker = 'meera' }) => {
  const res = await apiInstance.post('/assistant/text-to-speech', {
    text,
    language,
    speaker
  });
  return res.data;
};

export const getSupportedLanguages = async () => {
  const res = await apiInstance.get('/assistant/languages');
  return res.data;
};

/* OPPORTUNITIES */
export const getOpportunities = async () => {
  const res = await apiInstance.get('/opportunities');
  const data = res.data || {};
  if (!data.data) data.data = data;
  return data;
};

export const getSelfEmployment = async (occupationKey) => {
  const res = await apiInstance.get(`/self-employment/${occupationKey}`);
  const data = res.data || {};
  if (!data.data) data.data = data;
  return data;
};

/* PRIVACY */
export const postConsent = (dataPayload) => apiInstance.post('/consent', dataPayload);
export const getPrivacyExport = () => apiInstance.get('/privacy/export');
export const deletePrivacyMe = () => apiInstance.delete('/privacy/me');

/* PLACEMENTS */
export const getPlacements = (params) => apiInstance.get('/placements', { params });
export const postPlacement = (dataPayload) => apiInstance.post('/placements', dataPayload);
export const patchPlacement = (id, dataPayload) => apiInstance.patch(`/placements/${id}`, dataPayload);

/* JOBS */
export const getJobs = (params) => apiInstance.get('/jobs', { params });
export const getJobCandidates = (id) => apiInstance.get(`/jobs/${id}/candidates`);

/* TASKS */
export const getTasks = (params) => apiInstance.get('/tasks', { params });
export const postTask = (dataPayload) => apiInstance.post('/tasks', dataPayload);
export const patchTask = (id, dataPayload) => apiInstance.patch(`/tasks/${id}`, dataPayload);
export const deleteTask = (id) => apiInstance.delete(`/tasks/${id}`);
export const postTaskComment = (taskId, text) => apiInstance.post(`/tasks/${taskId}/comments`, { text });
export const patchTaskComment = (taskId, commentId, text) => apiInstance.patch(`/tasks/${taskId}/comments/${commentId}`, { text });
export const deleteTaskComment = (taskId, commentId) => apiInstance.delete(`/tasks/${taskId}/comments/${commentId}`);

/* ANALYTICS */
export const getAnalyticsOverview = async (district) => {
  const res = await apiInstance.get('/analytics/overview', district ? { params: { district } } : {});
  const data = res.data || {};
  if (!data.data) data.data = data;
  return data;
};

export const getOfficerAnalytics = getAnalyticsOverview;

/* OFFICER */
export const getOfficerBeneficiaries = (params) => apiInstance.get('/officer/beneficiaries', { params });
export const postOfficerBeneficiary = (dataPayload) => apiInstance.post('/officer/beneficiaries', dataPayload);

/* ADMIN */
export const postAdminOfficer = (dataPayload) => apiInstance.post('/admin/officers', dataPayload);
export const getAdminUsers = (params) => apiInstance.get('/admin/users', { params });

/* PLANS */
export const postGeneratePlan = (dataPayload) => apiInstance.post('/plans/generate', dataPayload);
export const getPlans = (params) => apiInstance.get('/plans', { params });

/* DIRECTORY */
export const getDirectoryCenters = (params) => apiInstance.get('/directory/centers', { params });
export const getDirectoryCounselors = (params) => apiInstance.get('/directory/counselors', { params });
export const getDirectorySchemes = (params) => apiInstance.get('/directory/schemes', { params });

export const getSelectedOccupation = () => {
  try {
    return localStorage.getItem('pmajay_selected_occ');
  } catch {}
  return null;
};

export const setSelectedOccupation = (occKey) => {
  if (!occKey) return;
  try {
    localStorage.setItem('pmajay_selected_occ', occKey);
    window.dispatchEvent(new CustomEvent('pmajay_occ_changed', { detail: occKey }));
  } catch {}
  try {
    apiInstance.post('/pathway/progress', { targetOccupation: occKey }).catch(() => {});
  } catch {}
};

/* PATHWAY */
export const getSkillGaps = async (occKey) => {
  const effectiveKey = occKey || getSelectedOccupation() || 'default';
  const res = await apiInstance.get(`/pathway/skill-gaps/${effectiveKey}`);
  return res.data;
};

export const getTraining = async (occKey) => {
  const effectiveKey = occKey || getSelectedOccupation() || 'default';
  const res = await apiInstance.get(`/pathway/training/${effectiveKey}`);
  return res.data;
};

export const getRoadmap = async (occKey) => {
  const effectiveKey = occKey || getSelectedOccupation() || 'default';
  const res = await apiInstance.get(`/pathway/roadmap/${effectiveKey}`);
  return res.data;
};

export const getProgress = async () => {
  const res = await apiInstance.get('/pathway/progress');
  return res.data;
};

export const runWhatIf = async (arg1, district) => {
  const payload = typeof arg1 === 'object' && !Array.isArray(arg1) ? arg1 : { skills: arg1, district };
  const res = await apiInstance.post('/pathway/what-if', payload);
  return res.data;
};

/* ENROLLMENTS */
export const getEnrollments = async (params) => {
  const res = await apiInstance.get('/enrollments', { params });
  return res.data;
};

export const createEnrollment = async (dataPayload) => {
  const res = await apiInstance.post('/enrollments', dataPayload);
  return res.data;
};

export const getMyEnrollments = async () => {
  const res = await apiInstance.get('/enrollments/my');
  return res.data;
};

export const getEnrollment = async (id) => {
  const res = await apiInstance.get(`/enrollments/${id}`);
  return res.data;
};

export const submitEnrollmentAction = async (id, dataPayload) => {
  const res = await apiInstance.patch(`/enrollments/${id}/action`, dataPayload);
  return res.data;
};

export const updateEnrollmentStatus = async (id, dataPayload) => {
  const res = await apiInstance.patch(`/enrollments/${id}/status`, dataPayload);
  return res.data;
};

/* Attach all helper methods onto apiInstance for object-style invocation compatibility */
apiInstance.getProfile = getProfile;
apiInstance.putProfile = putProfile;
apiInstance.updateProfile = updateProfile;
apiInstance.getOpportunities = getOpportunities;
apiInstance.getSelfEmployment = getSelfEmployment;
apiInstance.sendVoiceMessage = sendVoiceMessage;
apiInstance.speechToText = speechToText;
apiInstance.chatAssistant = chatAssistant;
apiInstance.textToSpeech = textToSpeech;
apiInstance.getSupportedLanguages = getSupportedLanguages;
apiInstance.postMessage = postMessage;
apiInstance.getOfficerAnalytics = getOfficerAnalytics;
apiInstance.getAnalyticsOverview = getAnalyticsOverview;
apiInstance.getSkillGaps = getSkillGaps;
apiInstance.getTraining = getTraining;
apiInstance.getRoadmap = getRoadmap;
apiInstance.getProgress = getProgress;
apiInstance.getSelectedOccupation = getSelectedOccupation;
apiInstance.setSelectedOccupation = setSelectedOccupation;
apiInstance.runWhatIf = runWhatIf;
apiInstance.login = login;
apiInstance.demoLogin = demoLogin;
apiInstance.getMe = getMe;
apiInstance.authMe = authMe;
apiInstance.authLogin = authLogin;
apiInstance.authRegister = authRegister;
apiInstance.authOtpSend = authOtpSend;
apiInstance.authOtpVerify = authOtpVerify;
apiInstance.authDemoLogin = authDemoLogin;
apiInstance.postConsent = postConsent;
apiInstance.getPrivacyExport = getPrivacyExport;
apiInstance.deletePrivacyMe = deletePrivacyMe;
apiInstance.getPlacements = getPlacements;
apiInstance.postPlacement = postPlacement;
apiInstance.patchPlacement = patchPlacement;
apiInstance.getJobs = getJobs;
apiInstance.getJobCandidates = getJobCandidates;
apiInstance.getTasks = getTasks;
apiInstance.postTask = postTask;
apiInstance.patchTask = patchTask;
apiInstance.deleteTask = deleteTask;
apiInstance.postTaskComment = postTaskComment;
apiInstance.patchTaskComment = patchTaskComment;
apiInstance.deleteTaskComment = deleteTaskComment;
apiInstance.getOfficerBeneficiaries = getOfficerBeneficiaries;
apiInstance.postOfficerBeneficiary = postOfficerBeneficiary;
apiInstance.postAdminOfficer = postAdminOfficer;
apiInstance.getAdminUsers = getAdminUsers;
apiInstance.postGeneratePlan = postGeneratePlan;
apiInstance.getPlans = getPlans;
apiInstance.getDirectoryCenters = getDirectoryCenters;
apiInstance.getDirectoryCounselors = getDirectoryCounselors;
apiInstance.getDirectorySchemes = getDirectorySchemes;
apiInstance.createEnrollment = createEnrollment;
apiInstance.getMyEnrollments = getMyEnrollments;
apiInstance.getEnrollment = getEnrollment;
apiInstance.submitEnrollmentAction = submitEnrollmentAction;
apiInstance.updateEnrollmentStatus = updateEnrollmentStatus;

export const api = apiInstance;
export default apiInstance;

