import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLang } from './lang.js';
import { api } from './api.js';
import {
  Mic, MicOff, Volume2, Briefcase, User, ShieldCheck, Sparkles, TrendingUp,
  Award, Compass, LogOut, Menu, X, Home, BookOpen, Layers, PhoneCall,
  CheckCircle, AlertCircle, FileText, FolderKanban, Building2, Users
} from 'lucide-react';

export const QuickDemoBar = () => null;


export const AppSidebar = ({ user, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const isOfficer = user?.role === 'officer' || user?.role === 'admin';

  const beneficiaryNav = [
    { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: Home },
    { to: '/assistant', label: t('nav.assistant', 'AI Voice Assistant'), icon: Mic },
    { to: '/opportunities', label: t('nav.opportunities', 'Opportunities'), icon: Briefcase },
    { to: '/skill-gaps', label: t('nav.skillGaps', 'Skill Gaps'), icon: Layers },
    { to: '/training', label: t('nav.training', 'Certified Training'), icon: BookOpen },
    { to: '/roadmap', label: t('nav.roadmap', 'Career Roadmap'), icon: TrendingUp },
    { to: '/what-if', label: t('nav.whatIf', 'What-If Simulator'), icon: Compass },
    { to: '/self-employment', label: t('nav.selfEmployment', 'Self-Employment'), icon: Award },
    { to: '/progress', label: t('nav.progress', 'Active Milestones'), icon: CheckCircle }
  ];

  const accountNav = [
    { to: '/profile', label: t('nav.profile', 'Livelihood Profile'), icon: User }
  ];

  const channelNav = [
    { to: '/kiosk', label: t('nav.kiosk', 'Kiosk Touch Mode'), icon: Building2 },
    { to: '/channel-demo', label: t('nav.channelDemo', 'Channel Simulator'), icon: PhoneCall }
  ];

  const adminNav = [
    { to: '/admin/overview', label: t('nav.adminOverview', 'District Overview'), icon: TrendingUp },
    { to: '/admin/beneficiaries', label: t('nav.adminBeneficiaries', 'Beneficiaries'), icon: Users },
    { to: '/admin/placements', label: t('nav.adminPlacements', 'Placements'), icon: Award },
    { to: '/admin/coordination', label: t('nav.adminCoordination', 'Task Coordination'), icon: FolderKanban },
    { to: '/admin/plan', label: t('nav.adminPlan', 'Perspective Plan'), icon: FileText },
    { to: '/admin/directory', label: t('nav.adminDirectory', 'Resource Directory'), icon: Building2 }
  ];

  const renderNavGroup = (titleKey, defaultTitle, items) => (
    <div>
      <div className="nav-group-title">{t(`nav.${titleKey}`, defaultTitle)}</div>
      {items.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => {
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className={`app-sidebar ${sidebarOpen ? 'sidebar-open open' : 'sidebar-closed'}`}>
      <div className="app-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <img src="/assets/pm-ajay-logo.png" alt="PM-AJAY Logo" className="app-sidebar-brand-logo" />
          <div>
            <div className="app-sidebar-brand-title">{t('appName', 'Livelihood Assistant')}</div>
            <div className="app-sidebar-brand-sub">{t('tagline', 'AI Skilling & Livelihood')}</div>
          </div>
        </div>
      </div>

      <nav className="app-sidebar-nav">
        {renderNavGroup('beneficiary', 'Beneficiary', beneficiaryNav)}
        {renderNavGroup('account', 'Account', accountNav)}
        {renderNavGroup('channels', 'Channels', channelNav)}
        {isOfficer && renderNavGroup('districtCommand', 'District Command', adminNav)}
      </nav>
    </aside>
  );
};

export const AppHeader = ({ user, onLogout, toggleSidebar, sidebarOpen }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const getPageTitle = (path) => {
    if (path.includes('assistant')) return t('pages.assistant', 'Empathetic AI Voice Assistant');
    if (path.includes('opportunities')) return t('pages.opportunities', 'Tailored Livelihood Opportunities');
    if (path.includes('skill-gaps')) return t('pages.skillGaps', 'Skill Gap & Competency Analysis');
    if (path.includes('training')) return t('pages.training', 'Certified Skilling Programs');
    if (path.includes('roadmap')) return t('pages.roadmap', 'Career Livelihood Roadmap');
    if (path.includes('what-if')) return t('pages.whatIf', 'What-If Career Simulator');
    if (path.includes('self-employment')) return t('pages.selfEmployment', 'Micro-Enterprise Business Guide');
    if (path.includes('progress')) return t('pages.progress', 'Active Livelihood Milestones');
    if (path.includes('profile')) return t('pages.profile', 'Livelihood Profile');
    if (path.includes('kiosk')) return t('pages.kiosk', 'Touch & Voice Kiosk');
    if (path.includes('channel-demo')) return t('pages.channelDemo', 'Channel Integration Simulator');
    if (path.includes('admin/overview')) return t('pages.adminOverview', 'District Officer Overview');
    if (path.includes('admin/beneficiaries')) return t('pages.adminBeneficiaries', 'Assisted Beneficiary Registration');
    if (path.includes('admin/placements')) return t('pages.adminPlacements', 'Placements & Enrolment');
    if (path.includes('admin/coordination')) return t('pages.adminCoordination', 'Inter-Agency Task Coordination');
    if (path.includes('admin/plan')) return t('pages.adminPlan', 'District Perspective Action Plan');
    if (path.includes('admin/directory')) return t('pages.adminDirectory', 'Resource Directory Catalog');
    return t('pages.defaultTitle', 'Livelihood Assistant');
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <LanguageSwitcher />
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

export const VoiceInput = ({ onSend, isProcessing, voiceState = 'IDLE', errorMessage = null }) => {
  const { lang, setLang } = useLang();
  const [text, setText] = useState('');
  const [currentState, setCurrentState] = useState(voiceState);
  const [detectedLang, setDetectedLang] = useState(null);
  const [localError, setLocalError] = useState(errorMessage);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (!isProcessing) {
      setCurrentState(voiceState || 'IDLE');
    }
  }, [isProcessing, voiceState]);

  useEffect(() => {
    setLocalError(errorMessage);
  }, [errorMessage]);

  const startListening = async () => {
    setLocalError(null);
    audioChunksRef.current = [];
    isListeningRef.current = true;
    setCurrentState('LISTENING');

    let candidateTranscript = '';

    // 1. Browser Speech Recognition candidate listener (for zero-latency interim tokens)
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'te-IN';
        rec.onresult = (e) => {
          const trans = Array.from(e.results).map((r) => r[0].transcript).join(' ');
          candidateTranscript = trans;
          setText(trans);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              stopListening();
            }
          }, 2000);
        };
        rec.onerror = () => {};
        rec.start();
        recognitionRef.current = rec;
      } catch (e) {}
    }

    // 2. Real Microphone MediaRecorder
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone audio recording is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await handleAudioCaptured(audioBlob, candidateTranscript, mimeType);
      };

      mediaRecorder.start(250);
    } catch (err) {
      setCurrentState('ERROR');
      setLocalError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access in browser settings.'
          : 'Could not access microphone: ' + (err.message || 'Unknown error')
      );
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const handleAudioCaptured = async (audioBlob, candidateTranscript, mimeType) => {
    setCurrentState('PROCESSING');

    try {
      let audioBase64 = null;
      if (audioBlob && audioBlob.size > 500) {
        audioBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(audioBlob);
        });
      }

      const sttResult = await api.speechToText({
        audioBase64,
        mimeType,
        transcript: candidateTranscript,
        language: 'auto'
      });

      const finalTranscript = sttResult.transcript || candidateTranscript;
      if (!finalTranscript || !finalTranscript.trim()) {
        setCurrentState('ERROR');
        setLocalError('No clear speech detected. Please speak clearly into your microphone.');
        return;
      }

      const detected = {
        code: sttResult.language || 'en',
        name: sttResult.languageName || 'English',
        nativeName: sttResult.nativeName || 'English',
        confidence: Math.round((sttResult.confidence || 0.9) * 100)
      };

      setDetectedLang(detected);
      setText(finalTranscript);
      setCurrentState('LANGUAGE DETECTED');

      // Update global language context if available
      if (detected.code && (detected.code === 'te' || detected.code === 'hi' || detected.code === 'en')) {
        setLang && setLang(detected.code);
      }

      // Hand off to parent assistant component
      setTimeout(() => {
        setCurrentState('THINKING');
        onSend(finalTranscript, detected.code, detected);
      }, 400);
    } catch (err) {
      setCurrentState('ERROR');
      setLocalError(err.response?.data?.error || err.message || 'Speech recognition failed.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      const msgText = text.trim();
      setText('');
      setCurrentState('THINKING');
      onSend(msgText, detectedLang?.code || lang, detectedLang);
    }
  };

  const getStateText = () => {
    if (isProcessing || currentState === 'PROCESSING') return 'Processing audio with Indic ASR...';
    if (currentState === 'LISTENING') return 'Listening... Speak in Telugu, Hindi, Tamil, English, or any Indian language';
    if (currentState === 'LANGUAGE DETECTED') return `Language detected: ${detectedLang?.name} (${detectedLang?.nativeName}) • ${detectedLang?.confidence}%`;
    if (currentState === 'THINKING') return 'Formulating response in your language...';
    if (currentState === 'SPEAKING') return 'Assistant speaking response...';
    if (currentState === 'ERROR' || localError) return localError || 'Could not capture speech. Try again or type below.';
    return 'Tap mic to speak in any language or type message below';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', margin: '16px 0', width: '100%' }}>
      <button
        type="button"
        onClick={currentState === 'LISTENING' ? stopListening : startListening}
        disabled={isProcessing || currentState === 'PROCESSING' || currentState === 'THINKING'}
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: currentState === 'LISTENING' ? 'var(--status-danger)' : currentState === 'SPEAKING' ? 'var(--accent-green, #10b981)' : 'var(--primary-600)',
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

      {detectedLang && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-50, #eff6ff)', border: '1px solid var(--primary-200, #bfdbfe)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', color: 'var(--primary-700, #1d4ed8)', fontWeight: 600 }}>
          <Sparkles size={14} /> Spoken Language: <strong>{detectedLang.name}</strong> ({detectedLang.nativeName}) • {detectedLang.confidence}%
        </div>
      )}

      <div style={{ fontSize: '13px', fontWeight: 600, color: currentState === 'ERROR' ? 'var(--status-danger)' : 'var(--text-muted)', textAlign: 'center' }}>
        {getStateText()}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '640px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your skills, past work, education, or work goals in any language..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '14px' }}
        />
        <button type="submit" className="btn btn-primary" disabled={isProcessing || !text.trim()}>Send</button>
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

  const languages = [
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'en', label: 'English' }
  ];

  return (
    <div
      className="language-switcher"
      role="tablist"
      aria-label="Select Language"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        background: '#EEE7D9',
        padding: '3px',
        borderRadius: '8px',
        border: '1px solid #E1D7C8'
      }}
    >
      {languages.map((l) => {
        const active = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: active ? 700 : 500,
              color: active ? '#FEFCF6' : '#4F3728',
              background: active ? '#CA6603' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap'
            }}
            role="tab"
            aria-selected={active}
          >
            {l.label}
          </button>
        );
      })}
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

export const RiskBadge = ({ risk = 'low', level = null }) => {
  const r = (level || risk || 'low').toLowerCase();
  let type = 'green';
  if (r.includes('high') || r === 'high') type = 'red';
  else if (r.includes('medium') || r === 'medium') type = 'amber';
  return <span className={`badge badge-${type}`}>{r.toUpperCase()} RISK</span>;
};

export const SyntheticBadge = () => null;

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'var(--primary-600)' }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    {Icon && (
      <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        <Icon size={24} />
      </div>
    )}
    <div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>{value}</div>
      {subtext && <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{subtext}</div>}
    </div>
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
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

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message = 'Are you sure?' }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { onConfirm(); onClose(); }}>Confirm</button>
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

