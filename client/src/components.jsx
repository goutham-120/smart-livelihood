import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Volume2, Briefcase, User, ShieldCheck, Sparkles, TrendingUp,
  Award, Compass, LogOut, Menu, X, Home, BookOpen, Layers, PhoneCall,
  CheckCircle, AlertCircle, FileText, FolderKanban, Building2, Users
} from 'lucide-react';

export const QuickDemoBar = ({ onLogin }) => {
  return (
    <div style={{ background: '#0f172a', color: '#fff', padding: '8px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 600 }}>
        <Sparkles size={14} />
        <span>SIH26097 Demo Mode Switcher</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => onLogin('beneficiary', 'Warangal')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          Beneficiary (Warangal)
        </button>
        <button onClick={() => onLogin('officer', 'Warangal')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          Officer (Warangal)
        </button>
        <button onClick={() => onLogin('officer', 'Adilabad')} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          Officer (Adilabad)
        </button>
        <button onClick={() => onLogin('admin', 'Warangal')} style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}>
          Admin (Ministry)
        </button>
      </div>
    </div>
  );
};

export const AppSidebar = ({ user, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const isOfficer = user?.role === 'officer' || user?.role === 'admin';

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

  return (
    <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="app-sidebar-header">
        <span className="app-sidebar-brand-badge">PM-AJAY</span>
        <div>
          <div className="app-sidebar-brand-title">Livelihood Assistant</div>
          <div className="app-sidebar-brand-sub">AI Skilling & Livelihood</div>
        </div>
      </div>

      <nav className="app-sidebar-nav">
        <div>
          <div className="nav-group-title">Beneficiary</div>
          {beneficiaryNav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div>
          <div className="nav-group-title">Account</div>
          {accountNav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div>
          <div className="nav-group-title">Channels</div>
          {channelNav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {isOfficer && (
          <div>
            <div className="nav-group-title">District Command</div>
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
};

export const AppHeader = ({ user, onLogout, toggleMobileNav }) => {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="btn btn-ghost" onClick={toggleMobileNav} style={{ padding: '6px', display: 'flex' }}>
          <Menu size={20} />
        </button>
        <h1 className="app-header-title">{getPageTitle(location.pathname)}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-blue">{user.district || 'Warangal'}</span>
            <div style={{ fontSize: '13px', textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{user.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'capitalize' }}>{user.role}</div>
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
    rec.lang = 'te-IN';
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
    if (currentState === 'LISTENING') return 'Listening in Telugu / Hindi / English...';
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
          placeholder="Describe your skills, past work, education, or work goals..."
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
