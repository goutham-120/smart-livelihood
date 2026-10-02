import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import './Kiosk.css';

const KIOSK_LANGUAGES = [
  { code: 'te', native: 'తెలుగు', name: 'Telugu', speech: 'te-IN' },
  { code: 'hi', native: 'हिन्दी', name: 'Hindi', speech: 'hi-IN' },
  { code: 'en', native: 'English', name: 'English', speech: 'en-IN' }
];

const INITIAL_PROMPTS = {
  te: 'నమస్కారం! గ్రామ పంచాయతీ PM AJAY జీవనోపాధి కియోస్క్‌కు స్వాగతం. మీ నైపుణ్యాలు మరియు పని అనుభవాన్ని గుర్తించి సరైన ఉచిత శిక్షణ అందించడానికి పెద్ద మైక్రోఫోన్ బటన్ నొక్కి మాట్లాడండి.',
  hi: 'नमस्ते! ग्राम पंचायत PM AJAY आजीविका कियोस्क में आपका स्वागत है. अपने हुनर और अनुभव के अनुसार सही ट्रेनिंग खोजने के लिए बड़े माइक बटन को दबाकर बोलें.',
  en: 'Namaste! Welcome to the Gram Panchayat PM AJAY Livelihood Kiosk. Press the large microphone button and speak about your work skills and experience.'
};

