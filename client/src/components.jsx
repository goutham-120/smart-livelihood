import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic, MicOff, Volume2, Briefcase, User, ShieldCheck, Sparkles, TrendingUp, Award, Compass, HelpCircle, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLang } from './lang.js';

export const QuickDemoBar = ({ onLogin }) => {
  return (
    <div style={{ background: '#0f172a', color: '#fff', padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 600 }}>
        <Sparkles size={14} />
        <span>Quick Demo Switcher</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => onLogin('beneficiary', 'Warangal')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
          Beneficiary (Warangal)
        </button>
        <button onClick={() => onLogin('officer', 'Warangal')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
          Officer (Warangal)
        </button>
        <button onClick={() => onLogin('officer', 'Adilabad')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
          Officer (Adilabad)
        </button>
        <button onClick={() => onLogin('admin', 'Warangal')} style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
          Admin (Ministry)
        </button>
      </div>
    </div>
  );
};

export const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const isOfficer = user?.role === 'officer' || user?.role === 'admin';

  return (
    <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'linear-gradient(135deg, #ea580c, #4f46e5)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>PM-AJAY</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#f8fafc' }}>Livelihood Assistant</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>AI Voice Skilling & Mapping</div>
        </div>
      </Link>

      <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/assistant" style={{ fontWeight: 600, color: location.pathname === '/assistant' ? '#fbbf24' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mic size={16} /> Voice Assistant
        </Link>
        <Link to="/opportunities" style={{ fontWeight: 600, color: location.pathname === '/opportunities' ? '#fbbf24' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Briefcase size={16} /> Opportunities
        </Link>
        <Link to="/progress" style={{ fontWeight: 600, color: location.pathname === '/progress' ? '#fbbf24' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={16} /> Progress
        </Link>
        <Link to="/what-if" style={{ fontWeight: 600, color: location.pathname === '/what-if' ? '#fbbf24' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={16} /> What-If Sim
        </Link>
        {isOfficer && (
          <Link to="/dashboard" style={{ fontWeight: 600, color: location.pathname === '/dashboard' ? '#fbbf24' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} /> Officer Cockpit
          </Link>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{user.name} ({user.role})</span>
            <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>Sign In</Link>
        )}
      </div>
    </header>
  );
};

export const VoiceInput = ({ onSend, isProcessing }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser speech recognition unavailable. Please type your message.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'te-IN'; // Default Telugu (and Indic mix)
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      onSend(transcript);
    };
    rec.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '20px 0' }}>
      <button
        onClick={startListening}
        disabled={isProcessing}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isListening ? '#dc2626' : '#ea580c',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isListening ? '0 0 20px rgba(220,38,38,0.5)' : '0 4px 12px rgba(234,88,12,0.3)',
          transition: 'all 0.3s'
        }}
      >
        {isListening ? <MicOff size={36} /> : <Mic size={36} />}
      </button>

      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
        {isProcessing ? 'AI analyzing response...' : isListening ? 'Listening in Telugu / Hindi / English...' : 'Tap mic to speak or type below'}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '600px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your skills, past work, or interests..."
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#f8fafc', fontSize: '14px' }}
        />
        <button type="submit" className="btn btn-primary" disabled={isProcessing}>Send</button>
      </form>
    </div>
  );
};

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
      🔬 {t ? t('common.synthetic', 'Demo Data') : 'Demo Data'}
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
      aria-label={speaking ? 'Stop reading' : (t ? t('common.readPage', 'Read page') : 'Read page')}
      title={speaking ? 'Stop reading' : (t ? t('common.readPage', 'Read page') : 'Read page')}
      id="btn-read-aloud"
    >
      {speaking ? '⏹' : '🔊'} {speaking ? 'Stop' : (t ? t('common.readPage', 'Read page') : 'Read page')}
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
    <Modal open title={t ? t('common.confirm', 'Confirm') : 'Confirm'} onClose={onCancel} size="sm">
      <p className="text-sm mb-6" style={{ lineHeight: 1.7 }}>{message}</p>
      <div className="flex gap-3 justify-between">
        <button className="btn btn-secondary flex-1" onClick={onCancel} id="btn-confirm-cancel">
          {t ? t('common.cancel', 'Cancel') : 'Cancel'}
        </button>
        <button
          className={`btn flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          id="btn-confirm-ok"
        >
          {t ? t('common.confirm', 'Confirm') : 'Confirm'}
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
