import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  Tv
} from 'lucide-react';
import './Assistant.css';

const STAGES = [
  { id: 'greeting_consent', label: 'Consent' },
  { id: 'family_occupation', label: 'Family' },
  { id: 'current_livelihood', label: 'Work' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'interests', label: 'Interests' },
  { id: 'mobility_constraints', label: 'Mobility' },
  { id: 'employment_preference', label: 'Track' },
  { id: 'location', label: 'Location' },
  { id: 'income_goal', label: 'Income' },
  { id: 'confirmation', label: 'Confirm' }
];

const LANGUAGES = [
  { code: 'te', name: 'Telugu', native: 'తెలుగు', speech: 'te-IN' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', speech: 'hi-IN' },
  { code: 'en', name: 'English', native: 'English', speech: 'en-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', speech: 'ta-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', speech: 'kn-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', speech: 'mr-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', speech: 'bn-IN' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', speech: 'or-IN' }
];

const DIALECT_HINTS = {
  te: [
    { id: 'telangana', label: 'Telangana (Warangal, Adilabad, Nizamabad)' },
    { id: 'rayalaseema', label: 'Rayalaseema (Kurnool, Anantapur)' },
    { id: 'coastal', label: 'Coastal Andhra (Krishna, Guntur)' },
    { id: 'standard', label: 'Standard Telugu' }
  ],
  hi: [
    { id: 'standard', label: 'Standard Everyday Hindi' },
    { id: 'bhojpuri', label: 'Bhojpuri dialect pattern' },
    { id: 'awadhi', label: 'Awadhi dialect pattern' },
    { id: 'marwari', label: 'Marwari and Rajasthani' },
    { id: 'chhattisgarhi', label: 'Chhattisgarhi regional' }
  ],
  en: [
    { id: 'indian', label: 'Indian English' }
  ]
};

export const Assistant = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [language, setLanguage] = useState('te');
  const [dialect, setDialect] = useState('telangana');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'నమస్కారం! PM AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. మీ నైపుణ్యాలు మరియు అనుభవాన్ని గుర్తించి ఉచిత NSQF శిక్షణ మరియు వ్యాపార పథకాలను సిఫార్సు చేయడానికి మేము మాట్లాడవచ్చా? సరే అయితే అవును అని చెప్పండి.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [currentStage, setCurrentStage] = useState('greeting_consent');
  const [inputText, setInputText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);

  // Profile and Skills tracking
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [matchedOpportunities, setMatchedOpportunities] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  // Officer Assisted Mode
  const [forUserId, setForUserId] = useState('');
  const [assistedBeneficiaries, setAssistedBeneficiaries] = useState([]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText]);

  // Initial load user and profile
  useEffect(() => {
    api.getMe().then((res) => {
      if (res.user) {
        setCurrentUser(res.user);
        if (res.profile?.skills) {
          setExtractedSkills(res.profile.skills);
        }
        if (res.profile) {
          setProfileData(res.profile);
          if (res.profile.language) setLanguage(res.profile.language);
          if (res.profile.dialect) setDialect(res.profile.dialect);
        }

        // If officer or admin, load district beneficiaries list
        if (res.user.role === 'officer' || res.user.role === 'admin') {
          fetch('/api/officer/beneficiaries', {
            headers: { Authorization: `Bearer ${localStorage.getItem('pmajay_token')}` }
          })
            .then((bRes) => bRes.json())
            .then((bData) => {
              if (bData.beneficiaries) {
                setAssistedBeneficiaries(bData.beneficiaries);
              }
            })
            .catch(() => {});
        }
      }
    }).catch(() => {});
  }, []);

  // Update dialect choices when language changes
  useEffect(() => {
    const hints = DIALECT_HINTS[language] || [];
    if (hints.length > 0 && !hints.some((h) => h.id === dialect)) {
      setDialect(hints[0].id);
    }
  }, [language]);

  // Text to speech playback using browser speech synthesis
  const speakText = (textToSpeak, langCode) => {
    if (!voicePlaybackEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langObj = LANGUAGES.find((l) => l.code === langCode);
    utterance.lang = langObj ? langObj.speech : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech Recognition Handler
  const startListening = () => {
    setSpeechError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Web Speech is not supported on this browser. Please type your message.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const langObj = LANGUAGES.find((l) => l.code === language);
      recognition.lang = langObj ? langObj.speech : 'te-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      recognition.onresult = (e) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            final += e.results[i][0].transcript;
          } else {
            interim += e.results[i][0].transcript;
          }
        }
        setInterimText(interim);
        if (final) {
          setInterimText('');
          setInputText(final);
          handleSendMessage(final);
        }
      };

      recognition.onerror = (e) => {
        setIsListening(false);
        setInterimText('');
        if (e.error === 'not-allowed') {
          setSpeechError('Microphone permission blocked. Please enable mic access.');
        } else if (e.error !== 'no-speech') {
          setSpeechError(`Speech recognition notice: ${e.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
      setSpeechError('Microphone could not be started. Please try typing.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Send message to backend assistant router
  const handleSendMessage = async (textToSend) => {
    const text = String(textToSend || inputText).trim();
    if (!text) return;

    setInputText('');
    setInterimText('');
    setSpeechError('');

    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const payload = {
        text,
        lang: language,
        dialect,
        channel: 'web',
        forUserId: forUserId || undefined
      };

      const res = await fetch('/api/assistant/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('pmajay_token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.replyText) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        speakText(data.replyText, language);
      }

      if (data.stage) {
        setCurrentStage(data.stage);
      }

      if (data.isComplete) {
        setIsComplete(true);
      }

      if (data.extractedSkills && data.extractedSkills.length > 0) {
        setExtractedSkills((prev) => Array.from(new Set([...prev, ...data.extractedSkills])));
      }

      if (data.updatedProfile) {
        setProfileData(data.updatedProfile);
      }

      if (data.matchedOpportunities && data.matchedOpportunities.length > 0) {
        setMatchedOpportunities(data.matchedOpportunities);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'మీ మాట వినబడింది. మీ సమాచారం నమోదు చేసుకుంటున్నాము. దయచేసి కొనసాగించండి.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetSession = async () => {
    try {
      await fetch('/api/assistant/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('pmajay_token')}`
        },
        body: JSON.stringify({ forUserId: forUserId || undefined })
      });
      setCurrentStage('greeting_consent');
      setIsComplete(false);
      setMessages([
        {
          sender: 'ai',
          text: 'నమస్కారం! PM AJAY నైపుణ్య సంభాషణ తిరిగి ప్రారంభమైంది. మీ వివరాలు నమోదు చేయడానికి సిద్ధంగా ఉన్నారా? అవును అని చెప్పండి.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {}
  };

  const currentStageIndex = STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="assistant-container">
      {/* Header */}
      <div className="assistant-header">
        <h1 className="assistant-title">
          <Sparkles size={24} color="#ea580c" />
          Empathetic Multilingual Voice Assistant
        </h1>
        <p className="assistant-subtitle">
          PM AJAY GIA Livelihood and NSQF Skilling Navigator
        </p>
      </div>

      {/* 11 Stage Progression Tracker */}
      <div className="stage-tracker">
        {STAGES.map((stg, idx) => {
          const isCurrent = stg.id === currentStage;
          const isDone = currentStageIndex > idx || isComplete;
          return (
            <div
              key={stg.id}
              className={`stage-step ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
            >
              <div className="stage-circle">
                {isDone ? '✓' : idx + 1}
              </div>
              <span>{stg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Top Controls Bar */}
      <div className="controls-bar">
        <div className="selector-group">
          {/* Language Selector */}
          <select
            className="select-control"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.native} ({l.name})
              </option>
            ))}
          </select>

          {/* Regional Dialect Selector */}
          {DIALECT_HINTS[language] && (
            <select
              className="select-control"
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
            >
              {DIALECT_HINTS[language].map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          )}

          {/* Officer Assisted Mode Selector */}
          {(currentUser?.role === 'officer' || currentUser?.role === 'admin') && (
            <select
              className="select-control"
              value={forUserId}
              onChange={(e) => setForUserId(e.target.value)}
              style={{ background: '#fef3c7', borderColor: '#d97706' }}
            >
              <option value="">Assisted Mode: Own Account</option>
              {assistedBeneficiaries.map((b) => (
                <option key={b.user._id} value={b.user._id}>
                  Assisting: {b.user.name} ({b.user.phone || b.user.district})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="selector-group">
          {/* Audio Speech Toggle */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => setVoicePlaybackEnabled(!voicePlaybackEnabled)}
            title="Toggle Spoken Audio Responses"
          >
            {voicePlaybackEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {voicePlaybackEnabled ? 'Voice On' : 'Voice Muted'}
          </button>

          {/* Reset Conversation */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={handleResetSession}
            title="Restart Assessment"
          >
            <RefreshCw size={14} /> Restart
          </button>
        </div>
      </div>

      {/* Main Dialogue Window */}
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`message-bubble ${m.sender === 'user' ? 'user' : 'assistant'}`}>
              <div>{m.text}</div>
              <div className="message-time">{m.time}</div>
            </div>
          ))}

          {isProcessing && (
            <div className="message-bubble assistant" style={{ fontStyle: 'italic', opacity: 0.8 }}>
              AI Assistant is thinking in your language...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Control Ingress Panel */}
        <div className="voice-control-panel">
          {speechError && (
            <div className="error-banner">
              <AlertCircle size={14} /> {speechError}
            </div>
          )}

          {interimText && (
            <div className="interim-box">
              Hearing: "{interimText}"
            </div>
          )}

          <div className="voice-buttons-row">
            <button
              type="button"
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              title={isListening ? 'Tap to complete speech' : 'Tap to speak'}
            >
              {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>

            {isListening && (
              <button
                type="button"
                className="stop-button"
                onClick={stopListening}
                title="Stop Recording"
              >
                <Square size={18} />
              </button>
            )}
          </div>

          <div style={{ fontSize: '13px', color: '#64748b' }}>
            {isListening ? 'Listening in selected language... Speak naturally' : 'Tap mic to speak or type in any Indian language'}
          </div>

          {/* Text input form fallback */}
          <form
            className="input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
          >
            <input
              type="text"
              className="text-input-field"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your skills, past work, tools used, or answer the question..."
              disabled={isProcessing}
            />
            <button type="submit" className="btn btn-primary" disabled={isProcessing || !inputText.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Extracted Skills and Risk Indicators */}
      {extractedSkills.length > 0 && (
        <div className="skills-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Discovered NSQF Competencies ({extractedSkills.length})
              </div>
              <div className="skills-badge-list">
                {extractedSkills.map((sk, idx) => (
                  <span key={idx} className="badge badge-blue">
                    {sk.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {profileData && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-green">
                  Risk Score: {profileData.riskScore || 0}/100
                </span>
                <Link to="/opportunities" className="btn btn-primary" style={{ fontSize: '12px' }}>
                  Explore Opportunities <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation and Matched Pathways View */}
      {isComplete && matchedOpportunities.length > 0 && (
        <div className="card" style={{ marginTop: '20px', background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#15803d', marginBottom: '10px' }}>
            Recommended Career Pathways for {profileData?.district || 'Your District'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {matchedOpportunities.map((op) => (
              <div key={op.occupationKey || op.id} className="card" style={{ background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className={`badge ${op.track === 'self' ? 'badge-amber' : 'badge-green'}`}>
                    {op.track === 'self' ? 'Self Employment' : 'Wage Placement'}
                  </span>
                  <span className="badge badge-blue">NSQF {op.nsqfLevel}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', margin: '4px 0' }}>{op.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Alignment: {op.matchScore}%</div>
                <div style={{ marginTop: '8px' }}>
                  <Link to={`/roadmap?occ=${op.occupationKey}`} className="btn btn-primary" style={{ fontSize: '11px', width: '100%' }}>
                    View Action Roadmap &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Omnichannel Demo Switcher Links */}
      <div className="quick-channel-links">
        <Link to="/kiosk" className="btn btn-secondary" style={{ fontSize: '13px' }}>
          <Tv size={14} /> Open Village Kiosk Mode
        </Link>
        <Link to="/channel-demo" className="btn btn-secondary" style={{ fontSize: '13px' }}>
          <PhoneCall size={14} /> WhatsApp & IVR Simulator
        </Link>
      </div>
    </div>
  );
};
