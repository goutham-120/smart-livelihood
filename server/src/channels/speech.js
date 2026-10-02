/**
 * Speech Provider Interface for PM AJAY AI Voice Assistant
 * Supports Browser Web Speech by default, and Sarvam AI Indic STT/TTS when SARVAM_API_KEY is configured.
 * Provider agnostic design enables future addition of Bhashini or other Indic models.
 */

class BaseSpeechProvider {
  async transcribe(audioBuffer, language = 'te') {
    throw new Error('Transcribe method must be implemented by speech provider');
  }

  async synthesize(text, language = 'te') {
    throw new Error('Synthesize method must be implemented by speech provider');
  }

  async translate(text, sourceLang, targetLang) {
    throw new Error('Translate method must be implemented by speech provider');
  }
}

class SarvamSpeechProvider extends BaseSpeechProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async transcribe(audioBuffer, language = 'te-IN') {
    if (!this.apiKey) {
      throw new Error('Sarvam API key not configured');
    }

    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('file', blob, 'recording.wav');
    formData.append('model', 'saaras:v1');
    formData.append('language_code', language.includes('-') ? language : `${language}-IN`);

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
    return {
      transcript: data.transcript || '',
      languageCode: data.language_code || language
    };
  }

  async synthesize(text, language = 'te-IN') {
    if (!this.apiKey) {
      throw new Error('Sarvam API key not configured');
    }

    const payload = {
      inputs: [text],
      target_language_code: language.includes('-') ? language : `${language}-IN`,
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
      audioBase64: data.audios?.[0] || null
    };
  }

  async translate(text, sourceLang = 'auto', targetLang = 'te-IN') {
    if (!this.apiKey) {
      throw new Error('Sarvam API key not configured');
    }

    const payload = {
      input: text,
      source_language_code: sourceLang,
      target_language_code: targetLang,
      speaker_gender: 'Female',
      mode: 'formal',
      model: 'mayura:v1'
    };

    const res = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': this.apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Sarvam Translation failed: ${errText}`);
    }

    const data = await res.json();
    return {
      translatedText: data.translated_text || text
    };
  }
}

class WebSpeechProvider extends BaseSpeechProvider {
  // Web speech is handled directly on client side via SpeechRecognition and SpeechSynthesis
  async transcribe() {
    return {
      transcript: '',
      message: 'Browser Web Speech API used directly on client device'
    };
  }

  async synthesize() {
    return {
      audioBase64: null,
      message: 'Browser SpeechSynthesis used directly on client device'
    };
  }
}

export const getSpeechProvider = () => {
  const providerType = process.env.SPEECH_PROVIDER || 'webspeech';
  const sarvamKey = process.env.SARVAM_API_KEY;

  if (providerType === 'sarvam' && sarvamKey) {
    return new SarvamSpeechProvider(sarvamKey);
  }
  return new WebSpeechProvider();
};
