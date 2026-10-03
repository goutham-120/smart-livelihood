import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from './lang.js';
import { api } from './api.js';
import {
  Mic, MicOff, Volume2, Briefcase, User, ShieldCheck, Sparkles, TrendingUp,
  Award, Compass, LogOut, Menu, X, Home, BookOpen, Layers, PhoneCall,
  CheckCircle, AlertCircle, FileText, FolderKanban, Building2, Users, Lock
} from 'lucide-react';

export const QuickDemoBar = () => null;


export const AppSidebar = ({ user, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOfficer = user?.role === 'officer' || user?.role === 'admin';

  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (isOfficer) return true;
    try {
      return localStorage.getItem('pmajay_voice_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [popupMessage, setPopupMessage] = useState(null);
  const popupTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOfficer) return;
    const checkStatus = () => {
      try {
        const val = localStorage.getItem('pmajay_voice_unlocked') === 'true';
        if (val) setIsUnlocked(true);
      } catch {}
    };
    checkStatus();

    // Check with server profile
    api.getProfile().then((res) => {
      const p = res?.profile || res?.data?.profile;
      if (p?.voiceCompleted || (p?.skills && p.skills.length > 0 && localStorage.getItem('pmajay_voice_unlocked') === 'true')) {
        setIsUnlocked(true);
        localStorage.setItem('pmajay_voice_unlocked', 'true');
      }
    }).catch(() => {});

    window.addEventListener('pmajay_voice_unlocked', checkStatus);
    window.addEventListener('storage', checkStatus);
    return () => {
      window.removeEventListener('pmajay_voice_unlocked', checkStatus);
      window.removeEventListener('storage', checkStatus);
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    };
  }, [isOfficer]);

  const triggerLockedPopup = () => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    setPopupMessage("Complete the 2-min conversation with AI Assistant to unlock these.");
    popupTimeoutRef.current = setTimeout(() => {
      setPopupMessage(null);
    }, 4000); // 4 seconds (within 3-5 seconds requirement)
  };

  const lockedPaths = new Set([
    '/opportunities',
    '/skill-gaps',
    '/training',
    '/roadmap',
    '/what-if',
    '/self-employment',
    '/progress'
  ]);

  const beneficiaryNav = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/assistant', label: 'AI Voice Assistant', icon: Mic },
    { to: '/opportunities', label: 'Opportunities', icon: Briefcase },
    { to: '/skill-gaps', label: 'Skill Gaps', icon: Layers },
    { to: '/training', label: 'Certified Training', icon: BookOpen },
    { to: '/roadmap', label: 'Career Roadmap', icon: TrendingUp },
    { to: '/what-if', label: 'What-If Simulator', icon: Compass },
    { to: '/self-employment', label: 'Self-Employment', icon: Award },
    { to: '/progress', label: 'Active Milestones', icon: CheckCircle }
  ];

  const accountNav = [
    { to: '/profile', label: 'Livelihood Profile', icon: User }
  ];

  const channelNav = [
    { to: '/kiosk', label: 'Kiosk Touch Mode', icon: Building2 },
    { to: '/channel-demo', label: 'Channel Simulator', icon: PhoneCall }
  ];

  const adminNav = [
    { to: '/admin/overview', label: 'District Overview', icon: TrendingUp },
    { to: '/admin/beneficiaries', label: 'Beneficiaries', icon: Users },
    { to: '/admin/placements', label: 'Placements', icon: Award },
    { to: '/admin/coordination', label: 'Task Coordination', icon: FolderKanban },
    { to: '/admin/plan', label: 'Perspective Plan', icon: FileText },
    { to: '/admin/directory', label: 'Resource Directory', icon: Building2 }
  ];

  const renderNavGroup = (title, items) => (
    <div>
      <div className="nav-group-title">{title}</div>
      {items.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.to;
        const isLocked = !isUnlocked && lockedPaths.has(item.to);

        return (
          <Link
            key={item.to}
            to={isLocked ? '#' : item.to}
            className={`nav-item ${active ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
            onClick={(e) => {
              if (isLocked) {
                e.preventDefault();
                triggerLockedPopup();
                return;
              }
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            title={isLocked ? "Complete the 2-minute conversation with AI Assistant to unlock these" : item.label}
          >
            <Icon size={18} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {isLocked && (
              <span className="nav-lock-badge" title="Locked">
                <Lock size={13} />
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {popupMessage && (
        <div
          className="locked-popup-toast"
          role="alert"
        >
          <div style={{
            background: 'rgba(217, 119, 6, 0.25)',
            border: '1px solid rgba(217, 119, 6, 0.45)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24',
            flexShrink: 0
          }}>
            <Lock size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '13px', color: '#fbbf24', letterSpacing: '0.2px' }}>
              FEATURE LOCKED
            </div>
            <div style={{ fontSize: '13px', color: '#f1f5f9', marginTop: '2px', fontWeight: 500 }}>
              {popupMessage}
            </div>
          </div>
          <button
            onClick={() => {
              setPopupMessage(null);
              navigate('/assistant');
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '6px 14px', whiteSpace: 'nowrap', marginLeft: '6px' }}
          >
            Talk to AI Assistant &rarr;
          </button>
          <button
            onClick={() => setPopupMessage(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 4px',
              lineHeight: 1
            }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      )}

      <aside className={`app-sidebar ${sidebarOpen ? 'sidebar-open open' : 'sidebar-closed'}`}>
        <div className="app-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <img src="/assets/pm-ajay-logo.png" alt="PM-AJAY Logo" className="app-sidebar-brand-logo" />
            <div>
              <div className="app-sidebar-brand-title">Livelihood Assistant</div>
              <div className="app-sidebar-brand-sub">AI Skilling & Livelihood</div>
            </div>
          </div>
        </div>

        <nav className="app-sidebar-nav">
          {renderNavGroup('Beneficiary', beneficiaryNav)}
          {renderNavGroup('Account', accountNav)}
          {renderNavGroup('Channels', channelNav)}
          {isOfficer && renderNavGroup('District Command', adminNav)}
        </nav>
      </aside>
    </>
  );
};

export const AppHeader = ({ user, onLogout, toggleSidebar, sidebarOpen }) => {
  const location = useLocation();

  const getPageTitle = (path) => {
    if (path.includes('assistant')) return 'Empathetic AI Voice Assistant';
    if (path.includes('opportunities')) return 'Tailored Livelihood Opportunities';
    if (path.includes('skill-gaps')) return 'Skill Gap & Competency Analysis';
    if (path.includes('training')) return 'Certified Skilling Programs';
    if (path.includes('roadmap')) return 'Career Livelihood Roadmap';
    if (path.includes('what-if')) return 'What-If Career Simulator';
    if (path.includes('self-employment')) return 'Micro-Enterprise Business Guide';
    if (path.includes('progress')) return 'Active Livelihood Milestones';
    if (path.includes('profile')) return 'Livelihood Profile';
    if (path.includes('kiosk')) return 'Touch & Voice Kiosk';
    if (path.includes('channel-demo')) return 'Channel Integration Simulator';
    if (path.includes('admin/overview')) return 'District Officer Overview';
    if (path.includes('admin/beneficiaries')) return 'Assisted Beneficiary Registration';
    if (path.includes('admin/placements')) return 'Placements & Enrolment';
    if (path.includes('admin/coordination')) return 'Inter-Agency Task Coordination';
    if (path.includes('admin/plan')) return 'District Perspective Action Plan';
    if (path.includes('admin/directory')) return 'Resource Directory Catalog';
    return 'Livelihood Assistant';
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={toggleSidebar}
          style={{ padding: '6px', display: 'flex', flexShrink: 0 }}
          title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="app-header-title">{getPageTitle(location.pathname)}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-blue">{user.district || 'Warangal'}</span>
            <div style={{ fontSize: '13px', textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{user.role || 'Beneficiary'}</div>
            </div>
            <button onClick={onLogout} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--status-danger)' }} title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>Sign In</Link>
        )}
      </div>
    </header>
  );
};

export const VoiceInput = ({ onSend, isProcessing, voiceState = 'IDLE', errorMessage = null, lang: propLang }) => {
  const { lang: contextLang } = useLang();
  const lang = propLang || contextLang || 'te';
  const [text, setText] = useState('');
  const [currentState, setCurrentState] = useState(voiceState);

  useEffect(() => {
    setCurrentState(voiceState);
  }, [voiceState]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser speech recognition is unavailable. Please type your message in text.');
      return;
    }

    const rec = new SpeechRecognition();
    const langMap = { te: 'te-IN', hi: 'hi-IN', en: 'en-IN' };
    rec.lang = langMap[lang] || 'te-IN';
    rec.onstart = () => setCurrentState('LISTENING');
    rec.onend = () => {
      if (currentState === 'LISTENING') setCurrentState('IDLE');
    };
    rec.onerror = () => setCurrentState('ERROR');
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setText(transcript);
      setCurrentState('PROCESSING');
      onSend(transcript);
    };
    rec.start();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      setCurrentState('PROCESSING');
      onSend(text);
      setText('');
    }
  };

  const getStateText = () => {
    if (isProcessing || currentState === 'PROCESSING') return 'Understanding your response...';
    if (currentState === 'LISTENING') {
      return lang === 'te'
        ? 'తెలుగులో వింటున్నాను... మాట్లాడండి'
        : lang === 'hi'
          ? 'हिंदी में सुन रहे हैं... बोलिए'
          : 'Listening in English... please speak';
    }
    if (currentState === 'SPEAKING') return 'Assistant speaking response...';
    if (currentState === 'ERROR' || errorMessage) return errorMessage || 'Could not recognize audio. Try again or type below.';
    return 'Tap mic to speak or type message below';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: '20px 0', width: '100%' }}>
      <button
        type="button"
        onClick={startListening}
        disabled={isProcessing}
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: currentState === 'LISTENING' ? 'var(--status-danger)' : 'var(--primary-600)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: currentState === 'LISTENING' ? '0 0 24px rgba(220, 38, 38, 0.6)' : 'var(--shadow-md)',
          transition: 'all 0.3s'
        }}
      >
        {currentState === 'LISTENING' ? <MicOff size={38} /> : <Mic size={38} />}
      </button>

      <div style={{ fontSize: '13px', fontWeight: 600, color: currentState === 'ERROR' ? 'var(--status-danger)' : 'var(--text-muted)' }}>
        {getStateText()}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '640px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            lang === 'te'
              ? 'మీ నైపుణ్యాలు, గత పని అనుభవం లేదా నేర్చుకోవాలనుకుంటున్న పనుల గురించి రాయండి...'
              : lang === 'hi'
                ? 'अपने कौशल, पुराने काम या भविष्य के लक्ष्य यहाँ लिखें...'
                : 'Describe your skills, past work, education, or work goals...'
          }
          style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '14px' }}
        />
        <button type="submit" className="btn btn-primary" disabled={isProcessing}>Send</button>
      </form>
    </div>
  );
};

export const Card = ({ title, children, style = {}, className = '' }) => (
  <div className={`card ${className}`} style={style}>
    {title && <h3 className="card-title">{title}</h3>}
    {children}
  </div>
);

export const Badge = ({ children, type = 'blue', style = {} }) => (
  <span className={`badge badge-${type}`} style={style}>
    {children}
  </span>
);

export const Skeleton = ({ height = 16, width = '100%', style = {} }) => (
  <div className="skeleton" style={{ height, width, ...style }} />
);

export const EmptyState = ({ title = 'No Data Found', description = 'There are no items matching your request.', action = null }) => (
  <div className="empty-state">
    <AlertCircle size={36} color="var(--text-subtle)" />
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-desc">{description}</p>
    {action}
  </div>
);

export const ErrorState = ({ message = 'An unexpected error occurred.', onRetry = null }) => (
  <div style={{ padding: '16px', background: '#fee2e2', borderRadius: 'var(--radius-md)', border: '1px solid #fca5a5', color: '#b91c1c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
      <AlertCircle size={18} /> {message}
    </div>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
        Retry
      </button>
    )}
  </div>
);

export const Spinner = ({ size = 24 }) => (
  <div style={{ width: size, height: size, border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
);

export const LanguageSwitcher = () => {
  const { lang, setLang } = useLang();

  return (
    <div className="language-switcher" role="tablist" aria-label="Select Language" style={{ display: 'flex', gap: '4px' }}>
      {[
        { code: 'te', label: 'తెలుగు' },
        { code: 'hi', label: 'हिंदी' },
        { code: 'en', label: 'English' }
      ].map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          className={`btn ${lang === l.code ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '5px 10px', fontSize: '13px', fontWeight: lang === l.code ? 700 : 500 }}
          role="tab"
          aria-selected={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export const SkeletonCard = ({ height = 160 }) => (
  <div className="skeleton skeleton-card" style={{ height }} />
);

export const ReadAloudButton = ({ text }) => {
  const [speaking, setSpeaking] = useState(false);
  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.onend = () => setSpeaking(false);
    uttr.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(uttr);
  };
  return (
    <button onClick={speak} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }} title="Read Aloud">
      <Volume2 size={16} color={speaking ? 'var(--primary-600)' : 'currentColor'} />
      <span>{speaking ? 'Stop' : 'Listen'}</span>
    </button>
  );
};

export const RiskBadge = ({ risk = 'low', level = null, score = null }) => {
  let r = (level || risk || 'low').toLowerCase();
  if (score !== null && score !== undefined) {
    if (score >= 60) r = 'high';
    else if (score >= 30) r = 'medium';
    else r = 'low';
  }
  let type = 'green';
  if (r.includes('high') || r === 'high') type = 'red';
  else if (r.includes('medium') || r === 'medium') type = 'amber';
  return <span className={`badge badge-${type}`}>{r.toUpperCase()} RISK</span>;
};

export const SyntheticBadge = () => null;

export const StatCard = ({ title, label, value, subtext, icon: Icon, color = 'var(--primary-600)' }) => {
  const displayTitle = title || label;
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {Icon && (
        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0, fontSize: typeof Icon === 'string' ? '22px' : undefined }}>
          {typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null) ? <Icon size={24} /> : <span>{Icon}</span>}
        </div>
      )}
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{displayTitle}</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{value}</div>
        {subtext && <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{subtext}</div>}
      </div>
    </div>
  );
};

export const Modal = ({ isOpen, open, onClose, title, children }) => {
  const isShown = isOpen ?? open;
  if (!isShown) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '4px' }}><X size={20} /></button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, open, onClose, onCancel, onConfirm, title = 'Confirm Action', message = 'Are you sure?', danger = false }) => {
  const isShown = isOpen ?? open;
  if (!isShown) return null;
  const handleClose = onClose || onCancel || (() => {});
  return (
    <Modal isOpen={isShown} onClose={handleClose} title={title}>
      <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => { onConfirm(); handleClose(); }}>Confirm</button>
      </div>
    </Modal>
  );
};

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 24px', textAlign: 'center', maxWidth: '540px', margin: '40px auto', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Something went wrong</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred while loading this view.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

