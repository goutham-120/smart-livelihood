/* Login.jsx: Multi-method authentication (Email, OTP, Demo quick-login)
   SIH26097 PM-AJAY Livelihood Assistant */
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

  const [tab, setTab] = useState('demo'); // 'email' | 'phone' | 'demo'
  const [loading, setLoading] = useState(false);

  // Email form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

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
      navigate('/assistant');
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
    <div className="login-root">
      {/* Background decoration */}
      <div className="login-bg" aria-hidden="true">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
      </div>

      <div className="login-card card-glass">
        {/* Logo and language */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '2.5rem' }} aria-hidden="true">🌱</span>
            <div>
              <h1 className="text-xl font-bold text-primary">{t ? t('appName', 'PM-AJAY Livelihood') : 'PM-AJAY Livelihood'}</h1>
              <p className="text-xs text-muted">{t ? t('tagline', 'AI Voice Skilling & Mapping') : 'AI Voice Skilling & Mapping'}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <h2 className="text-2xl font-bold mb-1">{t ? t('login.title', 'Sign In') : 'Sign In'}</h2>
        <p className="text-muted text-sm mb-6">{t ? t('login.subtitle', 'Access your skilling dashboard or voice assistant') : 'Access your skilling dashboard'}</p>

        {/* Tab selector */}
        <div className="tab-group mb-6" role="tablist" aria-label="Login method">
          {['demo', 'email', 'phone'].map((t2) => (
            <button
              key={t2}
              className={`tab ${tab === t2 ? 'active' : ''}`}
              role="tab"
              aria-selected={tab === t2}
              id={`tab-${t2}`}
              onClick={() => { setTab(t2); setOtpSent(false); }}
            >
              {t2 === 'demo' ? (t ? t('login.demoTab', '⚡ Quick Demo') : '⚡ Quick Demo')
                : t2 === 'email' ? (t ? t('login.emailTab', 'Email / ID') : 'Email / ID')
                : (t ? t('login.phoneTab', 'Mobile OTP') : 'Mobile OTP')}
            </button>
          ))}
        </div>

        {/* Demo quick login */}
        {tab === 'demo' && (
          <div className="flex-col gap-3 flex">
            <p className="text-sm text-muted mb-2">
              🧪 Select a persona to test the platform. Instant access without passwords:
            </p>
            {DEMO_ROLES.map(({ role, district, label }) => (
              <button
                key={`${role}-${district}`}
                id={`btn-demo-${role}-${district || 'admin'}`}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: 'var(--sp-4)', textAlign: 'left', width: '100%' }}
                disabled={loading}
                onClick={() => handleDemoLogin(role, district)}
              >
                {loading ? <Spinner size={18} /> : null}
                <span style={{ fontSize: '13px' }}>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Email / password form */}
        {tab === 'email' && (
          <form onSubmit={handleEmailLogin} className="flex-col gap-4 flex" noValidate>
            <div className="form-group">
              <label className="label" htmlFor="inp-identifier">
                {t ? t('login.emailOrPhone', 'Email or Mobile') : 'Email or Mobile'}
              </label>
              <input
                id="inp-identifier"
                className="input"
                type="text"
                autoComplete="username"
                placeholder="admin@demo.gov.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                aria-required="true"
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="inp-password">
                {t ? t('login.password', 'Password') : 'Password'}
              </label>
              <input
                id="inp-password"
                className="input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
              />
            </div>
            <button
              id="btn-login-submit"
              type="submit"
              className="btn btn-primary btn-lg w-full mt-2"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? <Spinner size={20} /> : (t ? t('login.signIn', 'Sign In') : 'Sign In')}
            </button>
          </form>
        )}

        {/* Phone OTP form */}
        {tab === 'phone' && (
          <form onSubmit={otpSent ? handleOtpVerify : handleOtpSend} className="flex-col gap-4 flex" noValidate>
            <div className="form-group">
              <label className="label" htmlFor="inp-phone">
                📱 Phone Number
              </label>
              <input
                id="inp-phone"
                className="input"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={otpSent}
                required
              />
            </div>
            {otpSent && (
              <div className="form-group">
                <label className="label" htmlFor="inp-otp">
                  🔢 {t ? t('login.enterOtp', 'Enter 6-digit OTP') : 'Enter 6-digit OTP'}
                </label>
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
              id={`btn-otp-${otpSent ? 'verify' : 'send'}`}
              type="submit"
              className="btn btn-primary btn-lg w-full mt-2"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? <Spinner size={20} />
                : otpSent ? (t ? t('login.verifyOtp', 'Verify OTP & Enter') : 'Verify OTP & Enter')
                : (t ? t('login.sendOtp', 'Send OTP') : 'Send OTP')}
            </button>
            {otpSent && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setOtpSent(false); setOtp(''); }}
              >
                ← Change number
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
