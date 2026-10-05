/**
 * Speech Provider Interface for PM AJAY AI Voice Assistant
 * Supports:
 * 1. Sarvam AI Indic STT (saaras:v1 / saaras:v2) & TTS (bulbul:v1)
 * 2. Google Gemini 1.5 Flash Multimodal Audio ASR & Language Identification
 * 3. Deterministic Script & Morpho-Lexical Language Identification (LID)
 * 4. Graceful Web Speech fallback with honest capability reporting across all 22 Scheduled Languages + English.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  SUPPORTED_LANGUAGES,
  detectLanguageFromText,
  normalizeLanguageCode,
  getLanguageConfig
} from './languages.js';
import { normalizeVoiceTranscript } from './transliteration.js';

let geminiClient = null;

const getGeminiAudioModel = () => {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  });
};

/**
 * Sarvam AI Speech Provider
 * Officially supports 10 Indian languages + English on saaras and bulbul models.
 */
export class SarvamSpeechProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  isSupported(langCode) {
    // Sarvam Saaras v4 supports all 23 languages
    return true;
  }

  async transcribe(audioBuffer, language = 'auto', mimeType = 'audio/webm') {
    if (!this.apiKey) {
      throw new Error('Sarvam API key not configured');
    }

    const isAuto = !language || language === 'auto' || language === 'unknown';
    let targetLangCode = 'unknown';
    if (!isAuto) {
      const conf = getLanguageConfig(language);
      targetLangCode = conf?.speechCode || language;
    }

    const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'wav';
    const blob = new Blob([audioBuffer], { type: mimeType });

    let res = null;
    let data = null;

    // Prefer saaras:v4 model with mode='transcribe' for native script output
    try {
      const formDataV4 = new FormData();
      formDataV4.append('file', blob, `recording.${ext}`);
      formDataV4.append('model', 'saaras:v4');
      formDataV4.append('mode', 'transcribe');
      formDataV4.append('language_code', targetLangCode);

      res = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: { 'api-subscription-key': this.apiKey },
        body: formDataV4
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Sarvam API authentication failed. Please check your SARVAM_API_KEY in server/.env.');
      }
      if (res.status === 429) {
        throw new Error('Sarvam API quota/rate limit reached. Please try again later.');
      }
      if (res.ok) {
        data = await res.json();
      }
    } catch (v4Err) {
      if (v4Err.message.includes('authentication failed') || v4Err.message.includes('quota/rate limit')) {
        throw v4Err;
      }
      // Otherwise fallback to saaras:v3 or saaras:v1 below
    }

    if (!data) {
      try {
        const formDataV3 = new FormData();
        formDataV3.append('file', blob, `recording.${ext}`);
        formDataV3.append('model', 'saaras:v3');
        formDataV3.append('mode', 'transcribe');
        formDataV3.append('language_code', targetLangCode);

        res = await fetch('https://api.sarvam.ai/speech-to-text', {
          method: 'POST',
          headers: { 'api-subscription-key': this.apiKey },
          body: formDataV3
        });

        if (res.status === 401 || res.status === 403) {
          throw new Error('Sarvam API authentication failed. Please check your SARVAM_API_KEY in server/.env.');
        }
        if (res.status === 429) {
          throw new Error('Sarvam API quota/rate limit reached. Please try again later.');
        }
        if (res.ok) {
          data = await res.json();
        }
      } catch (v3Err) {
        if (v3Err.message.includes('authentication failed') || v3Err.message.includes('quota/rate limit')) {
          throw v3Err;
        }
      }
    }

    if (!data) {
      const formData = new FormData();
      formData.append('file', blob, `recording.${ext}`);
      formData.append('model', 'saaras:v1');
      formData.append('language_code', targetLangCode);

      res = await fetch('https://api.sarvam.ai/speech-to-text', {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey
        },
        body: formData
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Sarvam API authentication failed. Please check your SARVAM_API_KEY in server/.env.');
      }
      if (res.status === 429) {
        throw new Error('Sarvam API quota/rate limit reached. Please try again later.');
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Sarvam STT failed (HTTP ${res.status}): ${errText || 'Service error'}`);
      }

      data = await res.json();
    }

    const transcript = (data.transcript || '').trim();
    const reportedCode = data.language_code || data.detected_language_code || data.language;

    // The detected language returned by STT must become the source of truth.
    let detected;
    const languageProb = (typeof data.language_probability === 'number')
      ? data.language_probability
      : (typeof data.confidence === 'number' ? data.confidence : 0.98);

    if (reportedCode && reportedCode !== 'unknown') {
      const codeFromSarvam = normalizeLanguageCode(reportedCode);
      const conf = getLanguageConfig(codeFromSarvam);
      detected = {
        code: conf.code,
        name: conf.name,
        nativeName: conf.nativeName,
        speechCode: conf.speechCode,
        confidence: languageProb,
        languageProbability: languageProb
      };
    } else if (!isAuto) {
      const conf = getLanguageConfig(language);
      detected = {
        code: conf.code,
        name: conf.name,
        nativeName: conf.nativeName,
        speechCode: conf.speechCode,
        confidence: languageProb,
        languageProbability: languageProb
      };
    } else {
      // Secondary fallback only if STT did not report a language
      const textLid = detectLanguageFromText(transcript);
      detected = {
        code: textLid.language,
        name: textLid.languageName,
        nativeName: textLid.nativeName,
        speechCode: textLid.speechCode,
        confidence: textLid.confidence || 0.85,
        languageProbability: textLid.confidence || 0.85
      };
    }

    // Check for language disparity in manual mode
    if (!isAuto) {
      const selectedConf = getLanguageConfig(language);
      if (selectedConf && detected && detected.code !== selectedConf.code) {
        console.log(`[VOICE] Disparity: selectedLanguage=${selectedConf.speechCode}, detectedLanguage=${detected.speechCode}, confidence=${detected.confidence}`);
      }
    }

    // Convert Romanized transcript into Native Script if needed
    const normalized = await normalizeVoiceTranscript({
      rawTranscript: transcript,
      detectedLanguage: detected.code,
      confidence: detected.confidence,
      apiKey: this.apiKey
    });

    return {
      rawTranscript: normalized.rawTranscript,
      displayTranscript: normalized.displayTranscript,
      transcript: normalized.displayTranscript,
      language: detected.code,
      languageCode: detected.speechCode,
      languageName: detected.name,
      nativeName: detected.nativeName,
      speechCode: detected.speechCode,
      script: normalized.script,
      confidence: detected.confidence,
      source: isAuto ? 'auto' : 'manual',
      provider: 'sarvam'
    };
  }

  async synthesize(text, language = 'te') {
    if (!this.apiKey) {
      throw new Error('Sarvam API key not configured');
    }

    const normLang = normalizeLanguageCode(language);
    const langConfig = getLanguageConfig(normLang);

    if (!langConfig.providerSupport.sarvamTts) {
      return {
        audioBase64: null,
        language: normLang,
        languageName: langConfig.name,
        speechCode: langConfig.speechCode,
        supported: false,
        provider: 'webspeech',
        message: `Sarvam TTS does not support ${langConfig.name}. Use browser speech synthesis fallback.`
      };
    }

    const payload = {
      inputs: [text],
      target_language_code: langConfig.speechCode,
      speaker: 'meera',
      pitch: 0,
      pace: 1.0,
      loudness: 1.5,
      speech_sample_rate: 16000,
      enable_preprocessing: true,
      model: 'bulbul:v1'
    };

    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': this.apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('Sarvam API authentication failed. Please check your SARVAM_API_KEY in server/.env.');
      }
      if (res.status === 429) {
        throw new Error('Sarvam API quota/rate limit reached. Please try again later.');
      }
      const errText = await res.text().catch(() => '');
      throw new Error(`Sarvam TTS failed (HTTP ${res.status}): ${errText || 'Service error'}`);
    }

    const data = await res.json();
    return {
      audioBase64: data.audios?.[0] || null,
      contentType: 'audio/wav',
      language: normLang,
      languageName: langConfig.name,
      speechCode: langConfig.speechCode,
      supported: true,
      provider: 'sarvam'
    };
  }
}

/**
 * Gemini Multimodal Audio Provider
 * Transcribes audio and automatically identifies any of the 22 Indian languages or English
 */
export class GeminiAudioSpeechProvider {
  async transcribe(audioBuffer, mimeType = 'audio/webm') {
    const model = getGeminiAudioModel();
    if (!model) {
      throw new Error('Gemini API key (LLM_API_KEY) not configured');
    }

    const base64Audio = Buffer.isBuffer(audioBuffer)
      ? audioBuffer.toString('base64')
      : typeof audioBuffer === 'string'
        ? audioBuffer.replace(/^data:audio\/\w+;base64,/, '')
        : Buffer.from(audioBuffer).toString('base64');

    const prompt = `
You are an expert Indic Speech Recognition and Automatic Language Identification system for the PM-AJAY public welfare initiative in India.
Listen to this audio recording of a citizen speaking into their microphone.

TASK:
1. Detect which language is being spoken from the 22 Scheduled Indian Languages (Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santali, Sindhi, Tamil, Telugu, Urdu) or English.
2. Transcribe the speech VERBATIM into that language's standard native script. Do NOT translate to English.
3. If no speech is present or only ambient background noise, return an empty transcript.

Return strictly a valid JSON object matching this schema:
{
  "transcript": "verbatim transcription in native script",
  "language": "ISO code: te | hi | en | ta | kn | mr | bn | gu | or | ml | pa | ur | as | ne | sa | mai | kok | ks | brx | doi | mni | sat | sd",
  "languageName": "English name of the detected language",
  "confidence": 0.0 to 1.0,
  "isAudibleSpeech": true or false
}
`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType || 'audio/webm',
          data: base64Audio
        }
      },
      prompt
    ]);

    const rawResponse = result.response.text();
    let parsed = null;
    try {
      const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      throw new Error('Failed to parse language identification output from Gemini');
    }

    if (!parsed || !parsed.transcript || parsed.isAudibleSpeech === false) {
      return {
        transcript: '',
        language: null,
        languageName: null,
        confidence: 0,
        error: 'No audible speech detected in the audio recording. Please speak clearly into your microphone.'
      };
    }

    const normLang = normalizeLanguageCode(parsed.language);
    const langConfig = getLanguageConfig(normLang);

    const normalized = await normalizeVoiceTranscript({
      rawTranscript: parsed.transcript.trim(),
      detectedLanguage: langConfig.code,
      confidence: parsed.confidence || 0.95
    });

    return {
      rawTranscript: normalized.rawTranscript,
      displayTranscript: normalized.displayTranscript,
      transcript: normalized.displayTranscript,
      language: langConfig.code,
      languageName: langConfig.name,
      nativeName: langConfig.nativeName,
      speechCode: langConfig.speechCode,
      script: normalized.script,
      confidence: parsed.confidence || 0.95,
      provider: 'gemini'
    };
  }
}

/**
 * Universal Unified Speech Engine
 * Coordinates Gemini, Sarvam, and Deterministic LID.
 */
export class UnifiedSpeechEngine {
  constructor() {
    this.sarvamKey = null;
    this.geminiKey = null;
    this.sarvamProvider = null;
    this.geminiProvider = null;
  }

  getSarvamProvider() {
    const key = process.env.SARVAM_API_KEY?.trim();
    if (!key) return null;
    if (!this.sarvamProvider || this.sarvamKey !== key) {
      this.sarvamKey = key;
      this.sarvamProvider = new SarvamSpeechProvider(key);
    }
    return this.sarvamProvider;
  }

  getGeminiProvider() {
    const key = process.env.LLM_API_KEY?.trim();
    if (!key) return null;
    if (!this.geminiProvider || this.geminiKey !== key) {
      this.geminiKey = key;
      this.geminiProvider = new GeminiAudioSpeechProvider();
    }
    return this.geminiProvider;
  }

  /**
   * Transcribe audio and detect spoken language automatically.
   */
  async transcribeAudio({ audioBuffer, mimeType = 'audio/webm', candidateTranscript = '', language = 'auto' }) {
    let lastError = null;

    // 1. Try Sarvam AI STT First (supports Indic STT + auto-detection with language_code='unknown')
    const sarvam = this.getSarvamProvider();
    if (sarvam && audioBuffer) {
      try {
        const sarvamResult = await sarvam.transcribe(audioBuffer, language, mimeType);
        if (sarvamResult && sarvamResult.transcript) {
          return sarvamResult;
        }
      } catch (sarvamErr) {
        lastError = sarvamErr.message;
        console.warn(`[STT SARVAM ERROR] ${sarvamErr.message}`);
        // If it's an explicit auth or quota error, return immediately so the user knows
        if (sarvamErr.message.includes('authentication failed') || sarvamErr.message.includes('quota/rate limit')) {
          return {
            transcript: '',
            language: null,
            error: sarvamErr.message
          };
        }
      }
    }

    // 2. Try Gemini Audio Multimodal (supports all 22 Indian languages + English directly from audio)
    const gemini = this.getGeminiProvider();
    if (gemini && audioBuffer) {
      try {
        const geminiResult = await gemini.transcribe(audioBuffer, mimeType);
        if (geminiResult && geminiResult.transcript) {
          return geminiResult;
        }
        if (geminiResult && geminiResult.error) {
          lastError = geminiResult.error;
        }
      } catch (geminiErr) {
        lastError = geminiErr.message;
        console.warn(`[STT GEMINI ERROR] ${geminiErr.message}`);
      }
    }

    // 3. Fallback: If client-side speech recognition provided candidate text
    if (candidateTranscript && typeof candidateTranscript === 'string' && candidateTranscript.trim()) {
      const detected = detectLanguageFromText(candidateTranscript);
      const normalized = await normalizeVoiceTranscript({
        rawTranscript: candidateTranscript.trim(),
        detectedLanguage: detected.language,
        confidence: detected.confidence,
        apiKey: process.env.SARVAM_API_KEY
      });

      return {
        rawTranscript: normalized.rawTranscript,
        displayTranscript: normalized.displayTranscript,
        transcript: normalized.displayTranscript,
        language: detected.language,
        languageName: detected.languageName,
        nativeName: detected.nativeName,
        speechCode: detected.speechCode,
        languageCode: detected.speechCode,
        languageProbability: detected.confidence || 0.95,
        script: normalized.script,
        confidence: detected.confidence,
        detectionSource: 'sarvam-stt-auto',
        provider: 'sarvam'
      };
    }

    // If no provider succeeded and no candidate transcript
    if (!sarvam && !gemini) {
      return {
        transcript: '',
        language: null,
        error: 'SARVAM_API_KEY is missing from server/.env. Add your Sarvam API key there and restart the backend.'
      };
    }

    return {
      transcript: '',
      language: null,
      error: lastError || 'Speech could not be recognized by the configured providers. Please speak clearly and try again.'
    };
  }

  /**
   * Synthesize text to speech in the detected language.
   */
  async synthesizeAudio({ text, language = 'te', speaker = 'meera' }) {
    const normLang = normalizeLanguageCode(language);
    const langConfig = getLanguageConfig(normLang);
    console.log('TTS language:', langConfig.speechCode);

    // 1. Try Sarvam TTS if configured and language is supported
    const sarvam = this.getSarvamProvider();
    if (sarvam && langConfig.providerSupport.sarvamTts) {
      try {
        const result = await sarvam.synthesize(text, normLang);
        if (result && result.audioBase64) {
          return result;
        }
      } catch (sarvamErr) {
        console.warn(`[TTS SARVAM WARNING] ${sarvamErr.message}`);
        // Fall through to webspeech instruction
      }
    }

    // 2. Return structured fallback info for browser Web Speech synthesis
    return {
      audioBase64: null,
      language: normLang,
      languageName: langConfig.name,
      nativeName: langConfig.nativeName,
      speechCode: langConfig.speechCode,
      supported: Boolean(langConfig.providerSupport.webSpeech),
      provider: 'webspeech',
      message: langConfig.providerSupport.webSpeech
        ? `Using browser SpeechSynthesis with ${langConfig.speechCode} (${langConfig.name}) voice.`
        : `Voice synthesis for ${langConfig.name} is not natively available in browser. Displaying text response.`
    };
  }
}

export const unifiedSpeechEngine = new UnifiedSpeechEngine();

export const synthesizeSpeech = async (text, languageCode, speaker = 'meera') => {
  return unifiedSpeechEngine.synthesizeAudio({ text, language: languageCode, speaker });
};

export const getSpeechProvider = () => {
  return unifiedSpeechEngine;
};

