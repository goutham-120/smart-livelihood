import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic, MicOff, Volume2, Briefcase, User, ShieldCheck, Sparkles, TrendingUp, Award, Compass, HelpCircle, LogOut } from 'lucide-react';

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
    <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'linear-gradient(135deg, #ea580c, #4f46e5)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>PM-AJAY</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Livelihood Assistant</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>AI Voice Skilling & Mapping</div>
        </div>
      </Link>

      <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/assistant" style={{ fontWeight: 600, color: location.pathname === '/assistant' ? '#4f46e5' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mic size={16} /> Voice Assistant
        </Link>
        <Link to="/opportunities" style={{ fontWeight: 600, color: location.pathname === '/opportunities' ? '#4f46e5' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Briefcase size={16} /> Opportunities
        </Link>
        <Link to="/progress" style={{ fontWeight: 600, color: location.pathname === '/progress' ? '#4f46e5' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={16} /> Progress
        </Link>
        <Link to="/what-if" style={{ fontWeight: 600, color: location.pathname === '/what-if' ? '#4f46e5' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Compass size={16} /> What-If Sim
        </Link>
        {isOfficer && (
          <Link to="/dashboard" style={{ fontWeight: 600, color: location.pathname === '/dashboard' ? '#4f46e5' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} /> Officer Cockpit
          </Link>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{user.name} ({user.role})</span>
            <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }} title="Logout">
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
          background: isListening ? '#dc2626' : '#4f46e5',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isListening ? '0 0 20px rgba(220,38,38,0.5)' : '0 4px 12px rgba(79,70,229,0.3)',
          transition: 'all 0.3s'
        }}
      >
        {isListening ? <MicOff size={36} /> : <Mic size={36} />}
      </button>

      <div style={{ fontSize: '13px', color: '#64748b' }}>
        {isProcessing ? 'AI analyzing response...' : isListening ? 'Listening in Telugu / Hindi / English...' : 'Tap mic to speak or type below'}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '600px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your skills, past work, or interests..."
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
        />
        <button type="submit" className="btn btn-primary" disabled={isProcessing}>Send</button>
      </form>
    </div>
  );
};
