import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api.js';
import { AppSidebar, AppHeader, Spinner, ErrorBoundary } from './components.jsx';

import { Login } from './pages/Login.jsx';
import { Assistant } from './pages/Assistant.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Opportunities } from './pages/Opportunities.jsx';
import { SkillGaps } from './pages/SkillGaps.jsx';
import { Training } from './pages/Training.jsx';
import { CommunityLearning } from './pages/CommunityLearning.jsx';
import { Roadmap } from './pages/Roadmap.jsx';
import { WhatIf } from './pages/WhatIf.jsx';
import { Progress } from './pages/Progress.jsx';
import { Profile } from './pages/Profile.jsx';
import { SelfEmployment } from './pages/SelfEmployment.jsx';
import { Kiosk } from './pages/Kiosk.jsx';
import { ChannelDemo } from './pages/ChannelDemo.jsx';
import Overview from './pages/admin/Overview.jsx';
import Applications from './pages/admin/Applications.jsx';
import Beneficiaries from './pages/admin/Beneficiaries.jsx';
import Placements from './pages/admin/Placements.jsx';
import Coordination from './pages/admin/Coordination.jsx';
import PerspectivePlan from './pages/admin/PerspectivePlan.jsx';
import Directory from './pages/admin/Directory.jsx';
import Consent from './pages/Consent.jsx';

// Authenticated Shell Component (Only renders Sidebar & Header for logged-in users)
function AppShell({ user, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('pmajay_sidebar_open');
      if (stored !== null) return stored === 'true';
    } catch {}
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pmajay_sidebar_open', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Backdrop overlay for mobile screen when sidebar is open */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <AppSidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className={`app-main-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <AppHeader
          user={user}
          onLogout={onLogout}
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        <main className="app-content">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

const ProtectedRoute = ({ user, onLogout, children, requireUnlocked = false }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const isOfficer = user?.role === 'officer' || user?.role === 'admin';
  const isUnlocked = isOfficer || (typeof localStorage !== 'undefined' && localStorage.getItem('pmajay_voice_unlocked') === 'true');

  if (requireUnlocked && !isUnlocked) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppShell user={user} onLogout={onLogout}>
      {children}
    </AppShell>
  );
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

  if (loading && !activeUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#64748b' }}>
        <Spinner size={36} />
        <div style={{ marginTop: '16px', fontWeight: 600, fontSize: '14px' }}>Loading JeevanPath AI...</div>
      </div>
    );
  }

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* PUBLIC ROUTES (No Sidebar, No Authenticated Header) */}
          <Route
            path="/"
            element={
              activeUser ? (
                <Navigate to={activeUser.role === 'admin' || activeUser.role === 'officer' ? '/admin/overview' : '/dashboard'} replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/login"
            element={
              activeUser ? (
                <Navigate to={activeUser.role === 'admin' || activeUser.role === 'officer' ? '/admin/overview' : '/dashboard'} replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} initialTab="email" />
              )
            }
          />
          <Route
            path="/register"
            element={
              activeUser ? (
                <Navigate to={activeUser.role === 'admin' || activeUser.role === 'officer' ? '/admin/overview' : '/dashboard'} replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} initialMode="register" />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              activeUser ? (
                <Navigate to={activeUser.role === 'admin' || activeUser.role === 'officer' ? '/admin/overview' : '/dashboard'} replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} initialMode="forgot" />
              )
            }
          />
          <Route
            path="/otp"
            element={
              activeUser ? (
                <Navigate to={activeUser.role === 'admin' || activeUser.role === 'officer' ? '/admin/overview' : '/dashboard'} replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} initialTab="phone" />
              )
            }
          />

          {/* PROTECTED ROUTES (Wrapped in ProtectedRoute -> AppShell -> Sidebar + Header) */}
          <Route path="/dashboard" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><Dashboard user={activeUser} /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><Assistant /></ProtectedRoute>} />
          <Route path="/opportunities" element={<ProtectedRoute user={activeUser} onLogout={handleLogout} requireUnlocked><Opportunities /></ProtectedRoute>} />
          <Route path="/skill-gaps" element={<ProtectedRoute user={activeUser} onLogout={handleLogout} requireUnlocked><SkillGaps /></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute user={activeUser} onLogout={handleLogout} requireUnlocked><Training /></ProtectedRoute>} />
          <Route path="/community-learning" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><CommunityLearning /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute user={activeUser} onLogout={handleLogout} requireUnlocked><Roadmap /></ProtectedRoute>} />
          <Route path="/what-if" element={<ProtectedRoute user={activeUser} onLogout={handleLogout} requireUnlocked><WhatIf /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute user={activeUser} onLogout={handleLogout} requireUnlocked><Progress /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><Profile /></ProtectedRoute>} />
          <Route path="/self-employment" element={<ProtectedRoute user={activeUser} onLogout={handleLogout} requireUnlocked><SelfEmployment /></ProtectedRoute>} />
          <Route path="/kiosk" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><Kiosk /></ProtectedRoute>} />
          <Route path="/channel-demo" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><ChannelDemo /></ProtectedRoute>} />

          {/* Admin Command Routes */}
          <Route path="/admin/overview" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><Overview /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><Applications /></ProtectedRoute>} />
          <Route path="/admin/beneficiaries" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><Beneficiaries /></ProtectedRoute>} />
          <Route path="/admin/placements" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><Placements /></ProtectedRoute>} />
          <Route path="/admin/coordination" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><Coordination /></ProtectedRoute>} />
          <Route path="/admin/plan" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><PerspectivePlan /></ProtectedRoute>} />
          <Route path="/admin/directory" element={<ProtectedRoute user={activeUser} onLogout={handleLogout}><Directory /></ProtectedRoute>} />

          <Route path="/consent" element={<Consent />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to={activeUser ? (activeUser.role === 'admin' || activeUser.role === 'officer' ? '/admin/overview' : '/dashboard') : '/login'} replace />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}