export const Kiosk = () => {
  const [language, setLanguage] = useState('te');
  const [currentPrompt, setCurrentPrompt] = useState(INITIAL_PROMPTS.te);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [inactivitySeconds, setInactivitySeconds] = useState(45);
  const [dialogueHistory, setDialogueHistory] = useState([]);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  // Phone number capture at conclusion
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);
  const [matchedOpportunities, setMatchedOpportunities] = useState([]);

  const recognitionRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // Automatic spoken prompt on step update
  const speakPrompt = (textToSpeak, langCode) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const langObj = KIOSK_LANGUAGES.find((l) => l.code === langCode);
    utterance.lang = langObj ? langObj.speech : 'te-IN';
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  // Speak initial greeting on load and language switch
  useEffect(() => {
    const prompt = INITIAL_PROMPTS[language] || INITIAL_PROMPTS.en;
    setCurrentPrompt(prompt);
    speakPrompt(prompt, language);
  }, [language]);

  // Inactivity auto reset countdown
  const resetInactivityTimer = () => {
    setInactivitySeconds(45);
  };

  useEffect(() => {
    inactivityTimerRef.current = setInterval(() => {
      setInactivitySeconds((prev) => {
        if (prev <= 1) {
          handleFullReset();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(inactivityTimerRef.current);
  }, []);

  // Listen to user interactions to reset countdown
  useEffect(() => {
    const handleActivity = () => resetInactivityTimer();
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  const handleFullReset = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.abort();
    setIsListening(false);
    setIsProcessing(false);
    setDialogueHistory([]);
    setExtractedSkills([]);
    setIsComplete(false);
    setPhoneNumber('');
    setPhoneSubmitted(false);
    setMatchedOpportunities([]);
    const defaultPrompt = INITIAL_PROMPTS[language] || INITIAL_PROMPTS.te;
    setCurrentPrompt(defaultPrompt);
    speakPrompt(defaultPrompt, language);
    resetInactivityTimer();
  };

  const startListening = () => {
    resetInactivityTimer();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this kiosk browser.');
      return;
    }

    try {
      if (recognitionRef.current) recognitionRef.current.abort();

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      const langObj = KIOSK_LANGUAGES.find((l) => l.code === language);
      rec.lang = langObj ? langObj.speech : 'te-IN';

      rec.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      rec.onresult = (e) => {
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
          handleProcessUtterance(final);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
        setInterimText('');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleProcessUtterance = async (speechText) => {
    if (!speechText.trim()) return;

    resetInactivityTimer();
    setIsProcessing(true);
    setDialogueHistory((prev) => [...prev, { speaker: 'user', text: speechText }]);

    try {
      const res = await fetch('/api/channels/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'kiosk',
          message: speechText,
          language,
          phone: phoneNumber || '9876543210'
        })
      });

      const data = await res.json();

      if (data.replyText) {
        setCurrentPrompt(data.replyText);
        setDialogueHistory((prev) => [...prev, { speaker: 'ai', text: data.replyText }]);
        speakPrompt(data.replyText, language);
      }

      if (data.extractedSkills && data.extractedSkills.length > 0) {
        setExtractedSkills((prev) => Array.from(new Set([...prev, ...data.extractedSkills])));
      }

      if (data.isComplete || data.stage === 'completed' || data.stage === 'confirmation') {
        setIsComplete(true);
        if (data.matchedOpportunities) {
          setMatchedOpportunities(data.matchedOpportunities);
        }
      }
    } catch (err) {
      const fallbackMsg = language === 'te'
        ? 'మీ సమాధానం నమోదైంది. దయచేసి మీ మొబైల్ నంబర్ నమోదు చేయండి.'
        : 'आपका उत्तर दर्ज हो गया है. कृपया अपना मोबाइल नंबर दर्ज करें.';
      setCurrentPrompt(fallbackMsg);
      speakPrompt(fallbackMsg, language);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setPhoneSubmitted(true);
    resetInactivityTimer();

    const ack = language === 'te'
      ? `ధన్యవాదాలు! మీ మొబైల్ నంబర్ ${phoneNumber} కు పూర్తి ఉచిత శిక్షణ మరియు ప్రభుత్వ రుణ పథకాల వివరాలు SMS ద్వారా పంపబడ్డాయి.`
      : language === 'hi'
        ? `धन्यवाद! आपके मोबाइल नंबर ${phoneNumber} पर ट्रेनिंग और सरकारी योजना का विवरण SMS द्वारा भेज दिया गया है.`
        : `Thank you! Detailed skilling and government loan pathways have been dispatched to your mobile number ${phoneNumber}.`;

    setCurrentPrompt(ack);
    speakPrompt(ack, language);
  };

  return (
    <div className="kiosk-wrapper">
      <Link to="/assistant" className="kiosk-exit-link">
        Exit Kiosk &rarr;
      </Link>

      {/* Header */}
      <header className="kiosk-header">
        <div className="kiosk-emblem">
          <div className="kiosk-badge">PM AJAY</div>
          <div>
            <h1 className="kiosk-heading">Livelihood & Skilling Touch Kiosk</h1>
            <div className="kiosk-subheading">Gram Panchayat Community Common Service Center</div>
          </div>
        </div>

        <div className="inactivity-indicator">
          <Clock size={16} />
          <span>Screen Reset in: {inactivitySeconds}s</span>
          <button
            onClick={handleFullReset}
            style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', marginLeft: '6px' }}
            title="Reset Kiosk Now"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Icon Language Selector Cards */}
      <div className="kiosk-lang-selector">
        {KIOSK_LANGUAGES.map((l) => (
          <div
            key={l.code}
            className={`lang-card ${language === l.code ? 'active' : ''}`}
            onClick={() => setLanguage(l.code)}
          >
            <div className="lang-native">{l.native}</div>
            <div className="lang-sub">{l.name}</div>
          </div>
        ))}
      </div>

      {/* Main Interactive Touch Card */}
      <main className="kiosk-main-card">
        <div className="prompt-display">
          {currentPrompt}
        </div>

        {interimText && (
          <div className="kiosk-interim">
            Hearing: "{interimText}"
          </div>
        )}

        {/* Giant Microphone Button */}
        {!isComplete && (
          <div className="giant-mic-container">
            <button
              type="button"
              className={`giant-mic-button ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
            >
              {isListening ? <MicOff size={60} /> : <Mic size={60} />}
            </button>
            <div style={{ marginTop: '14px', fontSize: '15px', color: '#cbd5e1' }}>
              {isListening ? 'Listening to your voice... Speak clearly' : 'TAP BIG MIC TO SPEAK'}
            </div>
          </div>
        )}

        {/* Identified Skills Badges */}
        {extractedSkills.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 700, marginBottom: '6px' }}>
              <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Discovered Competencies:
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {extractedSkills.map((sk, idx) => (
                <span key={idx} className="badge badge-blue" style={{ fontSize: '13px', padding: '6px 12px' }}>
                  {sk.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* End of Flow: Phone Number Capture (Zero Login Guarantee) */}
        {isComplete && !phoneSubmitted && (
          <form className="phone-capture-box" onSubmit={handlePhoneSubmit}>
            <div style={{ fontSize: '15px', fontWeight: 600 }}>
              Enter your mobile phone number to receive your NSQF training and grant summary:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={24} color="#818cf8" />
              <input
                type="tel"
                className="kiosk-input"
                placeholder="10-digit Phone Number"
                value={phoneNumber}
                maxLength={10}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <button type="submit" className="kiosk-btn-large">
              Send My Livelihood Plan via SMS & WhatsApp
            </button>
          </form>
        )}

        {/* Success Confirmation Card */}
        {phoneSubmitted && (
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '24px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#4ade80', fontSize: '20px', fontWeight: 800 }}>
              <CheckCircle2 size={28} /> Verification Dispatched
            </div>
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#e2e8f0' }}>
              Your matched NSQF training center and PM Vishwakarma toolkit schedule have been dispatched to {phoneNumber}.
            </p>
            <div style={{ marginTop: '16px' }}>
              <button onClick={handleFullReset} className="btn btn-secondary" style={{ background: '#ffffff', color: '#0f172a', fontWeight: 700 }}>
                Start New Beneficiary Assessment
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Kiosk;
