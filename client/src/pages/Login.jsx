/* Login.jsx: Auth page with email/password and phone OTP tabs
   SIH26097 PM-AJAY Livelihood Assistant */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { LanguageSwitcher, Spinner } from '../components.jsx';
import { authLogin, authOtpSend, authOtpVerify, authDemoLogin } from '../api.js';
import './Login.css';

const DEMO_ROLES = [
  { role: 'beneficiary', district: 'Warangal', label: '👤 Beneficiary (Warangal)' },
  { role: 'officer',     district: 'Warangal', label: '🏛 Officer (Warangal)' },
  { role: 'officer',     district: 'Adilabad', label: '🏛 Officer (Adilabad)' },
  { role: 'admin',       district: '',         label: '⚙️ Admin' },
];

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState('email');
  const [loading, setLoading] = useState(false);

  /* Email tab state */
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  /* OTP tab state */
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleAfterLogin = (token, user) => {
    login(token, user);
    /* If user has no consent, go to consent page first */
    if (!user.consent?.given) {
      navigate('/consent', { replace: true });
    } else if (['admin', 'officer'].includes(user.role)) {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authLogin({ identifier, password });
      handleAfterLogin(res.data.token, res.data.user);
    } catch (err) {
      toast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSend = async (e) => {
    e.preventDefault();
    if (!phone) return toast('Enter your phone number first', 'warning');
    setLoading(true);
    try {
      await authOtpSend(phone);
      setOtpSent(true);
      toast(t('login.otpSent'), 'success');
    } catch (err) {
      toast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authOtpVerify({ phone, otp });
      handleAfterLogin(res.data.token, res.data.user);
    } catch (err) {
      toast(err.response?.data?.error || t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role, district) => {
    setLoading(true);
    try {
      const res = await authDemoLogin(role, district);
      handleAfterLogin(res.data.token, res.data.user);
    } catch (err) {
      toast(err.response?.data?.error || t('common.error'), 'error');
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
              <h1 className="text-xl font-bold text-primary">{t('appName')}</h1>
              <p className="text-xs text-muted">{t('tagline')}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>

        <h2 className="text-2xl font-bold mb-1">{t('login.title')}</h2>
        <p className="text-muted text-sm mb-6">{t('login.subtitle')}</p>

        {/* Tab selector */}
        <div className="tab-group mb-6" role="tablist" aria-label="Login method">
          {['email', 'phone', 'demo'].map((t2) => (
            <button
              key={t2}
              className={`tab ${tab === t2 ? 'active' : ''}`}
              role="tab"
              aria-selected={tab === t2}
              id={`tab-${t2}`}
              onClick={() => { setTab(t2); setOtpSent(false); }}
            >
              {t2 === 'email' ? t('login.emailTab')
                : t2 === 'phone' ? t('login.phoneTab')
                : t('login.demoTab')}
            </button>
          ))}
        </div>

        {/* Email / password form */}
        {tab === 'email' && (
          <form onSubmit={handleEmailLogin} className="flex-col gap-4 flex" noValidate>
            <div className="form-group">
              <label className="label" htmlFor="inp-identifier">
                {t('login.emailOrPhone')}
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
                {t('login.password')}
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
              {loading ? <Spinner size={20} /> : t('login.signIn')}
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
                  🔢 {t('login.enterOtp')}
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
                : otpSent ? t('login.verifyOtp') : t('login.sendOtp')}
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

        {/* Demo quick login */}
        {tab === 'demo' && (
          <div className="flex-col gap-3 flex">
            <p className="text-sm text-muted mb-2">
              🧪 Select a demo persona. No registration needed.
            </p>
            {DEMO_ROLES.map(({ role, district, label }) => (
              <button
                key={`${role}-${district}`}
                id={`btn-demo-${role}-${district || 'admin'}`}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: 'var(--sp-4)' }}
                disabled={loading}
                onClick={() => handleDemoLogin(role, district)}
              >
                {loading ? <Spinner size={18} /> : null}
                {label}
              </button>
            ))}
            <p className="text-xs text-muted mt-2 text-center">
              Requires demo seed data. Run <code>npm run seed:demo</code> in the server.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
