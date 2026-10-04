/**
 * Client Language Registry & Indic Voice Synthesis Helper
 * Covers 22 Scheduled Indian Languages + English with verified provider capabilities.
 */

export const SCHEDULED_LANGUAGES = [
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', provider: 'Sarvam & Bhashini' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', provider: 'Sarvam & Bhashini' },
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN', provider: 'Sarvam & Bhashini' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', provider: 'Sarvam & Bhashini' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN', provider: 'Sarvam & Bhashini' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', provider: 'Sarvam & Bhashini' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', provider: 'Sarvam & Bhashini' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN', provider: 'Sarvam & Bhashini' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechCode: 'or-IN', provider: 'Sarvam & Bhashini' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN', provider: 'Sarvam & Bhashini' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', provider: 'Sarvam & Bhashini' },
  { code: 'ur', name: 'Urdu', nativeName: 'اُردُو', speechCode: 'ur-IN', provider: 'Bhashini & WebSpeech' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', speechCode: 'as-IN', provider: 'Bhashini' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', speechCode: 'ne-IN', provider: 'Bhashini & WebSpeech' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', speechCode: 'sa-IN', provider: 'Bhashini' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', speechCode: 'mai-IN', provider: 'Bhashini' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', speechCode: 'kok-IN', provider: 'Bhashini' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', speechCode: 'ks-IN', provider: 'Bhashini' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', speechCode: 'brx-IN', provider: 'Bhashini' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', speechCode: 'doi-IN', provider: 'Bhashini' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', speechCode: 'mni-IN', provider: 'Bhashini' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', speechCode: 'sat-IN', provider: 'Bhashini' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', speechCode: 'sd-IN', provider: 'Bhashini' }
];

export const getLanguageByCode = (code) => {
  if (!code) return SCHEDULED_LANGUAGES[0];
  const clean = String(code).trim().toLowerCase().split('-')[0];
  return SCHEDULED_LANGUAGES.find((l) => l.code === clean) || SCHEDULED_LANGUAGES[0];
};

/**
 * Global audio player references and request sequence tracking for zero overlapping audio
 */
let currentAudioElement = null;
let currentPlaybackRequestId = 0;
let currentAbortController = null;
let activeEndCallback = null;

export const isIndicSpeechPlaying = () => {
  const isAudioElementPlaying = Boolean(currentAudioElement && !currentAudioElement.paused);
  const isSpeechSynthesisSpeaking = typeof window !== 'undefined' && Boolean(window.speechSynthesis?.speaking);
  return isAudioElementPlaying || isSpeechSynthesisSpeaking;
};

/**
 * Stops all currently active speech playback immediately.
 * Cancels HTMLAudioElement, browser SpeechSynthesis, and any in-flight TTS server requests.
 */
export const stopIndicSpeech = () => {
  currentPlaybackRequestId++;

  if (currentAbortController) {
    try {
      currentAbortController.abort();
    } catch (e) {}
    currentAbortController = null;
  }

  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement.src = '';
    } catch (e) {}
    currentAudioElement = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }

  if (activeEndCallback) {
    const cb = activeEndCallback;
    activeEndCallback = null;
    cb();
  }
};

/**
 * Plays speech audio using server Indic TTS (Sarvam/Bhashini) with graceful Web Speech fallback.
 * Strictly prevents race conditions and overlapping audio.
 *
 * @param {object} params
 * @param {string} params.text - Text to speak
 * @param {string} params.language - Language code (e.g. 'te', 'hi', 'en')
 * @param {string} [params.speechCode] - Specific speech code (e.g. 'te-IN', 'hi-IN')
 * @param {string} [params.audioBase64] - Pre-synthesized base64 audio if available
 * @param {function} [params.onStart] - Callback when speech starts
 * @param {function} [params.onEnd] - Callback when speech ends or is stopped
 */
