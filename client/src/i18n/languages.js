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
 * Global audio player reference for stopping overlapping audio
 */
let currentAudioElement = null;

/**
 * Plays speech audio using server Indic TTS (Sarvam/Bhashini) with graceful Web Speech fallback.
 *
 * @param {object} params
 * @param {string} params.text - Text to speak
 * @param {string} params.language - Language code (e.g. 'te', 'hi', 'en')
 * @param {string} [params.audioBase64] - Pre-synthesized base64 audio if available
 * @param {function} [params.onStart] - Callback when speech starts
 * @param {function} [params.onEnd] - Callback when speech ends
 */
export const playIndicSpeech = async ({
  text,
  language = 'te',
  speechCode = null,
  audioBase64 = null,
  onStart,
  onEnd
}) => {
  stopIndicSpeech();

  const langInfo = getLanguageByCode(language);
  const effectiveSpeechCode = speechCode || langInfo.speechCode;

  // 1. If base64 audio is provided directly from server
  if (audioBase64) {
    try {
      const audioUrl = audioBase64.startsWith('data:')
        ? audioBase64
        : `data:audio/wav;base64,${audioBase64}`;
      const audio = new Audio(audioUrl);
      currentAudioElement = audio;

      audio.onplay = () => onStart && onStart();
      audio.onended = () => {
        currentAudioElement = null;
        onEnd && onEnd();
      };
      audio.onerror = () => {
        currentAudioElement = null;
        fallbackBrowserSpeech(text, effectiveSpeechCode, onStart, onEnd);
      };

      await audio.play();
      return;
    } catch (e) {
      // Fall through to browser synthesis
    }
  }

  // 2. Fetch server synthesis if text is available
  try {
    const res = await fetch('/api/assistant/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: langInfo.code, speechCode: effectiveSpeechCode })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audioUrl = `data:${data.contentType || 'audio/wav'};base64,${data.audioBase64}`;
        const audio = new Audio(audioUrl);
        currentAudioElement = audio;

        audio.onplay = () => onStart && onStart();
        audio.onended = () => {
          currentAudioElement = null;
          onEnd && onEnd();
        };
        audio.onerror = () => {
          currentAudioElement = null;
          fallbackBrowserSpeech(text, effectiveSpeechCode, onStart, onEnd);
        };

        await audio.play();
        return;
      }
    }
  } catch (err) {
    // Fallback to browser synthesis
  }

  // 3. Fallback to client browser SpeechSynthesis
  fallbackBrowserSpeech(text, effectiveSpeechCode, onStart, onEnd);
};

export const stopIndicSpeech = () => {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {}
    currentAudioElement = null;
  }
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};

const fallbackBrowserSpeech = (text, speechCode, onStart, onEnd) => {
  if (!window.speechSynthesis) {
    onEnd && onEnd();
    return;
  }

  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = speechCode || 'hi-IN';
  utt.rate = 0.95;

  // Try to find native voice
  const voices = window.speechSynthesis.getVoices();
  const matchingVoice = voices.find((v) => v.lang === speechCode || v.lang.startsWith(speechCode.slice(0, 2)));
  if (matchingVoice) {
    utt.voice = matchingVoice;
  }

  utt.onstart = () => onStart && onStart();
  utt.onend = () => onEnd && onEnd();
  utt.onerror = () => onEnd && onEnd();

  window.speechSynthesis.speak(utt);
};
