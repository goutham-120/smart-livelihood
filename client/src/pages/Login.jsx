/* Login.jsx: Public Start / Landing / Login Experience
   SIH26097 PM-AJAY Livelihood Assistant */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Mic, Target, BookOpen, Compass, ShieldCheck, HelpCircle,
  User, Lock, Mail, Phone, X, AlertCircle
} from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { Spinner, LanguageSwitcher } from '../components.jsx';
import { authLogin, authOtpSend, authOtpVerify, authRegister, authAdminRegister, authDemoLogin } from '../api.js';
import './Login.css';

export function Login({ onLoginSuccess, initialTab = 'email', initialMode = 'auth' }) {
  const { t } = useTranslation();
  const auth = useAuth?.();
  const toastCtx = useToast?.();
  const toast = toastCtx?.addToast || ((msg) => console.log(msg));
  const navigate = useNavigate();

  const [portalRole, setPortalRole] = useState('beneficiary'); // 'beneficiary' | 'admin'
  const [mode, setMode] = useState(initialMode); // 'auth' | 'register' | 'forgot' | 'admin-register'
  const [tab, setTab] = useState(initialTab);   // 'email' | 'phone'
  const [loading, setLoading] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [formError, setFormError] = useState('');

  // Email form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Phone form state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDistrict, setRegDistrict] = useState('Warangal');
  const [adminSecretKey, setAdminSecretKey] = useState('');

  useEffect(() => {
    setTab(initialTab);
    setMode(initialMode);
    setFormError('');
  }, [initialTab, initialMode]);

  const completeLogin = (token, user) => {
    localStorage.setItem('pmajay_token', token);
    localStorage.setItem('pmajay_user', JSON.stringify(user));
    if (auth?.login) auth.login(token, user);
    if (auth?.setUser) auth.setUser(user);
    if (onLoginSuccess) onLoginSuccess(token, user);
    toast(t('login.welcomeUser', 'Welcome, {{name}}!', { name: user.name }), 'success');
    if (user.role === 'admin' || user.role === 'officer') {
      navigate('/admin/overview');
    } else {
      navigate('/dashboard');
    }
  };

  const handleDemoQuickLogin = async (role) => {
    setLoading(true);
    try {
      const res = await authDemoLogin(role, 'Warangal');
      completeLogin(res.data.token, res.data.user);
    } catch (err) {
      toast(err.response?.data?.error || 'Demo login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !adminSecretKey) {
      toast('Please enter name, official email, password, and the Administrator Authorization Key.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await authAdminRegister({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        district: regDistrict,
        adminSecretKey
      });
      completeLogin(res.data.token, res.data.user);
    } catch (err) {
      toast(err.response?.data?.error || 'Admin registration failed. Please verify the Secret Key.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!identifier || !password) {
      setFormError('Please enter your email/phone and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authLogin({ identifier: identifier.trim(), password });
      completeLogin(res.data.token, res.data.user);
    } catch (err) {
      const msg = err.response?.data?.error || t('login.invalidCreds', 'Incorrect email/phone or password.');
      setFormError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSend = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!phone) {
      setFormError('Please enter your 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      await authOtpSend(phone.trim());
      setOtpSent(true);
      toast(t('login.otpSentMsg', 'OTP sent to mobile phone (Demo mode: 123456).'), 'info');
    } catch (err) {
      const msg = err.response?.data?.error || t('login.otpFailMsg', 'Failed to send OTP. Please check mobile number.');
      setFormError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!otp) {
      setFormError('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await authOtpVerify({ phone: phone.trim(), otp: otp.trim() });
      completeLogin(res.data.token, res.data.user);
    } catch (err) {
      const msg = err.response?.data?.error || t('login.invalidOtpMsg', 'Invalid 6-digit OTP. Please try again.');
      setFormError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPhone = regPhone.trim();

    if (!cleanName) {
      setFormError('Please enter your Full Name.');
      toast('Please enter your Full Name.', 'error');
      return;
    }
    if (!cleanEmail && !cleanPhone) {
      setFormError('Please enter either an Email Address or Mobile Phone Number.');
      toast('Please enter either an Email Address or Mobile Phone Number.', 'error');
      return;
    }
    if (!regPassword) {
      setFormError('Please enter a Password.');
      toast('Please enter a Password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authRegister({
        name: cleanName,
        email: cleanEmail || undefined,
        phone: cleanPhone || undefined,
        password: regPassword,
        district: regDistrict,
      });
      completeLogin(res.data.token, res.data.user);
    } catch (err) {
      const msg = err.response?.data?.error || t('login.regFailMsg', 'Registration failed. Email or phone may already exist.');
      setFormError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    toast(t('login.resetSentMsg', 'Password reset instructions sent to your registered email/phone if valid.'), 'info');
    setMode('auth');
  };

  return (
    <div className="start-page-root">
      {/* PUBLIC HEADER */}
      <header className="start-header">
        <div className="start-header-inner">
          <div className="start-brand">
            <img src="/assets/pm-ajay-logo.png" alt="PM-AJAY Logo" className="start-brand-logo" />
            <div>
              <div className="start-brand-title">{t('appName', 'Livelihood Assistant')}</div>
              <div className="start-brand-sub">{t('tagline', 'AI Voice Skilling & Mapping')}</div>
            </div>
          </div>

          <div className="start-header-actions">
            <button
              type="button"
              className="start-help-btn"
              onClick={() => setShowHelpModal(true)}
              title={t('footer.help', 'Help')}
            >
              <HelpCircle size={16} />
              <span>{t('footer.help', 'Help')}</span>
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* HERO & AUTH CONTAINER */}
      <main className="start-hero-container">
        <img
          src="/assets/login-background.jpg"
          alt=""
          className="login-bg-img"
        />
        <div className="login-bg-overlay" />
        <div className="start-hero-inner">
          {/* LEFT: HERO TEXT & PRODUCT VALUE */}
          <div className="start-hero-content">
            <div className="start-trust-tag">
              <ShieldCheck size={16} />
              <span>{t('login.trustTag', 'Ministry of Social Justice & Empowerment • PM-AJAY')}</span>
            </div>

            <h1 className="start-hero-title">
              {t('login.heroTitle', 'AI-powered livelihood guidance for every voice.')}
            </h1>

            <p className="start-hero-subtitle">
              {t('login.heroSubtitle', 'Tell us about your skills, experience, and goals. Get personalized livelihood opportunities, skill-gap insights, training recommendations, and a clear path forward — through voice or text.')}
            </p>

            <div className="start-feature-list">
              <div className="start-feature-item">
                <div className="start-feature-icon-box">
                  <Mic size={18} />
                </div>
                <div>
                  <div className="start-feature-title">{t('login.feat1Title', 'Voice-first guidance in local languages')}</div>
                  <div className="start-feature-desc">{t('login.feat1Desc', 'Speak naturally in Telugu, Hindi, or English to share your background and goals.')}</div>
                </div>
              </div>

              <div className="start-feature-item">
                <div className="start-feature-icon-box">
                  <Target size={18} />
                </div>
                <div>
                  <div className="start-feature-title">{t('login.feat2Title', 'Personalized opportunity matching')}</div>
                  <div className="start-feature-desc">{t('login.feat2Desc', 'Discover government schemes, jobs, and micro-enterprises tailored to your district.')}</div>
                </div>
              </div>

              <div className="start-feature-item">
                <div className="start-feature-icon-box">
                  <Compass size={18} />
                </div>
                <div>
                  <div className="start-feature-title">{t('login.feat3Title', 'Actionable livelihood pathways')}</div>
                  <div className="start-feature-desc">{t('login.feat3Desc', 'Structured career roadmaps with milestone tracking from skilling to placement.')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: AUTHENTICATION CARD */}
          <div className="start-auth-wrapper">
            <div className="start-auth-card">
              {/* PORTAL ROLE SWITCHER */}
              <div style={{ display: 'flex', background: 'var(--surface-subtle)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border-medium)' }}>
                <button
                  type="button"
                  onClick={() => { setPortalRole('beneficiary'); setMode('auth'); setIdentifier(''); setPassword(''); }}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: portalRole === 'beneficiary' ? 'var(--surface-card)' : 'transparent',
                    color: portalRole === 'beneficiary' ? 'var(--primary-700)' : 'var(--text-muted)',
                    boxShadow: portalRole === 'beneficiary' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  👤 Beneficiary
                </button>
                <button
                  type="button"
                  onClick={() => { setPortalRole('admin'); setMode('auth'); setTab('email'); setIdentifier(''); setPassword(''); }}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: portalRole === 'admin' ? 'var(--surface-card)' : 'transparent',
                    color: portalRole === 'admin' ? 'var(--primary-700)' : 'var(--text-muted)',
                    boxShadow: portalRole === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🏛️ Admin Portal
                </button>
              </div>

              <div className="auth-card-header">
                <h2 className="auth-card-title">
                  {mode === 'register'
                    ? t('login.registerTitle', 'Create Account')
                    : mode === 'admin-register'
                    ? 'Admin Registration'
                    : mode === 'forgot'
                    ? t('login.forgotTitle', 'Reset Password')
                    : portalRole === 'admin'
                    ? 'Admin Portal Sign In'
                    : t('login.welcomeTitle', 'Welcome Back')}
                </h2>
                <p className="auth-card-sub">
                  {mode === 'register'
                    ? t('login.registerSub', 'Register to start your personalized livelihood journey')
                    : mode === 'admin-register'
                    ? 'Authorized official registration with PM-AJAY secret code'
                    : mode === 'forgot'
                    ? t('login.forgotSub', 'Enter your registered email or phone number to reset')
                    : portalRole === 'admin'
                    ? 'Ministry & District Officer access for review & admissions'
                    : t('login.welcomeSub', 'Sign in to access your livelihood dashboard or voice assistant')}
                </p>
              </div>

              {formError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 500
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{formError}</span>
                </div>
              )}

              {/* BENEFICIARY AUTH MODE */}
              {mode === 'auth' && portalRole === 'beneficiary' && (
                <>
                  <div className="tab-group mb-5" role="tablist" aria-label="Login method">
                    <button
                      type="button"
                      className={`tab ${tab === 'email' ? 'active' : ''}`}
                      role="tab"
                      aria-selected={tab === 'email'}
                      onClick={() => { setTab('email'); setOtpSent(false); }}
                    >
                      {t('login.emailTab', 'Email / ID')}
                    </button>
                    <button
                      type="button"
                      className={`tab ${tab === 'phone' ? 'active' : ''}`}
                      role="tab"
                      aria-selected={tab === 'phone'}
                      onClick={() => { setTab('phone'); setOtpSent(false); }}
                    >
                      {t('login.phoneTab', 'Mobile OTP')}
                    </button>
                  </div>

                  {/* Email Login Form */}
                  {tab === 'email' && (
                    <form onSubmit={handleEmailLogin} className="auth-form" noValidate>
                      <div className="form-group">
                        <label className="label" htmlFor="inp-identifier">{t('login.emailOrPhone', 'Email or Mobile Number')}</label>
                        <div className="input-with-icon">
                          <Mail size={18} className="input-icon" />
                          <input
                            id="inp-identifier"
                            className="input input-padded"
                            type="text"
                            autoComplete="username"
                            placeholder="venkat@gmail.com"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <div className="label-row">
                          <label className="label" htmlFor="inp-password">{t('login.password', 'Password')}</label>
                          <button
                            type="button"
                            className="btn-link text-xs"
                            onClick={() => setMode('forgot')}
                          >
                            {t('login.forgotLink', 'Forgot password?')}
                          </button>
                        </div>
                        <div className="input-with-icon">
                          <Lock size={18} className="input-icon" />
                          <input
                            id="inp-password"
                            className="input input-padded"
                            type="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full mt-2"
                        disabled={loading}
                      >
                        {loading ? <Spinner size={20} /> : t('login.signIn', 'Sign In')}
                      </button>
                    </form>
                  )}

                  {/* Phone OTP Form */}
                  {tab === 'phone' && (
                    <form onSubmit={otpSent ? handleOtpVerify : handleOtpSend} className="auth-form" noValidate>
                      <div className="form-group">
                        <label className="label" htmlFor="inp-phone">{t('login.phoneLabel', 'Mobile Phone Number')}</label>
                        <div className="input-with-icon">
                          <Phone size={18} className="input-icon" />
                          <input
                            id="inp-phone"
                            className="input input-padded"
                            type="tel"
                            placeholder="9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={otpSent}
                            required
                          />
                        </div>
                      </div>

                      {otpSent && (
                        <div className="form-group">
                          <label className="label" htmlFor="inp-otp">{t('login.enterOtp', 'Enter 6-digit OTP')}</label>
                          <input
                            id="inp-otp"
                            className="input"
                            type="number"
                            inputMode="numeric"
                            placeholder="123456"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full mt-2"
                        disabled={loading}
                      >
                        {loading ? <Spinner size={20} /> : otpSent ? t('login.verifyOtp', 'Verify OTP & Sign In') : t('login.sendOtp', 'Send Mobile OTP')}
                      </button>

                      {otpSent && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm w-full mt-1"
                          onClick={() => { setOtpSent(false); setOtp(''); }}
                        >
                          {t('login.changePhone', '← Change phone number')}
                        </button>
                      )}
                    </form>
                  )}

                  <div className="auth-card-footer">
                    <span>{t('login.newAccountPrompt', 'New beneficiary?')} </span>
                    <button
                      type="button"
                      className="btn-link font-bold"
                      onClick={() => setMode('register')}
                    >
                      {t('login.createAccountLink', 'Create Account')}
                    </button>
                  </div>
                </>
              )}

              {/* ADMIN AUTH MODE */}
              {mode === 'auth' && portalRole === 'admin' && (
                <>
                  <form onSubmit={handleEmailLogin} className="auth-form" noValidate>
                    <div className="form-group">
                      <label className="label" htmlFor="inp-admin-identifier">Official Email / ID</label>
                      <div className="input-with-icon">
                        <Mail size={18} className="input-icon" />
                        <input
                          id="inp-admin-identifier"
                          className="input input-padded"
                          type="text"
                          autoComplete="username"
                          placeholder="admin@demo.gov.in"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="label-row">
                        <label className="label" htmlFor="inp-admin-password">{t('login.password', 'Password')}</label>
                        <button
                          type="button"
                          className="btn-link text-xs"
                          onClick={() => setMode('forgot')}
                        >
                          {t('login.forgotLink', 'Forgot password?')}
                        </button>
                      </div>
                      <div className="input-with-icon">
                        <Lock size={18} className="input-icon" />
                        <input
                          id="inp-admin-password"
                          className="input input-padded"
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-full mt-2"
                      disabled={loading}
                    >
                      {loading ? <Spinner size={20} /> : 'Sign In as Administrator'}
                    </button>
                  </form>

                  <div className="auth-card-footer">
                    <span>Need admin access? </span>
                    <button
                      type="button"
                      className="btn-link font-bold"
                      onClick={() => setMode('admin-register')}
                    >
                      Register with Invite Code
                    </button>
                  </div>
                </>
              )}

              {/* BENEFICIARY REGISTER MODE */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="auth-form" noValidate>
                  <div className="form-group">
                    <label className="label">{t('login.fullName', 'Full Name')}</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input
                        className="input input-padded"
                        type="text"
                        placeholder={t('login.fullNamePlaceholder', 'e.g. Lakshmi Goud')}
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">{t('login.emailAddr', 'Email Address')}</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        className="input input-padded"
                        type="email"
                        placeholder="lakshmi@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">{t('login.phoneLabel', 'Mobile Phone Number')}</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input
                        className="input input-padded"
                        type="tel"
                        placeholder="9876543210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">{t('login.district', 'District')}</label>
                    <select
                      className="input"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                    >
                      <option value="Warangal">Warangal</option>
                      <option value="Adilabad">Adilabad</option>
                      <option value="Karimnagar">Karimnagar</option>
                      <option value="Nalgonda">Nalgonda</option>
                      <option value="Khammam">Khammam</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label">{t('login.password', 'Password')}</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon" />
                      <input
                        className="input input-padded"
                        type="password"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-full mt-2"
                    disabled={loading}
                  >
                    {loading ? <Spinner size={20} /> : t('login.completeReg', 'Complete Registration')}
                  </button>

                  <div className="auth-card-footer">
                    <span>{t('login.alreadyAccountPrompt', 'Already have an account?')} </span>
                    <button
                      type="button"
                      className="btn-link font-bold"
                      onClick={() => setMode('auth')}
                    >
                      {t('login.backToSignIn', 'Back to Sign In')}
                    </button>
                  </div>
                </form>
              )}

              {/* ADMIN REGISTER MODE (PROTECTED) */}
              {mode === 'admin-register' && (
                <form onSubmit={handleAdminRegisterSubmit} className="auth-form" noValidate>
                  <div className="form-group">
                    <label className="label">Full Name & Designation</label>
                    <div className="input-with-icon">
                      <User size={18} className="input-icon" />
                      <input
                        className="input input-padded"
                        type="text"
                        placeholder="e.g. S. Raman, District Officer"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Official Email Address</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        className="input input-padded"
                        type="email"
                        placeholder="official@pmajay.gov.in"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">District Jurisdiction</label>
                    <select
                      className="input"
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                    >
                      <option value="Warangal">Warangal</option>
                      <option value="Adilabad">Adilabad</option>
                      <option value="Karimnagar">Karimnagar</option>
                      <option value="Nalgonda">Nalgonda</option>
                      <option value="Khammam">Khammam</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label">Password</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon" />
                      <input
                        className="input input-padded"
                        type="password"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Administrator Authorization Key</label>
                    <div className="input-with-icon">
                      <ShieldCheck size={18} className="input-icon" />
                      <input
                        className="input input-padded"
                        type="text"
                        placeholder="PMAJAY-ADMIN-2026"
                        value={adminSecretKey}
                        onChange={(e) => setAdminSecretKey(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Key provided to nodal ministry officers (Demo: PMAJAY-ADMIN-2026)
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-full mt-2"
                    disabled={loading}
                  >
                    {loading ? <Spinner size={20} /> : 'Create Administrator Account'}
                  </button>

                  <div className="auth-card-footer">
                    <button
                      type="button"
                      className="btn-link font-bold"
                      onClick={() => setMode('auth')}
                    >
                      ← Back to Admin Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* FORGOT PASSWORD MODE */}
              {mode === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="auth-form" noValidate>
                  <div className="form-group">
                    <label className="label">{t('login.emailOrPhone', 'Email or Mobile Number')}</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        className="input input-padded"
                        type="text"
                        placeholder="user@pmajay.gov.in"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-full mt-2"
                  >
                    {t('login.sendResetLink', 'Send Reset Link / OTP')}
                  </button>

                  <div className="auth-card-footer">
                    <button
                      type="button"
                      className="btn-link font-bold"
                      onClick={() => setMode('auth')}
                    >
                      {t('login.backToSignIn', 'Back to Sign In')}
                    </button>
                  </div>
                </form>
              )}

              {/* DEMO QUICK ACCOUNTS (SIH JUDGES & PROTOTYPE TESTING) */}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-medium)', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Quick Demo Accounts
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                    onClick={() => handleDemoQuickLogin('beneficiary')}
                    disabled={loading}
                    title="Login as Beneficiary Venkat"
                  >
                    <span>👤</span>
                    <span>Beneficiary (Venkat)</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px', borderColor: 'var(--primary-600)', color: 'var(--primary-700)' }}
                    onClick={() => handleDemoQuickLogin('admin')}
                    disabled={loading}
                    title="Login as Ministry Administrator"
                  >
                    <span>🏛️</span>
                    <span>Admin (Ministry)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CORE CAPABILITIES SECTION */}
      <section className="start-capabilities-section">
        <div className="capabilities-container">
          <div className="capabilities-header">
            <h2 className="capabilities-title">{t('capabilities.title', 'Core Capabilities')}</h2>
            <p className="capabilities-subtitle">
              {t('capabilities.subtitle', 'Empowering PM-AJAY beneficiaries with empathetic AI voice interaction, skill mapping, and scheme alignment.')}
            </p>
          </div>

          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="capability-icon-box bg-blue-light">
                <Mic size={24} className="text-blue" />
              </div>
              <h3 className="capability-card-title">{t('capabilities.cap1Title', 'Voice-First Guidance')}</h3>
              <p className="capability-card-desc">
                {t('capabilities.cap1Desc', 'Speak naturally in your preferred language to share your background, aspirations, and experience without complex forms.')}
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon-box bg-teal-light">
                <Target size={24} className="text-teal" />
              </div>
              <h3 className="capability-card-title">{t('capabilities.cap2Title', 'Personalized Opportunities')}</h3>
              <p className="capability-card-desc">
                {t('capabilities.cap2Desc', 'Discover tailored government skilling programs, micro-enterprise models, and job openings aligned with local demand.')}
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon-box bg-blue-light">
                <BookOpen size={24} className="text-blue" />
              </div>
              <h3 className="capability-card-title">{t('capabilities.cap3Title', 'Skill & Training Guidance')}</h3>
              <p className="capability-card-desc">
                {t('capabilities.cap3Desc', 'Identify competency gaps and enroll in certified training initiatives supported under PM-AJAY and allied schemes.')}
              </p>
            </div>

            <div className="capability-card">
              <div className="capability-icon-box bg-teal-light">
                <Compass size={24} className="text-teal" />
              </div>
              <h3 className="capability-card-title">{t('capabilities.cap4Title', 'Personalized Roadmap')}</h3>
              <p className="capability-card-desc">
                {t('capabilities.cap4Desc', 'Transform current skills into an actionable, step-by-step career path with progress tracking and milestone guidance.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PUBLIC FOOTER */}
      <footer className="start-footer">
        <div className="start-footer-inner">
          <div className="footer-brand">
            <strong>{t('footer.brand', 'PM-AJAY Livelihood Assistant — Pradhan Mantri Anusuchit Jaati Abhyuday Yojana')}</strong>
          </div>
          <div className="footer-tagline">
            {t('footer.tagline', 'Voice-First • Multilingual • Empathetic Civic AI')}
          </div>
        </div>
      </footer>

      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="modal-backdrop" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '18px', color: 'var(--primary-900)' }}>
                <HelpCircle size={20} className="text-blue" />
                <span>{t('helpModal.title', 'About PM-AJAY Livelihood Assistant')}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowHelpModal(false)}
                style={{ padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>
                {t('helpModal.desc', 'An AI-powered conversational guidance platform designed for beneficiaries under the Pradhan Mantri Anusuchit Jaati Abhyuday Yojana.')}
              </p>
              <p>
                <strong>{t('helpModal.keyFeatures', 'Key Features:')}</strong>
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>{t('helpModal.feat1', 'Multilingual Voice Interaction (Telugu, Hindi, English)')}</li>
                <li>{t('helpModal.feat2', 'Instant Livelihood & Skill Gap Assessment')}</li>
                <li>{t('helpModal.feat3', 'Personalized Career Roadmaps & Micro-Enterprise Guides')}</li>
                <li>{t('helpModal.feat4', 'Direct Access via Web, Touch Kiosks, or Voice Channels')}</li>
              </ul>
              <p style={{ marginTop: '8px' }}>
                {t('helpModal.support', 'Need Support? Contact your local District Officer or Ministry helpline.')}
              </p>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowHelpModal(false)}
              >
                {t('helpModal.gotIt', 'Got it')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
