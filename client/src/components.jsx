/* components.jsx: Shared UI components for SIH26097 PM-AJAY
   Provides: Spinner, SkeletonCard, EmptyState, SyntheticBadge,
   ReadAloudButton, LanguageSwitcher, RiskBadge, ProgressBar,
   Modal, ConfirmDialog */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from './lang.js';

/* Spinner */
export function Spinner({ size = 24, color = 'var(--color-saffron)' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{
        animation: 'spin 0.8s linear infinite',
        display: 'block',
      }}
      aria-label="Loading"
      role="img"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

/* Skeleton card placeholder */
export function SkeletonCard({ rows = 3, height = 120 }) {
  return (
    <div className="card" aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
      <div className="skeleton" style={{ height: 20, width: '60%' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 14, width: `${80 - i * 15}%` }} />
      ))}
      <div className="skeleton" style={{ height: 36, width: '40%', marginTop: 'var(--sp-2)' }} />
    </div>
  );
}

/* Empty state */
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" role="img" aria-hidden="true">{icon}</div>
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {description && <p className="text-muted text-sm" style={{ maxWidth: 360 }}>{description}</p>}
      {action}
    </div>
  );
}

/* Badge shown when isSynthetic data is displayed */
export function SyntheticBadge() {
  const { t } = useTranslation();
  return (
    <span className="badge badge-synthetic" title="This is illustrative data for demonstration purposes">
      🔬 {t('common.synthetic')}
    </span>
  );
}

/* Risk badge with color coding */
export function RiskBadge({ score }) {
  if (score == null) return null;
  let cls = 'badge-success';
  let label = 'Low Risk';
  if (score >= 60) { cls = 'badge-danger'; label = 'High Risk'; }
  else if (score >= 30) { cls = 'badge-warning'; label = 'Medium Risk'; }
  return (
    <span className={`badge ${cls}`}>
      {score >= 60 ? '⚠ ' : score >= 30 ? '● ' : '✓ '}
      {label} ({score}/100)
    </span>
  );
}

/* Read aloud button using Web Speech API */
export function ReadAloudButton({ text, lang = 'en' }) {
  const { t } = useTranslation();
  const [speaking, setSpeaking] = useState(false);

  const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };

  const handleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const pageText = text || document.body.innerText;
    const utterance = new SpeechSynthesisUtterance(pageText.slice(0, 4000));
    utterance.lang = langMap[lang] || 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [speaking, text, lang]);

  return (
    <button
      className={`btn btn-ghost btn-sm ${speaking ? 'text-primary' : ''}`}
      onClick={handleSpeak}
      aria-label={speaking ? 'Stop reading' : t('common.readPage')}
      title={speaking ? 'Stop reading' : t('common.readPage')}
      id="btn-read-aloud"
    >
      {speaking ? '⏹' : '🔊'} {speaking ? 'Stop' : t('common.readPage')}
    </button>
  );
}

/* Language switcher pill */
export function LanguageSwitcher() {
  const { lang, setLang, languages } = useLang();

  return (
    <div
      className="tab-group"
      role="group"
      aria-label="Choose language"
      style={{ display: 'inline-flex', width: 'auto' }}
    >
      {languages.map((l) => (
        <button
          key={l.code}
          className={`tab ${lang === l.code ? 'active' : ''}`}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          id={`lang-btn-${l.code}`}
          title={`Switch to ${l.label}`}
        >
          {l.flag} {l.native}
        </button>
      ))}
    </div>
  );
}

/* Modal overlay */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;

  const widths = { sm: 400, md: 600, lg: 800 };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed', inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--sp-4)',
        background: 'hsl(222 28% 4% / 0.85)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: widths[size], maxHeight: '90dvh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="modal-title" className="text-xl font-bold">{title}</h2>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
            aria-label="Close dialog"
            id="btn-modal-close"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* Confirm dialog */
export function ConfirmDialog({ open, onConfirm, onCancel, message, danger = false }) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <Modal open title={t('common.confirm')} onClose={onCancel} size="sm">
      <p className="text-sm mb-6" style={{ lineHeight: 1.7 }}>{message}</p>
      <div className="flex gap-3 justify-between">
        <button className="btn btn-secondary flex-1" onClick={onCancel} id="btn-confirm-cancel">
          {t('common.cancel')}
        </button>
        <button
          className={`btn flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          id="btn-confirm-ok"
        >
          {t('common.confirm')}
        </button>
      </div>
    </Modal>
  );
}

/* Progress bar component */
export function ProgressBar({ value = 0, max = 100, label, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-muted mb-1">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color || undefined }}
        />
      </div>
    </div>
  );
}

/* Stat card for dashboard metrics */
export function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color || 'var(--color-saffron)'}` }}>
      <div className="flex items-center gap-3 mb-2">
        <span style={{ fontSize: '1.5rem' }} aria-hidden="true">{icon}</span>
        <span className="text-sm text-muted font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold" style={{ color: color || 'var(--color-saffron)' }}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}
