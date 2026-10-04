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
    const norm = normalizeLanguageCode(langCode);
    const lang = SUPPORTED_LANGUAGES[norm];
    return Boolean(lang?.providerSupport?.sarvamStt);
  }

  async transcribe(audioBuffer, language = 'auto') {
    if (!this.apiKey) {
      throw new Error('Sarvam API key not configured');
    }

    // Per REST STT specification: Use language_code = 'unknown' for automatic language detection
    // Do NOT force 'en-IN' or 'te-IN'
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('file', blob, 'recording.wav');
    formData.append('model', 'saaras:v1');
    formData.append('language_code', 'unknown');

    const res = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': this.apiKey
      },
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Sarvam STT failed: ${errText}`);
    }

    const data = await res.json();
    const transcript = (data.transcript || '').trim();
    const reportedCode = data.language_code || data.detected_language_code || data.language;

    // The detected language returned by STT must become the source of truth.
    // Do not infer language from the transcript text.
    let detected;
    if (reportedCode && reportedCode !== 'unknown') {
      const codeFromSarvam = normalizeLanguageCode(reportedCode);
      const conf = getLanguageConfig(codeFromSarvam);
      detected = {
        code: conf.code,
        name: conf.name,
        nativeName: conf.nativeName,
        speechCode: conf.speechCode,
        confidence: data.confidence || 0.98
      };
    } else {
      // Secondary fallback only if STT did not report a language
      const textLid = detectLanguageFromText(transcript);
      detected = {
        code: textLid.language,
        name: textLid.languageName,
        nativeName: textLid.nativeName,
        speechCode: textLid.speechCode,
        confidence: textLid.confidence || 0.85
      };
    }

    console.log('STT transcript:', transcript);
    console.log('STT detected language:', detected.speechCode);
    console.log('Language confidence:', detected.confidence);

    return {
      transcript,
      language: detected.code,
      languageName: detected.name,
      nativeName: detected.nativeName,
      speechCode: detected.speechCode,
      confidence: detected.confidence,
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
      const errText = await res.text();
      throw new Error(`Sarvam TTS failed: ${errText}`);
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

    return {
      transcript: parsed.transcript.trim(),
      language: langConfig.code,
      languageName: langConfig.name,
      nativeName: langConfig.nativeName,
      speechCode: langConfig.speechCode,
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
    this.sarvamKey = process.env.SARVAM_API_KEY;
    this.geminiKey = process.env.LLM_API_KEY;
    this.sarvamProvider = this.sarvamKey ? new SarvamSpeechProvider(this.sarvamKey) : null;
    this.geminiProvider = this.geminiKey ? new GeminiAudioSpeechProvider() : null;
  }

  /**
   * Transcribe audio and detect spoken language automatically.
   */
  async transcribeAudio({ audioBuffer, mimeType = 'audio/webm', candidateTranscript = '', language = 'auto' }) {
    // 1. Try Sarvam AI STT First (supports Indic STT + auto-detection with language_code='unknown')
    if (this.sarvamProvider && audioBuffer) {
      try {
        const sarvamResult = await this.sarvamProvider.transcribe(audioBuffer, language);
        if (sarvamResult && sarvamResult.transcript) {
          return sarvamResult;
        }
      } catch (sarvamErr) {
        // Fall through to Gemini
      }
    }

    // 2. Try Gemini Audio Multimodal (supports all 22 Indian languages + English directly from audio)
    if (this.geminiProvider && audioBuffer) {
      try {
        const geminiResult = await this.geminiProvider.transcribe(audioBuffer, mimeType);
        if (geminiResult && geminiResult.transcript) {
          return geminiResult;
        }
        if (geminiResult && geminiResult.error) {
          return geminiResult;
        }
      } catch (geminiErr) {
        // Fall through to candidate transcript
      }
    }

    // 3. Fallback: If client-side speech recognition provided candidate text
    if (candidateTranscript && typeof candidateTranscript === 'string' && candidateTranscript.trim()) {
      const detected = detectLanguageFromText(candidateTranscript);
      console.log('STT transcript:', candidateTranscript.trim());
      console.log('STT detected language:', detected.speechCode);
      console.log('Language confidence:', detected.confidence);
      return {
        transcript: candidateTranscript.trim(),
        language: detected.language,
        languageName: detected.languageName,
        nativeName: detected.nativeName,
        speechCode: detected.speechCode,
        confidence: detected.confidence,
        provider: 'webspeech'
      };
    }

    // If no provider succeeded and no candidate transcript
    if (!this.geminiKey && !this.sarvamKey) {
      return {
        transcript: '',
        language: null,
        error: 'Cloud speech services require SARVAM_API_KEY or LLM_API_KEY in server/.env. Please use browser speech recognition or configure an API key.'
      };
    }

    return {
      transcript: '',
      language: null,
      error: 'Speech could not be recognized by the configured providers. Please speak clearly and try again.'
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
    if (this.sarvamProvider && langConfig.providerSupport.sarvamTts) {
      try {
        const result = await this.sarvamProvider.synthesize(text, normLang);
        if (result.audioBase64) {
          return result;
        }
      } catch (sarvamErr) {
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

export const getSpeechProvider = () => {
  return unifiedSpeechEngine;
};
