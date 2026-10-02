import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import { QuickDemoBar, Navbar } from './components';

import { Login } from './pages/Login';
import { Assistant } from './pages/Assistant';
import { Dashboard } from './pages/Dashboard';
import { Opportunities } from './pages/Opportunities';
import { SkillGaps } from './pages/SkillGaps';
import { Training } from './pages/Training';
import { Roadmap } from './pages/Roadmap';
import { WhatIf } from './pages/WhatIf';
import { Progress } from './pages/Progress';
import { Profile } from './pages/Profile';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe().then((res) => {
      if (res.user) setUser(res.user);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLoginSuccess = (token, newUser) => {
    localStorage.setItem('pmajay_token', token);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('pmajay_token');
    setUser(null);
  };

  const handleDemoLogin = async (role, district) => {
    const res = await api.demoLogin(role, district);
    if (res.token) {
      handleLoginSuccess(res.token, res.user);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading Livelihood Assistant...</div>;
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <QuickDemoBar onLogin={handleDemoLogin} />
        <Navbar user={user} onLogout={handleLogout} />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/skill-gaps" element={<SkillGaps />} />
            <Route path="/training" element={<Training />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/what-if" element={<WhatIf />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/assistant" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
