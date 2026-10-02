/* Assistant.jsx: Multilingual empathetic voice assistant chat interface
   SIH26097 PM-AJAY Livelihood Assistant */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { Spinner, ReadAloudButton } from '../components.jsx';
import { postMessage } from '../api.js';
import { useLang } from '../lang.js';
import './Assistant.css';

/* Utterance bubble */
function Bubble({ role, text, skills }) {
  const isUser = role === 'user';
  return (
    <div className={`bubble-wrap ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
      {!isUser && (
        <div className="bubble-avatar" aria-hidden="true">🤖</div>
      )}
      <div className={`bubble ${isUser ? 'bubble-user-inner' : 'bubble-bot-inner'}`}>
        <p className="text-sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{text}</p>
        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs text-muted">Skills found:</span>
            {skills.map((s) => (
              <span key={s} className="badge badge-success text-xs">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Voice recording hook using Web Speech API */
function useSpeechRecognition(lang, onResult) {
  const [listening, setListening] = useState(false);
  const recognizerRef = useRef(null);

  const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Use Chrome on Android or desktop.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = langMap[lang] || 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    recognizerRef.current = rec;
    setListening(true);
  }, [lang, onResult]);

  const stop = useCallback(() => {
    recognizerRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop };
}

export default function Assistant({ forUserId }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { lang } = useLang();

  const [messages, setMessages] = useState([
    { role: 'bot', text: t('assistant.greeting') }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const handleResult = useCallback((text) => {
    setInput(text);
  }, []);

  const { listening, start, stop } = useSpeechRecognition(lang, handleResult);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await postMessage({
        text,
        lang,
        channel: 'web',
        forUserId: forUserId || undefined,
      });
      const { replyText, extractedSkills } = res.data;
      setMessages((m) => [...m, { role: 'bot', text: replyText, skills: extractedSkills }]);

      /* Speak reply */
      if ('speechSynthesis' in window) {
        const langMap = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN' };
        const utt = new SpeechSynthesisUtterance(replyText.slice(0, 400));
        utt.lang = langMap[lang] || 'en-IN';
        utt.rate = 0.92;
        window.speechSynthesis.speak(utt);
      }
    } catch {
      setMessages((m) => [...m, { role: 'bot', text: t('common.error') }]);
    } finally {
      setLoading(false);
    }
  }, [lang, forUserId, t]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleMic = () => {
    if (listening) { stop(); }
    else { start(); }
  };

  return (
    <div className="assistant-root page-enter">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          🎙️ {t('assistant.title')}
        </h1>
        <ReadAloudButton lang={lang} />
      </div>

      {/* Language notice */}
      <div className="assistant-lang-notice mb-4">
        <span className="text-xs text-muted">
          Speaking in: <strong>{lang === 'hi' ? 'हिंदी' : lang === 'te' ? 'తెలుగు' : 'English'}</strong>. Change language above.
        </span>
      </div>

      {/* Chat window */}
      <div className="assistant-chat" role="log" aria-live="polite" aria-label="Conversation">
        {messages.map((m, i) => (
          <Bubble key={i} {...m} />
        ))}
        {loading && (
          <div className="bubble-wrap bubble-bot">
            <div className="bubble-avatar" aria-hidden="true">🤖</div>
            <div className="bubble bubble-bot-inner">
              <Spinner size={18} />
              <span className="text-sm text-muted ml-2">{t('assistant.thinking')}</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="assistant-input-bar" aria-label="Message input">
        <button
          type="button"
          id="btn-mic"
          className={`btn btn-icon ${listening ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleMic}
          aria-label={listening ? 'Stop listening' : t('assistant.listen')}
          aria-pressed={listening}
          title={listening ? 'Stop' : t('assistant.listen')}
        >
          {listening ? '⏹' : '🎤'}
        </button>
        <input
          id="inp-assistant-text"
          className="input flex-1"
          placeholder={t('assistant.placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          aria-label={t('assistant.placeholder')}
          autoComplete="off"
        />
        <button
          id="btn-assistant-send"
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
          aria-label={t('assistant.send')}
        >
          {loading ? <Spinner size={18} /> : t('assistant.send')}
        </button>
      </form>
    </div>
  );
}