export const playIndicSpeech = async ({
  text,
  language = 'te',
  speechCode = null,
  audioBase64 = null,
  onStart,
  onEnd
}) => {
  // 1. Immediately silence any prior playback and cancel in-flight TTS
  stopIndicSpeech();

  const thisRequestId = ++currentPlaybackRequestId;
  activeEndCallback = onEnd || null;

  const langInfo = getLanguageByCode(language);
  const effectiveSpeechCode = speechCode || langInfo.speechCode;

  // 2. If pre-synthesized base64 audio was provided
  if (audioBase64) {
    try {
      if (thisRequestId !== currentPlaybackRequestId) return;

      const audioUrl = audioBase64.startsWith('data:')
        ? audioBase64
        : `data:audio/wav;base64,${audioBase64}`;
      const audio = new Audio(audioUrl);
      currentAudioElement = audio;

      audio.onplay = () => {
        if (thisRequestId === currentPlaybackRequestId) {
          onStart && onStart();
        }
      };
      audio.onended = () => {
        if (thisRequestId === currentPlaybackRequestId) {
          currentAudioElement = null;
          activeEndCallback = null;
          onEnd && onEnd();
        }
      };
      audio.onerror = () => {
        if (thisRequestId === currentPlaybackRequestId) {
          currentAudioElement = null;
          fallbackBrowserSpeech(text, effectiveSpeechCode, onStart, onEnd, thisRequestId);
        }
      };

      await audio.play();
      return;
    } catch (e) {
      if (thisRequestId !== currentPlaybackRequestId) return;
      // Fall through to server TTS or browser fallback
    }
  }

  // 3. In-flight cancellable server TTS request
  const abortController = new AbortController();
  currentAbortController = abortController;

  try {
    const res = await fetch('/api/assistant/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: langInfo.code, speechCode: effectiveSpeechCode }),
      signal: abortController.signal
    });

    if (thisRequestId !== currentPlaybackRequestId) return;

    if (res.ok) {
      const data = await res.json();
      if (thisRequestId !== currentPlaybackRequestId) return;

      if (data.audioBase64) {
        const audioUrl = `data:${data.contentType || 'audio/wav'};base64,${data.audioBase64}`;
        const audio = new Audio(audioUrl);
        currentAudioElement = audio;

        audio.onplay = () => {
          if (thisRequestId === currentPlaybackRequestId) {
            onStart && onStart();
          }
        };
        audio.onended = () => {
          if (thisRequestId === currentPlaybackRequestId) {
            currentAudioElement = null;
            activeEndCallback = null;
            onEnd && onEnd();
          }
        };
        audio.onerror = () => {
          if (thisRequestId === currentPlaybackRequestId) {
            currentAudioElement = null;
            fallbackBrowserSpeech(text, effectiveSpeechCode, onStart, onEnd, thisRequestId);
          }
        };

        await audio.play();
        return;
      }
    }
  } catch (err) {
    if (thisRequestId !== currentPlaybackRequestId || err.name === 'AbortError') {
      return;
    }
  } finally {
    if (currentAbortController === abortController) {
      currentAbortController = null;
    }
  }

  // 4. Fallback to client browser SpeechSynthesis
  if (thisRequestId === currentPlaybackRequestId) {
    fallbackBrowserSpeech(text, effectiveSpeechCode, onStart, onEnd, thisRequestId);
  }
};

const fallbackBrowserSpeech = (text, speechCode, onStart, onEnd, requestId) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd && onEnd();
    return;
  }

  if (requestId && requestId !== currentPlaybackRequestId) {
    return;
  }

  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = speechCode || 'hi-IN';
  utt.rate = 0.95;

  // Try to find matching native voice
  try {
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang === speechCode || v.lang.startsWith(speechCode.slice(0, 2)));
    if (matchingVoice) {
      utt.voice = matchingVoice;
    }
  } catch (e) {}

  utt.onstart = () => {
    if (!requestId || requestId === currentPlaybackRequestId) {
      onStart && onStart();
    }
  };
  utt.onend = () => {
    if (!requestId || requestId === currentPlaybackRequestId) {
      activeEndCallback = null;
      onEnd && onEnd();
    }
  };
  utt.onerror = () => {
    if (!requestId || requestId === currentPlaybackRequestId) {
      activeEndCallback = null;
      onEnd && onEnd();
    }
  };

  window.speechSynthesis.speak(utt);
};
