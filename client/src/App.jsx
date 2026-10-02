/* App.jsx: Complete unified application router
   Combines P2 Voice AI & Channels, P3 Matching & Simulators, and P4 Admin Suite & Design System
   SIH26097 PM-AJAY Livelihood Assistant */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import { QuickDemoBar, Navbar, Spinner } from './components.jsx';

/* Core Pages (P2 & P3) */
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

/* Consent & Admin Pages (P4) */
const Consent            = lazy(() => import('./pages/Consent.jsx'));
const AdminLayout        = lazy(() => import('./layouts/AdminLayout.jsx'));
const AdminOverview      = lazy(() => import('./pages/admin/Overview.jsx'));
const AdminBeneficiaries = lazy(() => import('./pages/admin/Beneficiaries.jsx'));
const AdminPlacements    = lazy(() => import('./pages/admin/Placements.jsx'));
const AdminCoordination  = lazy(() => import('./pages/admin/Coordination.jsx'));
const AdminPlan          = lazy(() => import('./pages/admin/PerspectivePlan.jsx'));
const AdminDirectory     = lazy(() => import('./pages/admin/Directory.jsx'));

function PageFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Spinner size={36} />
    </div>
  );
}

function OfflineBanner() {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="offline-banner" role="alert">
      📡 {t ? t('common.offline', 'Offline mode active') : 'Offline mode active'}
    </div>
  );
}

export default function App() {
  const auth = useAuth?.();
  const [localUser, setLocalUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pmajay_user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const activeUser = auth?.user || localUser;

  useEffect(() => {
    api.getMe().then((res) => {
      if (res?.user) {
        setLocalUser(res.user);
        if (auth?.setUser) auth.setUser(res.user);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLoginSuccess = (token, newUser) => {
    localStorage.setItem('pmajay_token', token);
    localStorage.setItem('pmajay_user', JSON.stringify(newUser));
    setLocalUser(newUser);
    if (auth?.setUser) auth.setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('pmajay_token');
    localStorage.removeItem('pmajay_user');
    setLocalUser(null);
    if (auth?.logout) auth.logout();
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
      <OfflineBanner />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface-900)', color: 'var(--surface-100)' }}>
        <QuickDemoBar onLogin={handleDemoLogin} />
        <Navbar user={activeUser} onLogout={handleLogout} />

        <main style={{ flex: 1 }}>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Standalone Channel Experiences */}
              <Route path="/kiosk" element={<Kiosk />} />
              <Route path="/channel-demo" element={<ChannelDemo />} />

              {/* Authentication & Privacy */}
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/consent" element={<Consent />} />

              {/* Beneficiary Pathways & AI Voice Assistant */}
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/dashboard" element={<Dashboard user={activeUser} />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/skill-gaps" element={<SkillGaps />} />
              <Route path="/training" element={<Training />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/what-if" element={<WhatIf />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/self-employment" element={<SelfEmployment />} />

              {/* Officer / Admin Command Suite */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/overview" replace />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="beneficiaries" element={<AdminBeneficiaries />} />
                <Route path="placements" element={<AdminPlacements />} />
                <Route path="coordination" element={<AdminCoordination />} />
                <Route path="plan" element={<AdminPlan />} />
                <Route path="directory" element={<AdminDirectory />} />
              </Route>

              {/* Default redirects */}
              <Route path="/" element={<Navigate to={activeUser ? (activeUser.role === 'officer' || activeUser.role === 'admin' ? '/dashboard' : '/assistant') : '/login'} replace />} />
              <Route path="*" element={<Navigate to="/assistant" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}
