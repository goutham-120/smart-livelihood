const getAuthHeaders = () => {
  const token = localStorage.getItem('pmajay_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (identifier, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    return res.json();
  },

  demoLogin: async (role = 'beneficiary', district = 'Warangal') => {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, district })
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
    return res.json();
  },

  // Assistant
  sendVoiceMessage: async (text, lang = 'te', channel = 'web') => {
    const res = await fetch('/api/assistant/message', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text, lang, channel })
    });
    return res.json();
  },

  // Profile
  getProfile: async () => {
    const res = await fetch('/api/profile', { headers: getAuthHeaders() });
    return res.json();
  },

  updateProfile: async (data) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Opportunities
  getOpportunities: async () => {
    const res = await fetch('/api/opportunities', { headers: getAuthHeaders() });
    return res.json();
  },

  getSelfEmployment: async (occKey) => {
    const res = await fetch(`/api/self-employment/${occKey}`, { headers: getAuthHeaders() });
    return res.json();
  },

  // Pathway
  getSkillGaps: async (occKey) => {
    const res = await fetch(`/api/pathway/skill-gaps/${occKey}`, { headers: getAuthHeaders() });
    return res.json();
  },

  getTraining: async (occKey) => {
    const res = await fetch(`/api/pathway/training/${occKey}`);
    return res.json();
  },

  getRoadmap: async (occKey) => {
    const res = await fetch(`/api/pathway/roadmap/${occKey}`, { headers: getAuthHeaders() });
    return res.json();
  },

  getProgress: async () => {
    const res = await fetch('/api/pathway/progress', { headers: getAuthHeaders() });
    return res.json();
  },

  runWhatIf: async (skills, district) => {
    const res = await fetch('/api/pathway/what-if', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skills, district })
    });
    return res.json();
  },

  // Officer Analytics
  getOfficerAnalytics: async (district) => {
    const url = district ? `/api/analytics/overview?district=${encodeURIComponent(district)}` : '/api/analytics/overview';
    const res = await fetch(url, { headers: getAuthHeaders() });
    return res.json();
  }
};
