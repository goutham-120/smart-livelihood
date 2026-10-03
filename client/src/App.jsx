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
import { Kiosk } from './pages/Kiosk.jsx';
import { ChannelDemo } from './pages/ChannelDemo.jsx';
import Overview from './pages/admin/Overview.jsx';
import Beneficiaries from './pages/admin/Beneficiaries.jsx';
import Placements from './pages/admin/Placements.jsx';
import Coordination from './pages/admin/Coordination.jsx';
import PerspectivePlan from './pages/admin/PerspectivePlan.jsx';
import Directory from './pages/admin/Directory.jsx';

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppLayout({ activeUser, mobileOpen, setMobileOpen, handleDemoLogin, handleLogout, children }) {
  return (
    <div className="app-shell">
      <AppSidebar user={activeUser} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="app-main-layout">
        <QuickDemoBar onLogin={handleDemoLogin} />
        <AppHeader user={activeUser} onLogout={handleLogout} toggleMobileNav={() => setMobileOpen(!mobileOpen)} />
        <main className="app-content">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

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
      <Routes>
        {/* Full-Screen Standalone Pages */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/kiosk" element={<Kiosk />} />

        {/* Authenticated App Shell Pages */}
        <Route
          path="/*"
          element={
            <ProtectedRoute user={activeUser}>
              <AppLayout
                activeUser={activeUser}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                handleDemoLogin={handleDemoLogin}
                handleLogout={handleLogout}
              >
                <Routes>
                  <Route path="dashboard" element={<Dashboard user={activeUser} />} />
                  <Route path="assistant" element={<Assistant />} />
                  <Route path="opportunities" element={<Opportunities />} />
                  <Route path="skill-gaps" element={<SkillGaps />} />
                  <Route path="training" element={<Training />} />
                  <Route path="roadmap" element={<Roadmap />} />
                  <Route path="what-if" element={<WhatIf />} />
                  <Route path="progress" element={<Progress />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="self-employment" element={<SelfEmployment />} />
                  <Route path="channel-demo" element={<ChannelDemo />} />

                  {/* District Command (Officer & Admin) */}
                  <Route path="admin/overview" element={<Overview />} />
                  <Route path="admin/beneficiaries" element={<Beneficiaries />} />
                  <Route path="admin/placements" element={<Placements />} />
                  <Route path="admin/coordination" element={<Coordination />} />
                  <Route path="admin/plan" element={<PerspectivePlan />} />
                  <Route path="admin/directory" element={<Directory />} />

                  {/* Default redirects */}
                  <Route path="/" element={<Navigate to={activeUser?.role === 'officer' || activeUser?.role === 'admin' ? '/admin/overview' : '/dashboard'} replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

