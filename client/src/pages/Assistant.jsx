import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api.js';
import { Card, Badge } from '../components.jsx';
import {
  Sparkles, Mic, MicOff, Volume2, VolumeX,
  CheckCircle, Loader2, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ALL_LANGUAGES = [
  { code: 'te',  name: 'Telugu',    nativeName: 'తెలుగు',       speechCode: 'te-IN' },
  { code: 'hi',  name: 'Hindi',     nativeName: 'हिन्दी',        speechCode: 'hi-IN' },
  { code: 'en',  name: 'English',   nativeName: 'English',       speechCode: 'en-IN' },
  { code: 'bn',  name: 'Bengali',   nativeName: 'বাংলা',         speechCode: 'bn-IN' },
  { code: 'ta',  name: 'Tamil',     nativeName: 'தமிழ்',         speechCode: 'ta-IN' },
  { code: 'gu',  name: 'Gujarati',  nativeName: 'ગુજરાતી',      speechCode: 'gu-IN' },
  { code: 'kn',  name: 'Kannada',   nativeName: 'ಕನ್ನಡ',        speechCode: 'kn-IN' },
  { code: 'ml',  name: 'Malayalam', nativeName: 'മലയാളം',        speechCode: 'ml-IN' },
  { code: 'mr',  name: 'Marathi',   nativeName: 'मराठी',         speechCode: 'mr-IN' },
  { code: 'pa',  name: 'Punjabi',   nativeName: 'ਪੰਜਾਬੀ',       speechCode: 'pa-IN' },
  { code: 'od',  name: 'Odia',      nativeName: 'ଓଡ଼ିଆ',        speechCode: 'od-IN' },
  { code: 'as',  name: 'Assamese',  nativeName: 'অসমীয়া',       speechCode: 'as-IN' },
  { code: 'ur',  name: 'Urdu',      nativeName: 'اُردُو',        speechCode: 'ur-IN' },
  { code: 'ne',  name: 'Nepali',    nativeName: 'नेपाली',        speechCode: 'ne-IN' },
  { code: 'kok', name: 'Konkani',   nativeName: 'कोंकणी',        speechCode: 'kok-IN' },
  { code: 'ks',  name: 'Kashmiri',  nativeName: 'कॉशुर',         speechCode: 'ks-IN' },
  { code: 'sd',  name: 'Sindhi',    nativeName: 'سنڌي',          speechCode: 'sd-IN' },
  { code: 'sa',  name: 'Sanskrit',  nativeName: 'संस्कृतम्',     speechCode: 'sa-IN' },
  { code: 'sat', name: 'Santali',   nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',     speechCode: 'sat-IN' },
  { code: 'mni', name: 'Manipuri',  nativeName: 'মৈতৈলোন্',      speechCode: 'mni-IN' },
  { code: 'brx', name: 'Bodo',      nativeName: 'बड़ो',           speechCode: 'brx-IN' },
  { code: 'mai', name: 'Maithili',  nativeName: 'मैथिली',        speechCode: 'mai-IN' },
  { code: 'doi', name: 'Dogri',     nativeName: 'डोगरी',         speechCode: 'doi-IN' },
];

const INITIAL_GREETING = 'Namaste! Welcome to the PM-AJAY AI Voice Assistant. Speak or type in any of the 23 Indian languages — your language will be automatically detected, answered in the same language, and read aloud.';

const SAMPLE_PROMPTS = [
  { label: 'Hindi: नौकरी चाहिए', text: 'मुझे सिलाई और कपड़ों के काम का अनुभव है। क्या कोई नौकरी या सरकारी योजना है?' },
  { label: 'Telugu: ఉద్యోగం & శిక్షణ', text: 'నాకు ట్రాక్టర్ నడపడం మరియు వ్యవసాయ పరికరాల రిపేర్ తెలుసు. మంచి ఉపాధి కావాలి.' },
  { label: 'Tamil: வேலை வாய்ப்பு', text: 'எனக்கு தையல் மற்றும் துணி தைக்கும் அனுபவம் உண்டு. தையல் வேலை வாய்ப்பு வேண்டும்.' },
  { label: 'Kannada: ಉದ್ಯೋಗ ಮಾಹಿತಿ', text: 'ನನಗೆ ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ ರಿಪೇರಿ ಕೆಲಸ ತಿಳಿದಿದೆ. ಉದ್ಯೋಗಾವಕಾಶ ತಿಳಿಸಿ.' },
  { label: 'Bengali: চাকরির খোঁজ', text: 'আমার সেলাই কাজ ও টেইলারিং জানা আছে। কোনো চাকরির সুযোগ আছে কি?' },
  { label: 'English: Job & Training', text: 'I have experience in electrical motor repair and wiring. I want job opportunities.' }
];

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function playTTS(text, language) {
  try {
    const result = await api.textToSpeech({ text, language });
    if (result && result.audioBase64) {
      const src = result.audioBase64.startsWith('data:')
        ? result.audioBase64
        : `data:audio/wav;base64,${result.audioBase64}`;
      const audio = new Audio(src);
      return new Promise(resolve => {
        audio.onended = resolve;
        audio.onerror = resolve;
        audio.play().catch(resolve);
      });
    }
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(result && result.fallbackText ? result.fallbackText : text);
      utt.lang = (result && result.speechCode) ? result.speechCode : (language?.includes('-') ? language : `${language}-IN`);
      return new Promise(resolve => {
        utt.onend = resolve;
        utt.onerror = resolve;
        window.speechSynthesis.speak(utt);
      });
    }
  } catch (_) { /* silent */ }
}

const MicButton = ({ isListening, isDisabled, onClick }) => (
  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    {isListening && (
      <>
        <div style={{ position: 'absolute', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(220,38,38,0.12)', animation: 'va-ping 1.2s ease-out infinite' }} />
        <div style={{ position: 'absolute', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(220,38,38,0.18)', animation: 'va-ping 1.2s ease-out infinite', animationDelay: '0.4s' }} />
      </>
    )}
    <button
      type="button"
      id="mic-toggle-btn"
      onClick={onClick}
      disabled={isDisabled}
      title={isListening ? 'Stop recording' : 'Start speaking'}
      style={{
        width: '88px', height: '88px', borderRadius: '50%',
        background: isListening
          ? 'linear-gradient(135deg,#dc2626,#b91c1c)'
          : isDisabled
            ? 'linear-gradient(135deg,#9ca3af,#6b7280)'
            : 'linear-gradient(135deg,#ea580c,#c2410c)',
        color: '#fff', border: 'none',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isListening
          ? '0 0 0 4px rgba(220,38,38,0.25),0 6px 24px rgba(220,38,38,0.35)'
          : '0 6px 20px rgba(194,65,12,0.35)',
        transition: 'all 0.25s ease', position: 'relative', zIndex: 1
      }}
    >
      {isDisabled && !isListening
        ? <Loader2 size={36} style={{ animation: 'va-spin 1s linear infinite' }} />
        : isListening ? <MicOff size={36} /> : <Mic size={36} />
      }
    </button>
  </div>
);

export const Assistant = ({ forUserId = null }) => {
  // Informational detected language state (updates dynamically on every turn)
  const [detectedInfo, setDetectedInfo] = useState(null);

  const [messages, setMessages] = useState(() => [
    { sender: 'ai', text: INITIAL_GREETING, langCode: 'en-IN' }
  ]);

  const [extractedSkills, setExtractedSkills] = useState([]);
  const [updatedProfile, setUpdatedProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [inputText, setInputText] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const speechRecRef = useRef(null);
  const candidateTranscriptRef = useRef('');
  const audioChunksRef = useRef([]);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    api.getProfile(forUserId).then(res => {
      if (res && res.profile) {
        if (res.profile.skills) setExtractedSkills(res.profile.skills);
        setUpdatedProfile(res.profile);
      }
    }).catch(() => {});
  }, [forUserId]);

  /**
   * Start recording audio via MediaRecorder.
   * Every recording is treated as a clean, independent turn with language_code = "unknown".
   */
  const startRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      candidateTranscriptRef.current = '';

      // Optional background listener for candidate transcript fallback if cloud key is not configured
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const sr = new SpeechRec();
          sr.continuous = true;
          sr.interimResults = true;
          sr.onresult = (e) => {
            let t = '';
            for (let i = 0; i < e.results.length; i++) {
              t += e.results[i][0].transcript + ' ';
            }
            candidateTranscriptRef.current = t.trim();
          };
          sr.start();
          speechRecRef.current = sr;
        } catch (_) {}
      }

      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const rec = new MediaRecorder(stream, { mimeType: mime });
      rec.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); handleAudio(mime); };
      rec.start(100);
      mediaRecorderRef.current = rec;
      setIsListening(true);
      setStatusMsg('Listening...');
    } catch {
      setErrorMsg('Microphone access denied. Please allow microphone permissions or type your message below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch (_) {}
    }
    setIsListening(false);
    setStatusMsg('Processing voice...');
  };

  const toggleMic = () => { if (isListening) stopRecording(); else startRecording(); };

  /**
   * Handle recorded audio blob:
   * 1. Send audio with language='unknown' to Sarvam Saaras v4 STT
   * 2. Extract authoritative detected language from STT response
   * 3. Update dynamic status labels: "Detecting language..." -> "Detected language: Telugu"
   * 4. Dispatch transcript and detected language to LLM
   */
  const handleAudio = async (mime) => {
    if (!audioChunksRef.current.length) { setStatusMsg(''); return; }
    setIsProcessing(true);
    setStatusMsg('Detecting language...');

    try {
      const blob = new Blob(audioChunksRef.current, { type: mime });
      const b64 = await blobToBase64(blob);

      // ALWAYS send language: 'unknown' for true automatic speech language detection
      const stt = await api.speechToText({
        audioBase64: b64,
        mimeType: mime || 'audio/webm',
        transcript: candidateTranscriptRef.current || '',
        language: 'unknown'
      });

      const transcript = (stt && (stt.displayTranscript || stt.transcript)) || '';
      if (!transcript.trim()) {
        setStatusMsg('Could not detect speech. Please speak clearly into your microphone.');
        setIsProcessing(false);
        return;
      }

      const detectedLangName = stt.languageName || 'your language';
      const detectedSpeechCode = stt.speechCode || (stt.language ? `${stt.language}-IN` : 'en-IN');
      const detectedProb = stt.languageProbability || stt.confidence || 0.95;

      // Update non-clickable informational badge dynamically
      setDetectedInfo({
        code: stt.language,
        speechCode: detectedSpeechCode,
        name: detectedLangName,
        nativeName: stt.nativeName,
        confidence: detectedProb
      });

      // Step: "Detected language: Telugu"
      setStatusMsg(`Detected language: ${detectedLangName}`);
      setMessages(prev => [...prev, { sender: 'user', text: transcript, langCode: detectedSpeechCode }]);

      // Transition to generating response
      await new Promise(r => setTimeout(r, 400));
      setStatusMsg('Generating response...');

      await sendToAssistant(transcript, detectedSpeechCode, detectedLangName);
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Voice processing failed. Please try again.';
      setErrorMsg(msg);
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  /**
   * Send transcript to the LLM with the authoritative detected language.
   * LLM generates response in that language, and TTS speaks the response in that language.
   */
  const sendToAssistant = async (text, detectedSpeechCode, detectedLangName) => {
    try {
      const res = await api.chatAssistant({
        message: text,
        language: detectedSpeechCode,
        speechCode: detectedSpeechCode,
        channel: 'web',
        forUserId
      });

      const reply = (res && (res.replyText || res.response)) || '';
      const respLangCode = (res && res.speechCode) || detectedSpeechCode;
      const respLangName = (res && res.languageName) || detectedLangName;

      if (reply) {
        setMessages(prev => [...prev, { sender: 'ai', text: reply, langCode: respLangCode }]);
        if (autoPlay) {
          setIsSpeaking(true);
          // Step: "Speaking in Telugu..."
          setStatusMsg(`Speaking in ${respLangName}...`);
          await playTTS(reply, respLangCode);
          setIsSpeaking(false);
        }
      }

      if (res && res.extractedSkills && res.extractedSkills.length > 0) setExtractedSkills(res.extractedSkills);
      if (res && res.updatedProfile) setUpdatedProfile(p => ({ ...p, ...res.updatedProfile }));
    } catch {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Namaste! We received your message and are processing your livelihood request.',
        langCode: 'en-IN'
      }]);
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  /**
   * Handle text submission with automatic language detection on the input text.
   */
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    const t = inputText.trim();
    if (!t || isProcessing) return;
    setInputText('');
    setIsProcessing(true);
    setErrorMsg('');
    setStatusMsg('Detecting language...');

    try {
      const res = await api.chatAssistant({
        message: t,
        language: 'unknown',
        channel: 'web',
        forUserId
      });

      const reply = (res && (res.replyText || res.response)) || '';
      const respLangCode = (res && res.speechCode) || 'en-IN';
      const respLangName = (res && res.languageName) || 'Detected Language';

      setDetectedInfo({
        code: res.language,
        speechCode: respLangCode,
        name: respLangName,
        nativeName: res.nativeName
      });

      setMessages(prev => [
        ...prev,
        { sender: 'user', text: t, langCode: respLangCode },
        ...(reply ? [{ sender: 'ai', text: reply, langCode: respLangCode }] : [])
      ]);

      if (reply && autoPlay) {
        setIsSpeaking(true);
        setStatusMsg(`Speaking in ${respLangName}...`);
        await playTTS(reply, respLangCode);
        setIsSpeaking(false);
      }

      if (res && res.extractedSkills && res.extractedSkills.length > 0) setExtractedSkills(res.extractedSkills);
      if (res && res.updatedProfile) setUpdatedProfile(p => ({ ...p, ...res.updatedProfile }));
    } catch {
      setErrorMsg('Failed to process message.');
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  const handlePrompt = async (text) => {
    if (isProcessing) return;
    setInputText(text);
  };

  const playMsg = async (m) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    setStatusMsg('Speaking response…');
    await playTTS(m.text, m.langCode || 'en-IN');
    setIsSpeaking(false);
    setStatusMsg('');
  };

  const statusColor = errorMsg ? '#dc2626' : isListening ? '#dc2626' : isProcessing ? '#ea580c' : isSpeaking ? '#2563eb' : '#64748b';

  return (
    <div className="page-container">
      <style>{`
        @keyframes va-ping { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.8); opacity: 0; } }
        @keyframes va-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Empathetic AI Voice Assistant</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Speak or type in any of 23 Indian languages — automatically detected from voice audio, answered and read back in the same language
        </p>
      </div>

      {/* Informational Auto-Detection Status Bar (No manual selector) */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        marginBottom: '18px', padding: '12px 18px',
        background: 'linear-gradient(135deg,#fff7ed 0%,#eff6ff 100%)',
        borderRadius: '14px', border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Sparkles size={18} color="#ea580c" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
            Voice Auto-Detect:
          </span>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '20px',
            background: detectedInfo ? '#f0fdf4' : '#fff',
            border: `1px solid ${detectedInfo ? '#86efac' : '#fed7aa'}`,
            color: detectedInfo ? '#166534' : '#c2410c',
            fontWeight: 700, fontSize: '12px'
          }}>
            {detectedInfo ? (
              <>
                <CheckCircle size={13} color="#16a34a" />
                <span>Detected language: <strong>{detectedInfo.name}</strong> ({detectedInfo.nativeName})</span>
                {detectedInfo.confidence && (
                  <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 500 }}>
                    ({Math.round(detectedInfo.confidence * 100)}%)
                  </span>
                )}
              </>
            ) : (
              <span>Speak in any of 23 Indian languages (auto-detected on every turn)</span>
            )}
          </div>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            id="auto-read-toggle"
            onClick={() => setAutoPlay(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
              borderRadius: '20px', border: '1px solid #e2e8f0',
              background: autoPlay ? '#ea580c' : 'transparent',
              color: autoPlay ? '#fff' : '#64748b',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            {autoPlay ? <Volume2 size={13} /> : <VolumeX size={13} />}
            {autoPlay ? 'Auto-Read ON' : 'Auto-Read OFF'}
          </button>
        </div>
      </div>

      {/* Skills Banner */}
      {(extractedSkills.length > 0 || updatedProfile) && (
        <Card style={{ marginBottom: '18px', background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', borderColor: '#86efac' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={17} color="#16a34a" />
                2-Min Voice Assessment: Skills &amp; Profile Identified!
              </div>
              <p style={{ fontSize: '13px', color: '#15803d', marginTop: '2px' }}>
                Your competencies have been extracted from speech. Verify your profile to unlock your dashboard.
              </p>
              {extractedSkills.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {extractedSkills.map((s, i) => <Badge key={i} type="blue">{s.replace(/_/g,' ')}</Badge>)}
                </div>
              )}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', marginTop: '8px' }}>
                {updatedProfile && updatedProfile.education && <div>Education: <strong>{updatedProfile.education}</strong></div>}
                {updatedProfile && updatedProfile.employmentPreference && (
                  <div>Preference: <strong>{updatedProfile.employmentPreference === 'self' ? 'Self-Employment' : updatedProfile.employmentPreference === 'wage' ? 'Wage Job' : 'Either'}</strong></div>
                )}
                {updatedProfile && updatedProfile.incomeGoal && <div>Target: <strong>₹{updatedProfile.incomeGoal.toLocaleString()}/mo</strong></div>}
                {updatedProfile && updatedProfile.experienceYears > 0 && <div>Experience: <strong>{updatedProfile.experienceYears} yrs</strong></div>}
              </div>
            </div>
            <Link to="/profile?verify=1" className="btn btn-primary" style={{ fontSize: '13px', fontWeight: 700, padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Verify Profile &rarr;
            </Link>
          </div>
        </Card>
      )}

      {/* Chat Card */}
      <Card style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
        {/* Messages */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', marginBottom: '16px', maxHeight: '400px', paddingRight: '4px' }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start', gap: '3px' }}>
              <div style={{
                background: m.sender === 'user' ? 'var(--primary-600,#ea580c)' : 'var(--surface-subtle)',
                color: m.sender === 'user' ? '#fff' : 'var(--text-main)',
                padding: '11px 16px',
                borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                fontSize: '14px', lineHeight: 1.5, boxShadow: 'var(--shadow-sm)'
              }}>
                {m.text}
              </div>
              {m.sender === 'ai' && (
                <button type="button" onClick={() => playMsg(m)} disabled={isSpeaking}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: isSpeaking ? 'not-allowed' : 'pointer', color: '#64748b', fontSize: '11px', fontWeight: 600, padding: '2px 4px' }}>
                  <Volume2 size={12} /> Listen
                </button>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Quick Voice Samples */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Quick Voice Samples (Click to test auto-detection):</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {SAMPLE_PROMPTS.map((p, i) => (
              <button key={i} type="button" onClick={() => handlePrompt(p.text)} disabled={isProcessing}
                style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-light)', padding: '5px 11px', borderRadius: 'var(--radius-full)', fontSize: '12px', cursor: 'pointer', color: 'var(--primary-700,#c2410c)', fontWeight: 500 }}>
                + {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mic Flow Button & Dynamic Status Message */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <MicButton isListening={isListening} isDisabled={isProcessing && !isListening} onClick={toggleMic} />
          <div style={{ fontSize: '13px', fontWeight: 600, color: statusColor, display: 'flex', alignItems: 'center', gap: '6px', minHeight: '20px' }}>
            {errorMsg
              ? <><AlertCircle size={14} /> {errorMsg}</>
              : statusMsg
                ? <><Loader2 size={14} style={{ animation: 'va-spin 1s linear infinite' }} /> {statusMsg}</>
                : isListening
                  ? 'Listening...'
                  : isSpeaking
                    ? <><Volume2 size={14} /> Speaking response…</>
                    : 'Tap mic to speak in any language, or type below'
            }
          </div>
        </div>

        {/* Text Input */}
        <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <input
            type="text"
            id="assistant-text-input"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={isProcessing}
            placeholder="Type your skills, questions or past work in any language…"
            style={{ flex: 1, padding: '11px 15px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', fontSize: '14px' }}
          />
          <button type="submit" className="btn btn-primary" id="send-msg-btn" disabled={isProcessing || !inputText.trim()}>
            Send
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Assistant;
