/* Login.jsx: Multi-method authentication with Civic-Tech PM-AJAY Hero Layout */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { Spinner, LanguageSwitcher } from '../components.jsx';
import { authLogin, authOtpSend, authOtpVerify, authDemoLogin } from '../api.js';
import './Login.css';

const DEMO_ROLES = [
  { role: 'beneficiary', district: 'Warangal', label: '🌾 Beneficiary (Warangal, Handloom Weaver)' },
  { role: 'beneficiary', district: 'Adilabad', label: '🌱 Beneficiary (Adilabad, Dairy Farmer)' },
  { role: 'officer', district: 'Warangal', label: '🏛️ District Officer (Warangal)' },
  { role: 'officer', district: 'Adilabad', label: '🏛️ District Officer (Adilabad)' },
  { role: 'admin', district: '', label: '🇮🇳 Ministry Admin' },
];

export function Login({ onLoginSuccess }) {
  const { t } = useTranslation();
  const auth = useAuth?.();
  const toastCtx = useToast?.();
  const toast = toastCtx?.addToast || ((msg) => console.log(msg));
  const navigate = useNavigate();

  const [tab, setTab] = useState('demo'); // 'demo' | 'email' | 'phone'
  const [loading, setLoading] = useState(false);

  // Email form state
  const [identifier, setIdentifier] = useState('user@pmajay.gov.in');
  const [password, setPassword] = useState('Demo@123');

  // Phone form state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const completeLogin = (token, user) => {
    localStorage.setItem('pmajay_token', token);
    localStorage.setItem('pmajay_user', JSON.stringify(user));
    if (auth?.setUser) auth.setUser(user);
    if (onLoginSuccess) onLoginSuccess(token, user);
    toast(t ? t('login.welcome', `Welcome, ${user.name}!`) : `Welcome, ${user.name}!`, 'success');
    if (user.role === 'admin' || user.role === 'officer') {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setLoading(true);
    try {
      const res = await authLogin({ identifier, password });
      completeLogin(res.data.token, res.data.user);
    } catch (err) {
      toast(err.response?.data?.error || (t ? t('common.error', 'Invalid credentials') : 'Invalid credentials'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSend = async (e) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    try {
      await authOtpSend(phone);
      setOtpSent(true);
      toast(t ? t('login.otpSent', 'OTP sent to mobile') : 'OTP sent to mobile', 'info');
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    try {
      const res = await authOtpVerify({ phone, otp });
      completeLogin(res.data.token, res.data.user);
    } catch (err) {
      toast(err.response?.data?.error || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role, district) => {
    setLoading(true);
    try {
      const res = await authDemoLogin(role, district);
      completeLogin(res.data.token, res.data.user);
    } catch (err) {
      toast(err.response?.data?.error || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-hero-root">
      <div className="login-hero-overlay" />

      <div className="login-hero-container">
        {/* Left Side: Auth Card */}
        <div className="login-hero-card">
          <div className="login-card-topbar">
            <div className="login-card-brand">
              <span className="login-card-brand-icon">🌱</span>
              <div>
                <span className="login-card-brand-title">Livelihood Assistant</span>
                <span className="login-card-brand-sub">PM-AJAY Portal</span>
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          <h2 className="login-card-title">Welcome Back</h2>
          <p className="login-card-subtitle">Sign in to access your livelihood dashboard or voice assistant</p>

          {/* Tab Selector */}
          <div className="login-hero-tabs" role="tablist">
            <button
              className={`login-hero-tab ${tab === 'demo' ? 'active' : ''}`}
              onClick={() => { setTab('demo'); setOtpSent(false); }}
            >
              ⚡ Demo
            </button>
            <button
              className={`login-hero-tab ${tab === 'email' ? 'active' : ''}`}
              onClick={() => { setTab('email'); setOtpSent(false); }}
            >
              Email / ID
            </button>
            <button
              className={`login-hero-tab ${tab === 'phone' ? 'active' : ''}`}
              onClick={() => { setTab('phone'); setOtpSent(false); }}
            >
              Mobile OTP
            </button>
          </div>

          {/* Quick Demo Personas */}
          {tab === 'demo' && (
            <div className="login-hero-demo-list">
              <p className="login-hero-demo-caption">Select a persona to test with instant access:</p>
              {DEMO_ROLES.map(({ role, district, label }) => (
                <button
                  key={`${role}-${district}`}
                  className="login-hero-demo-btn"
                  disabled={loading}
                  onClick={() => handleDemoLogin(role, district)}
                >
                  <div className="login-hero-demo-btn-label">
                    {loading ? <Spinner size={14} /> : null}
                    <span>{label}</span>
                  </div>
                  <span className="login-hero-demo-tag">{role}</span>
                </button>
              ))}
            </div>
          )}

          {/* Email / ID Login */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} className="login-hero-form">
              <div className="login-hero-field">
                <label className="login-hero-label">Email or Mobile Number</label>
                <div className="login-hero-input-wrap">
                  <span className="login-hero-input-icon">✉️</span>
                  <input
                    type="text"
                    className="login-hero-input"
                    placeholder="user@pmajay.gov.in"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-hero-field">
                <div className="login-hero-field-header">
                  <label className="login-hero-label">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); toast('Please contact your district officer to reset password.', 'info'); }} className="login-hero-forgot">Forgot password?</a>
                </div>
                <div className="login-hero-input-wrap">
                  <span className="login-hero-input-icon">🔒</span>
                  <input
                    type="password"
                    className="login-hero-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="login-hero-submit" disabled={loading}>
                {loading ? <Spinner size={18} /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* Mobile OTP Login */}
          {tab === 'phone' && (
            <form onSubmit={otpSent ? handleOtpVerify : handleOtpSend} className="login-hero-form">
              <div className="login-hero-field">
                <label className="login-hero-label">Mobile Number</label>
                <div className="login-hero-input-wrap">
                  <span className="login-hero-input-icon">📱</span>
                  <input
                    type="tel"
                    className="login-hero-input"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpSent}
                    required
                  />
                </div>
              </div>

              {otpSent && (
                <div className="login-hero-field">
                  <label className="login-hero-label">Enter 6-digit OTP</label>
                  <div className="login-hero-input-wrap">
                    <span className="login-hero-input-icon">🔢</span>
                    <input
                      type="number"
                      className="login-hero-input"
                      placeholder="123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="login-hero-submit" disabled={loading}>
                {loading ? <Spinner size={18} /> : otpSent ? 'Verify OTP & Enter' : 'Send OTP'}
              </button>

              {otpSent && (
                <button
                  type="button"
                  className="login-hero-change-btn"
                  onClick={() => { setOtpSent(false); setOtp(''); }}
                >
                  ← Change number
                </button>
              )}
            </form>
          )}

          <div className="login-card-footer">
            <span>New beneficiary or official? </span>
            <button
              type="button"
              className="login-card-link"
              onClick={() => handleDemoLogin('beneficiary', 'Warangal')}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Right Side: Hero Content */}
        <div className="login-hero-info">
          <div className="login-hero-badge">
            <span className="login-hero-badge-icon">🛡️</span>
            <span>Ministry of Social Justice & Empowerment • PM-AJAY</span>
          </div>

          <h1 className="login-hero-heading">
            AI-powered livelihood guidance for every voice.
          </h1>

          <p className="login-hero-description">
            Tell us about your skills, experience, and goals. Get personalized livelihood opportunities,
            skill-gap insights, training recommendations, and a clear path forward — through voice or text.
          </p>

          <div className="login-hero-features">
            <div className="login-hero-feature-item">
              <div className="login-hero-feature-icon">🎙️</div>
              <div>
                <h3 className="login-hero-feature-title">Voice-first guidance in local languages</h3>
                <p className="login-hero-feature-desc">Speak naturally in Telugu, Hindi, or English to share your background and goals.</p>
              </div>
            </div>

            <div className="login-hero-feature-item">
              <div className="login-hero-feature-icon">🎯</div>
              <div>
                <h3 className="login-hero-feature-title">Personalized opportunity matching</h3>
                <p className="login-hero-feature-desc">Discover government schemes, jobs, and micro-enterprises tailored to your district.</p>
              </div>
            </div>

            <div className="login-hero-feature-item">
              <div className="login-hero-feature-icon">🧭</div>
              <div>
                <h3 className="login-hero-feature-title">Actionable livelihood pathways</h3>
                <p className="login-hero-feature-desc">Structured career roadmaps with milestone tracking from skilling to placement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
