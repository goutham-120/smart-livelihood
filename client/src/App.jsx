import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api.js';
import { QuickDemoBar, AppSidebar, AppHeader, Spinner, ErrorBoundary } from './components.jsx';


import { Login } from './pages/Login.jsx';
import { Assistant } from './pages/Assistant.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Opportunities } from './pages/Opportunities.jsx';
import { SkillGaps } from './pages/SkillGaps.jsx';
import { Training } from './pages/Training.jsx';
import { Roadmap } from './pages/Roadmap.jsx';
import { WhatIf } from './pages/WhatIf.jsx';
import { Progress } from './pages/Progress.jsx';
import { Profile } from './pages/Profile.jsx';
import { SelfEmployment } from './pages/SelfEmployment.jsx';

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const [activeUser, setActiveUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pmajay_user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api.getMe().then((res) => {
      if (res?.user) {
        setActiveUser(res.user);
        localStorage.setItem('pmajay_user', JSON.stringify(res.user));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLoginSuccess = (token, newUser) => {
    localStorage.setItem('pmajay_token', token);
    localStorage.setItem('pmajay_user', JSON.stringify(newUser));
    setActiveUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('pmajay_token');
    localStorage.removeItem('pmajay_user');
    setActiveUser(null);
    window.location.href = '/login';
  };

  const handleDemoLogin = async (role, district) => {
    try {
      const res = await api.demoLogin(role, district);
      if (res?.token) {
        handleLoginSuccess(res.token, res.user);
      }
    } catch (e) {
      console.error('Demo login error:', e);
    }
  };

  if (loading && !activeUser) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
        <Spinner size={32} />
        <div style={{ marginTop: '12px' }}>Loading Livelihood Assistant...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-shell">
        <AppSidebar user={activeUser} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <div className="app-main-layout">
          <QuickDemoBar onLogin={handleDemoLogin} />
          <AppHeader user={activeUser} onLogout={handleLogout} toggleMobileNav={() => setMobileOpen(!mobileOpen)} />

          <main className="app-content">
            <ErrorBoundary>
              <Routes>
                {/* Authentication */}
                <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

                {/* Beneficiary Pathways & AI Voice Assistant */}
                <Route path="/assistant" element={<ProtectedRoute user={activeUser}><Assistant /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute user={activeUser}><Dashboard user={activeUser} /></ProtectedRoute>} />
                <Route path="/opportunities" element={<ProtectedRoute user={activeUser}><Opportunities /></ProtectedRoute>} />
                <Route path="/skill-gaps" element={<ProtectedRoute user={activeUser}><SkillGaps /></ProtectedRoute>} />
                <Route path="/training" element={<ProtectedRoute user={activeUser}><Training /></ProtectedRoute>} />
                <Route path="/roadmap" element={<ProtectedRoute user={activeUser}><Roadmap /></ProtectedRoute>} />
                <Route path="/what-if" element={<ProtectedRoute user={activeUser}><WhatIf /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute user={activeUser}><Progress /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute user={activeUser}><Profile /></ProtectedRoute>} />
                <Route path="/self-employment" element={<ProtectedRoute user={activeUser}><SelfEmployment /></ProtectedRoute>} />

                {/* Default redirects */}
                <Route path="/" element={<Navigate to={activeUser ? (activeUser.role === 'officer' || activeUser.role === 'admin' ? '/dashboard' : '/assistant') : '/login'} replace />} />
                <Route path="*" element={<Navigate to={activeUser ? '/assistant' : '/login'} replace />} />
              </Routes>
            </ErrorBoundary>
          </main>

        </div>
      </div>
    </Router>
  );
}

