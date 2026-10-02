/* Consent.jsx: Privacy consent page shown before first assistant use
   SIH26097 PM-AJAY Livelihood Assistant */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../ToastContext.jsx';
import { ReadAloudButton, LanguageSwitcher, ConfirmDialog } from '../components.jsx';
import { postConsent, deletePrivacyMe, getPrivacyExport } from '../api.js';
import { useLang } from '../lang.js';
import './Consent.css';

export default function Consent() {
  const { t } = useTranslation();
  const { user, login, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { lang } = useLang();

  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const consentText = `
    ${t('consent.heading')}. ${t('consent.body')}
    ${t('consent.rights')}: ${(t('consent.rightsList', { returnObjects: true }) || []).join('. ')}.
  `;

  const handleAgree = async () => {
    setLoading(true);
    try {
      const res = await postConsent({ given: true, language: lang, version: '1.0' });
      /* Update user in local storage with new consent */
      const updatedUser = { ...user, consent: res.data.consent };
      login(localStorage.getItem('pmajay_token'), updatedUser);
      toast('Thank you! Your consent has been recorded.', 'success');
      if (['admin', 'officer'].includes(user?.role)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      toast(t('common.error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await postConsent({ given: false, language: lang, version: '1.0' });
      logout();
      navigate('/login', { replace: true });
    } catch {
      logout();
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await getPrivacyExport();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pmajay-data-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Your data has been downloaded.', 'success');
    } catch {
      toast(t('common.error'), 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    setConfirmDelete(false);
    try {
      await deletePrivacyMe();
      logout();
      toast(t('consent.dataDeleted'), 'info');
      navigate('/login', { replace: true });
    } catch {
      toast(t('common.error'), 'error');
    }
  };

  return (
    <div className="consent-root">
      <div className="consent-card card-glass">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '2.2rem' }} aria-hidden="true">🔒</span>
            <h1 className="text-2xl font-bold">{t('consent.title')}</h1>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Read aloud button */}
        <div className="mb-4">
          <ReadAloudButton text={consentText} lang={lang} />
        </div>

        {/* Main consent body */}
        <div className="consent-body">
          <h2 className="text-lg font-semibold mb-3">{t('consent.heading')}</h2>
          <p className="text-sm" style={{ lineHeight: 1.9 }}>
            {t('consent.body')}
          </p>

          <div className="divider" />

          <h3 className="font-semibold mb-3">⚖️ {t('consent.rights')}</h3>
          <ul className="consent-rights-list">
            {(t('consent.rightsList', { returnObjects: true }) || []).map((right, i) => (
              <li key={i} className="text-sm">
                <span className="text-accent" aria-hidden="true">✓</span> {right}
              </li>
            ))}
          </ul>

          {/* Zero caste guarantee */}
          <div className="consent-guarantee">
            <span aria-hidden="true">🚫</span>
            <p className="text-sm">
              <strong>Zero Caste Policy:</strong> We never ask for or store your caste. Eligibility is determined only by officer verification and enrollment.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="consent-actions">
          <button
            id="btn-consent-agree"
            className="btn btn-primary btn-lg"
            onClick={handleAgree}
            disabled={loading}
            aria-label={t('consent.agree')}
          >
            ✓ {t('consent.agree')}
          </button>
          <button
            id="btn-consent-decline"
            className="btn btn-secondary"
            onClick={handleDecline}
            disabled={loading}
          >
            {t('consent.decline')}
          </button>
        </div>

        {/* Privacy data actions */}
        <div className="divider" />
        <div className="flex gap-3 flex-wrap">
          <button
            id="btn-export-data"
            className="btn btn-ghost btn-sm"
            onClick={handleExport}
          >
            📥 Download My Data
          </button>
          <button
            id="btn-delete-account"
            className="btn btn-danger btn-sm"
            onClick={() => setConfirmDelete(true)}
          >
            🗑 {t('consent.deleteData')}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        danger
        message={t('consent.confirmDelete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
