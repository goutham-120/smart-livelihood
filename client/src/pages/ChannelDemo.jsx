import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Send,
  Sparkles,
  CheckCheck,
  CheckCircle,
  FileText,
  Volume2,
  VolumeX,
  Languages,
  Radio
} from 'lucide-react';
import { playIndicSpeech, stopIndicSpeech, getLanguageByCode } from '../i18n/languages.js';
import { api } from '../api.js';
import './ChannelDemo.css';

const SCENARIOS = [
  {
    title: 'Tailor & Weaver (Warangal)',
    phone: '9848011223',
    lang: 'te',
    firstMsg: 'నమస్కారం, నాకు కుట్టుపని మరియు చేనేత అనుభవం ఉంది. సొంతంగా చిన్న టైలరింగ్ షాప్ పెట్టుకోవాలనుకుంటున్నాను.'
  },
  {
    title: 'Dairy Farmer (Adilabad)',
    phone: '9848044556',
    lang: 'te',
    firstMsg: 'మా ఊరిలో పశుపోషణ చేస్తాము. డెయిరీ ఫార్మింగ్ మరియు మిల్కింగ్ మెషిన్ ట్రైనింగ్ కావాలి.'
  },
  {
    title: 'Solar Youth (Nalgonda)',
    phone: '9848077889',
    lang: 'hi',
    firstMsg: 'नमस्ते, मैंने 10वीं पास की है. मैं सोलर पैनल इंस्टॉलेशन और बिजली का काम सीखना चाहता हूँ.'
  }
];

export const ChannelDemo = () => {
  const { t } = useTranslation();
  // WhatsApp State
  const [waMessages, setWaMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! Welcome to PM AJAY Sahayak. I can help you with free skill training, jobs, and government loan schemes. How can I assist you today?',
      time: '10:00 AM'
    }
  ]);
  const [waInput, setWaInput] = useState('');
  const [waPhone, setWaPhone] = useState('9848011223');
  const [waLoading, setWaLoading] = useState(false);
  const waEndRef = useRef(null);

  // Left Phone WhatsApp Real Voice Input State
  const [waVoiceState, setWaVoiceState] = useState('IDLE'); // 'IDLE' | 'LISTENING' | 'PROCESSING' | 'DETECTED' | 'SPEAKING' | 'ERROR'
  const [waStatusBanner, setWaStatusBanner] = useState(null);
  const [waErrorMessage, setWaErrorMessage] = useState(null);
  const [waSpeakingId, setWaSpeakingId] = useState(null);

  // Left Phone Audio Recording References
  const waMediaRecorderRef = useRef(null);
  const waAudioChunksRef = useRef([]);
  const waRecognitionRef = useRef(null);
  const waSilenceTimerRef = useRef(null);
  const waIsListeningRef = useRef(false);
  const waAudioStreamRef = useRef(null);

  // IVR & Voice Assistant State
  const [callActive, setCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('IDLE');
  const ivrMode = 'dtmf'; // IVR helpline is keypad (DTMF) only
  const [voiceState, setVoiceState] = useState('IDLE'); // IDLE, LISTENING, PROCESSING, LANGUAGE DETECTED, THINKING, SPEAKING, ERROR
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [userTranscript, setUserTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]);

  // Telephony DTMF State
  const [ivrStep, setIvrStep] = useState('language');
  const [ivrPrompt, setIvrPrompt] = useState('Dial 1800-123-AJAY to connect with the automated PM AJAY livelihood helpline.');
  const [dtmfBuffer, setDtmfBuffer] = useState('');
  const [smsReceived, setSmsReceived] = useState(null);
  const [callTimer, setCallTimer] = useState(0);

  // Audio Recording References
  const callIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    waEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [waMessages]);

  useEffect(() => {
    if (callActive) {
      callIntervalRef.current = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(callIntervalRef.current);
      setCallTimer(0);
      stopIndicSpeech();
      stopListening();
    }
    return () => {
      clearInterval(callIntervalRef.current);
      stopIndicSpeech();
      stopListening();
    };
  }, [callActive]);

  // WhatsApp Actions
  const handleStopWaAudio = () => {
    stopIndicSpeech();
    setWaVoiceState('STOPPED');
    setWaSpeakingId(null);
    setWaStatusBanner('Audio playback stopped');
    setTimeout(() => {
      setWaStatusBanner((curr) => (curr === 'Audio playback stopped' ? null : curr));
      setWaVoiceState((curr) => (curr === 'STOPPED' ? 'IDLE' : curr));
    }, 2500);
  };

  const handlePlayMessageAudio = (m) => {
    if (waSpeakingId === m.id) {
      handleStopWaAudio();
      return;
    }
    stopIndicSpeech();
    setWaVoiceState('SPEAKING');
    setWaSpeakingId(m.id);
    const langObj = getLanguageByCode(m.language || 'hi');
    const speechCode = m.speechCode || langObj.speechCode;
    setWaStatusBanner(`Playing audio in ${m.languageName || langObj.name}...`);

    playIndicSpeech({
      text: m.text,
      language: m.language || 'hi',
      speechCode,
      onStart: () => {
        setWaVoiceState('SPEAKING');
        setWaSpeakingId(m.id);
      },
      onEnd: () => {
        setWaVoiceState('IDLE');
        setWaSpeakingId(null);
        setWaStatusBanner(null);
      }
    });
  };

  const handleSendWa = async (msgText, targetPhone) => {
    // Silence any active assistant audio immediately before sending
    stopIndicSpeech();
    setWaSpeakingId(null);
    if (waVoiceState === 'SPEAKING' || waVoiceState === 'STOPPED') {
      setWaVoiceState('IDLE');
    }

    const text = String(msgText || waInput).trim();
    if (!text) return;
    const phoneToUse = targetPhone || waPhone;

    setWaInput('');
    setWaErrorMessage(null);
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWaMessages((prev) => [...prev, userMsg]);
    setWaLoading(true);

    try {
      // Dynamic language per turn - NEVER hardcode 'te'
      const res = await fetch('/api/channels/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'whatsapp',
          message: text,
          phone: phoneToUse,
          language: 'auto'
        })
      });
      const data = await res.json();
      if (data.simulatedResponse || data.replyText) {
        const replyText = data.simulatedResponse || data.replyText;
        const replyLang = data.language || 'en';

        setWaMessages((prev) => {
          const next = [...prev];
          if (data.displayUserMessage && data.displayUserMessage !== text) {
            const lastUserIdx = next.findLastIndex ? next.findLastIndex((m) => m.sender === 'user') : -1;
            if (lastUserIdx !== -1) {
              next[lastUserIdx] = {
                ...next[lastUserIdx],
                text: data.displayUserMessage
              };
            }
          }
          return [
            ...next,
            {
              sender: 'bot',
              text: replyText,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              language: replyLang,
              languageName: data.languageName,
              speechCode: data.speechCode
            }
          ];
        });
      }
    } catch (err) {
      setWaMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Details recorded. Our livelihood counselor will assist you.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setWaLoading(false);
    }
  };

  // Real Computer Microphone Recording for Left Phone
  const startWaVoiceRecording = async () => {
    stopIndicSpeech();
    setWaErrorMessage(null);
    waAudioChunksRef.current = [];
    waIsListeningRef.current = true;
    setWaVoiceState('LISTENING');
    setWaStatusBanner('Listening...');

    let candidateTranscript = '';

    // 1. Browser Speech Recognition Candidate Listener (natural speech, no hardcoded te-IN)
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e) => {
          const trans = Array.from(e.results).map((r) => r[0].transcript).join(' ');
          candidateTranscript = trans;

          if (waSilenceTimerRef.current) clearTimeout(waSilenceTimerRef.current);
          waSilenceTimerRef.current = setTimeout(() => {
            if (waIsListeningRef.current) {
              stopWaListening();
            }
          }, 2500);
        };
        rec.onerror = () => {};
        rec.start();
        waRecognitionRef.current = rec;
      } catch (e) {}
    }

    // 2. Real Microphone MediaRecorder Stream Capture
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone mediaDevices API not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      waAudioStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      waMediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          waAudioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (waAudioStreamRef.current) {
          waAudioStreamRef.current.getTracks().forEach((track) => track.stop());
          waAudioStreamRef.current = null;
        }

        const audioBlob = new Blob(waAudioChunksRef.current, { type: mimeType });
        await processWaAudio(audioBlob, candidateTranscript, mimeType);
      };

      mediaRecorder.start(250);

      // Auto-stop maximum timeout at 15 seconds
      waSilenceTimerRef.current = setTimeout(() => {
        if (waIsListeningRef.current) {
          stopWaListening();
        }
      }, 15000);
    } catch (err) {
      setWaVoiceState('ERROR');
      setWaStatusBanner(null);
      const errText = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
        ? 'Microphone permission was denied. Please allow microphone access in your browser settings.'
        : 'Could not access microphone: ' + (err.message || 'Unknown error');
      setWaErrorMessage(errText);
      waIsListeningRef.current = false;
    }
  };

  const stopWaListening = () => {
    waIsListeningRef.current = false;
    if (waSilenceTimerRef.current) {
      clearTimeout(waSilenceTimerRef.current);
      waSilenceTimerRef.current = null;
    }

    if (waRecognitionRef.current) {
      try {
        waRecognitionRef.current.stop();
      } catch (e) {}
      waRecognitionRef.current = null;
    }

    if (waMediaRecorderRef.current && waMediaRecorderRef.current.state !== 'inactive') {
      try {
        waMediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const handleToggleWaMic = () => {
    if (waVoiceState === 'SPEAKING') {
      handleStopWaAudio();
      return;
    }
    if (waVoiceState === 'LISTENING') {
      stopWaListening();
    } else {
      startWaVoiceRecording();
    }
  };

  // Process Spoken Microphone Audio with STT Auto-Detection & Multilingual Reply
  const processWaAudio = async (audioBlob, candidateTranscript, mimeType) => {
    setWaVoiceState('PROCESSING');
    setWaStatusBanner('Processing voice audio...');
    setWaErrorMessage(null);

    try {
      let audioBase64 = null;
      if (audioBlob && audioBlob.size > 200) {
        audioBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(audioBlob);
        });
      }

      // 1. Send real microphone audio to STT backend with language = 'auto'
      const sttResult = await api.speechToText({
        audioBase64,
        mimeType,
        transcript: candidateTranscript,
        language: 'auto'
      });

      if (sttResult.error) {
        setWaVoiceState('ERROR');
        setWaStatusBanner(null);
        setWaErrorMessage(sttResult.error);
        return;
      }

      const displayTranscript = (sttResult.displayTranscript || sttResult.transcript || candidateTranscript || '').trim();
      const rawTranscript = (sttResult.rawTranscript || candidateTranscript || displayTranscript).trim();

      if (!displayTranscript) {
        setWaVoiceState('ERROR');
        setWaStatusBanner(null);
        const lastLang = waMessages.findLast ? waMessages.findLast((m) => m.language)?.language : 'hi';
        const inaudiblePrompt = lastLang === 'te'
          ? 'మీ మాట స్పష్టంగా వినిపించలేదు. దయచేసి మైక్రోఫోన్ దగ్గరగా వచ్చి మళ్ళీ మాట్లాడండి.'
          : lastLang === 'ta'
            ? 'உங்கள் குரல் தெளிவாக கேட்கவில்லை. தயவுசெய்து மீண்டும் பேசவும்.'
            : lastLang === 'bn'
              ? 'আপনার কথা স্পষ্ট শোনা যায়নি। অনুগ্রহ করে আবার বলুন।'
              : 'मुझे आपकी आवाज़ साफ़ सुनाई नहीं दी। कृपया दोबारा बोलें।';
        setWaErrorMessage(inaudiblePrompt);
        return;
      }

      const detectedLang = sttResult.language || 'auto';
      const detectedSpeechCode = sttResult.speechCode || (detectedLang !== 'auto' ? `${detectedLang}-IN` : null);
      const detectedLangName = sttResult.languageName || '';
      const detectedScript = sttResult.script || 'Deva';

      console.log('[VOICE STT] raw transcript:', rawTranscript);
      console.log('[NATIVE TRANSCRIPT] display transcript:', displayTranscript);
      console.log('[VOICE STT] detected language:', detectedSpeechCode);
      console.log('[VOICE STT] detected script:', detectedScript);
      console.log('Language confidence:', sttResult.confidence || 0.95);

      // 2. Display detected language state inside Left Phone
      setWaVoiceState('DETECTED');
      const langBannerText = `Detected language: ${detectedLangName}`;
      setWaStatusBanner(langBannerText);

      // 3. Display user's spoken transcript in NATIVE SCRIPT directly in chat bubble
      const userMsg = {
        id: Date.now(),
        sender: 'user',
        text: displayTranscript,
        rawText: rawTranscript,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isVoice: true,
        language: detectedLang,
        languageName: detectedLangName,
        speechCode: detectedSpeechCode,
        script: detectedScript
      };
      setWaMessages((prev) => [...prev, userMsg]);
      setWaLoading(true);

      // 4. Send native script transcript + detected language explicitly to assistant
      const res = await fetch('/api/channels/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'whatsapp',
          message: displayTranscript,
          rawMessage: rawTranscript,
          phone: waPhone,
          language: detectedSpeechCode,
          lang: detectedLang,
          isVoice: true
        })
      });
      const data = await res.json();
      const replyText = data.simulatedResponse || data.replyText || data.response || 'Details recorded.';
      const replySpeechCode = data.speechCode || detectedSpeechCode;
      const replyLang = data.language || detectedLang;
      const replyLangName = data.languageName || detectedLangName;

      console.log('Final assistant language:', replySpeechCode);
      console.log('TTS language:', replySpeechCode);

      // 5. Display assistant response inside Left Phone in the SAME language
      const botMsgId = Date.now();
      const botMsg = {
        id: botMsgId,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: replyLang,
        languageName: replyLangName,
        speechCode: replySpeechCode
      };

      setWaMessages((prev) => {
        const next = [...prev];
        const lastUserIdx = next.findLastIndex ? next.findLastIndex((m) => m.sender === 'user') : -1;
        if (lastUserIdx !== -1) {
          next[lastUserIdx] = {
            ...next[lastUserIdx],
            language: replyLang,
            languageName: replyLangName,
            speechCode: replySpeechCode
          };
        }
        return [...next, botMsg];
      });
      setWaLoading(false);

      // 6. Speak response via TTS in the detected language with STOP capability
      setWaVoiceState('SPEAKING');
      setWaSpeakingId(botMsgId);
      setWaStatusBanner(`Speaking in ${replyLangName || 'native voice'}...`);

      playIndicSpeech({
        text: replyText,
        language: replyLang,
        speechCode: replySpeechCode,
        onStart: () => {
          setWaVoiceState('SPEAKING');
          setWaSpeakingId(botMsgId);
          setWaStatusBanner(`Speaking in ${replyLangName || 'native voice'}...`);
        },
        onEnd: () => {
          setWaVoiceState('IDLE');
          setWaSpeakingId(null);
          setWaStatusBanner(null);
        }
      });

      // Clear the temporary language detection banner after 5 seconds
      setTimeout(() => {
        setWaStatusBanner((current) => current === langBannerText ? null : current);
      }, 5000);
    } catch (err) {
      setWaVoiceState('ERROR');
      setWaStatusBanner(null);
      setWaErrorMessage('Speech processing failed: ' + (err.message || 'Server error. Please try again.'));
      setWaLoading(false);
    }
  };

  // Call Lifecycle Actions
  const handleStartCall = async () => {
    setCallActive(true);
    setCallStatus('CONNECTED');
    setVoiceState('IDLE');
    setIvrStep('language');
    setDtmfBuffer('');
    setSmsReceived(null);
    setUserTranscript('');
    setAssistantReply('');
    setDetectedLanguage(null);
    setErrorMessage(null);

    const greeting = 'నమస్కారం! PM-AJAY ఉపాధి హెల్ప్‌లైన్‌కు స్వాగతం. తెలుగు కోసం 1 నొక్కండి. हिन्दी के लिए 2 दबाएं. For English, press 3.';
    setIvrPrompt(greeting);
    setAssistantReply(greeting);

    // Speak initial greeting
    setVoiceState('SPEAKING');
    playIndicSpeech({
      text: greeting,
      language: 'te',
      onEnd: () => {
        setVoiceState('IDLE');
      }
    });
  };

  const handleEndCall = () => {
    stopIndicSpeech();
    stopListening();
    setCallActive(false);
    setCallStatus('CALL ENDED');
    setVoiceState('IDLE');
    setIvrPrompt('Call disconnected. Press Dial to connect again.');
  };

  // Real Microphone Recording Flow
  const startListening = async () => {
    if (!callActive) return;
    stopIndicSpeech();
    setErrorMessage(null);
    audioChunksRef.current = [];
    isListeningRef.current = true;
    setVoiceState('LISTENING');

    let candidateTranscript = '';

    // 1. Initialize Browser Speech Recognition candidate listener if supported
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'te-IN'; // candidate default; auto-detection handles final language
        rec.onresult = (e) => {
          const trans = Array.from(e.results).map((r) => r[0].transcript).join(' ');
          candidateTranscript = trans;
          setUserTranscript(trans);

          // Reset silence timer on fresh speech
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              stopListening();
            }
          }, 2200);
        };
        rec.onerror = () => {};
        rec.start();
        recognitionRef.current = rec;
      } catch (e) {}
    }

    // 2. Initialize MediaRecorder with actual microphone stream
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone mediaDevices API not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processSpokenAudio(audioBlob, candidateTranscript, mimeType);
      };

      mediaRecorder.start(250);
    } catch (err) {
      setVoiceState('ERROR');
      setErrorMessage(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser.'
          : 'Could not access microphone: ' + (err.message || 'Unknown error')
      );
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  // Speech-to-Text, Language Detection, Assistant Chat, and TTS Pipeline
  const processSpokenAudio = async (audioBlob, candidateTranscript, mimeType) => {
    setVoiceState('PROCESSING');

    try {
      // Convert Blob to Base64
      let audioBase64 = null;
      if (audioBlob && audioBlob.size > 500) {
        audioBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(audioBlob);
        });
      }

      // Step 1: Send Audio to Speech-to-Text with Automatic Language Detection
      const sttResponse = await api.speechToText({
        audioBase64,
        mimeType: mimeType || 'audio/webm',
        transcript: candidateTranscript,
        language: 'auto'
      });

      const transcript = sttResponse.transcript || candidateTranscript;
      if (!transcript || !transcript.trim()) {
        setVoiceState('ERROR');
        setErrorMessage('No audible speech detected. Please speak clearly into your microphone.');
        return;
      }

      // Step 2: Language Detected State
      const detected = {
        language: sttResponse.language || 'en',
        languageName: sttResponse.languageName || 'English',
        nativeName: sttResponse.nativeName || 'English',
        speechCode: sttResponse.speechCode || 'en-IN',
        confidence: Math.round((sttResponse.confidence || 0.9) * 100)
      };

      setDetectedLanguage(detected);
      setUserTranscript(transcript);
      setVoiceState('LANGUAGE DETECTED');

      // Step 3: Process Dialogue Turn with Assistant in the SAME Detected Language
      setTimeout(async () => {
        setVoiceState('THINKING');
        try {
          const chatRes = await api.chatAssistant({
            message: transcript,
            language: detected.language,
            channel: 'ivr',
            phone: waPhone
          });

          const replyText = chatRes.replyText || chatRes.response || 'ధన్యవాదాలు! మీ వివరాలు నమోదయ్యాయి.';
          setAssistantReply(replyText);
          setIvrPrompt(replyText);

          if (chatRes.extractedSkills && chatRes.extractedSkills.length > 0) {
            setExtractedSkills(chatRes.extractedSkills);
          }

          // Step 4: Convert Response Back to Speech Using Detected Language TTS
          setVoiceState('SPEAKING');
          playIndicSpeech({
            text: replyText,
            language: detected.language,
            onEnd: () => {
              setVoiceState('IDLE');
            }
          });
        } catch (chatErr) {
          setVoiceState('ERROR');
          setErrorMessage('Assistant intelligence service temporarily unavailable.');
        }
      }, 500);
    } catch (err) {
      setVoiceState('ERROR');
      setErrorMessage(err.response?.data?.error || err.message || 'Speech recognition failed.');
    }
  };

  // Simulated Voice Turn via Quick Voice Phrases
  const handleSimulateVoiceSpeech = (sampleText, sampleLang) => {
    if (!callActive) {
      handleStartCall();
    }
    stopIndicSpeech();
    setUserTranscript(sampleText);
    setVoiceState('PROCESSING');

    // Simulate STT & LID
    setTimeout(() => {
      const langConfig = getLanguageByCode(sampleLang);
      const detected = {
        language: langConfig.code,
        languageName: langConfig.name,
        nativeName: langConfig.nativeName,
        speechCode: langConfig.speechCode,
        confidence: 98
      };
      setDetectedLanguage(detected);
      setVoiceState('LANGUAGE DETECTED');

      setTimeout(async () => {
        setVoiceState('THINKING');
        try {
          const chatRes = await api.chatAssistant({
            message: sampleText,
            language: sampleLang,
            channel: 'ivr',
            phone: waPhone
          });

          const replyText = chatRes.replyText || chatRes.response || 'ధన్యవాదాలు!';
          setAssistantReply(replyText);
          setIvrPrompt(replyText);

          if (chatRes.extractedSkills?.length > 0) {
            setExtractedSkills(chatRes.extractedSkills);
          }

          setVoiceState('SPEAKING');
          playIndicSpeech({
            text: replyText,
            language: sampleLang,
            onEnd: () => setVoiceState('IDLE')
          });
        } catch (e) {
          setVoiceState('ERROR');
          setErrorMessage('Failed to connect to assistant service.');
        }
      }, 500);
    }, 400);
  };

  // DTMF Keypad Actions (Preserving full telephony simulation)
  const handleKeypadPress = async (digit) => {
    if (!callActive) return;
    stopIndicSpeech();
    setDtmfBuffer((prev) => prev + digit);

    try {
      const res = await fetch('/api/channels/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'ivr',
          digits: String(digit),
          ivrStep,
          phone: waPhone
        })
      });
      const data = await res.json();

      if (data.audioPrompt) {
        setIvrPrompt(data.audioPrompt);
        setAssistantReply(data.audioPrompt);
        setVoiceState('SPEAKING');
        playIndicSpeech({
          text: data.audioPrompt,
          language: data.language || 'te',
          onEnd: () => setVoiceState('IDLE')
        });
      }
      if (data.ivrStep) {
        setIvrStep(data.ivrStep);
      }
      if (data.smsSummary) {
        setSmsReceived(data.smsSummary);
      }
    } catch (err) {}
  };

  const handleApplyScenario = (sc) => {
    setWaPhone(sc.phone);
    setWaMessages([
      {
        sender: 'bot',
        text: 'Namaste! Welcome to PM AJAY Sahayak. I can help you with free skill training, jobs, and government loan schemes. How can I assist you today?',
        time: '10:00 AM'
      }
    ]);
    handleSendWa(sc.firstMsg, sc.phone);
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getVoiceStateBadgeClass = () => {
    switch (voiceState) {
      case 'LISTENING': return 'ivr-state-listening';
      case 'PROCESSING': return 'ivr-state-processing';
      case 'LANGUAGE DETECTED': return 'ivr-state-detected';
      case 'THINKING': return 'ivr-state-thinking';
      case 'SPEAKING': return 'ivr-state-speaking';
      case 'ERROR': return 'ivr-state-error';
      default: return 'ivr-state-idle';
    }
  };

  return (
    <div className="channel-demo-container">
      {/* Header */}
      <div className="channel-demo-header">
        <h1 className="channel-demo-title">
          <Sparkles size={24} color="#ea580c" />
          {t('pages.channelDemo', 'Omni-Channel Voice & Messaging Telephony')}
        </h1>
        <p className="channel-demo-subtitle">
          {t('channelDemo.subtitle', 'Real-time multilingual voice assistant with automatic language detection (22 Indian languages) and WhatsApp bot')}
        </p>
      </div>

      {/* Preset Personas */}
      <div className="scenario-chips-row">
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>{t('channelDemo.loadScenario', 'Load Test Scenario:')}</span>
        {SCENARIOS.map((sc, i) => (
          <button key={i} className="scenario-chip" onClick={() => handleApplyScenario(sc)}>
            {sc.title}
          </button>
        ))}
      </div>

      {/* Dual Mockup Columns */}
      <div className="mockup-grid">
        {/* Column 1: WhatsApp Smartphone Mockup */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '8px', fontWeight: 700, color: '#075e54', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <MessageSquare size={18} /> WhatsApp Channel (Twilio Sandbox)
          </div>
          <div className="smartphone-frame">
            <div className="phone-screen">
              <div className="phone-camera-notch" />

              {/* WhatsApp Header */}
              <div className="wa-header">
                <div className="wa-avatar">AJ</div>
                <div className="wa-title-area">
                  <div className="wa-name">
                    PM AJAY Sahayak
                    <CheckCircle size={14} fill="#25d366" color="#ffffff" />
                  </div>
                  <div className="wa-status">Official Skilling Bot (Active)</div>
                </div>
              </div>

              {/* WhatsApp Audio Playing & Stop Banner */}
              {waVoiceState === 'SPEAKING' && (
                <div className="wa-audio-player-banner" id="wa-speaking-banner">
                  <div className="wa-audio-player-info">
                    <span className="wa-audio-pulse" />
                    <Volume2 size={16} />
                    <span>Assistant is speaking...</span>
                  </div>
                  <button
                    type="button"
                    className="wa-stop-audio-btn"
                    onClick={handleStopWaAudio}
                    id="wa-stop-audio-btn"
                    title="Stop audio playback immediately"
                  >
                    <VolumeX size={15} />
                    <span>Stop Audio</span>
                  </button>
                </div>
              )}

              {waVoiceState === 'STOPPED' && (
                <div className="wa-audio-player-banner stopped">
                  <VolumeX size={15} />
                  <span>Audio Stopped</span>
                </div>
              )}

              {/* WhatsApp Voice Status Banner */}
              {waStatusBanner && waVoiceState !== 'SPEAKING' && waVoiceState !== 'STOPPED' && (
                <div className="wa-voice-status-banner">
                  {waVoiceState === 'LISTENING' && <span className="wa-recording-pulse" />}
                  <span>{waStatusBanner}</span>
                </div>
              )}
              {waErrorMessage && (
                <div className="wa-voice-error-banner">
                  <span>{waErrorMessage}</span>
                  <button type="button" onClick={() => setWaErrorMessage(null)}>✕</button>
                </div>
              )}

              {/* WhatsApp Message Body */}
              <div className="wa-messages-body">
                {waMessages.map((m, idx) => (
                  <div key={m.id || idx} className={`wa-bubble ${m.sender === 'user' ? 'outgoing' : 'incoming'}`}>
                    <div>
                      {m.isVoice && <Mic size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom', color: '#128c7e' }} />}
                      {m.text}
                      {m.sender === 'bot' && (
                        <button
                          type="button"
                          onClick={() => handlePlayMessageAudio(m)}
                          className={`wa-play-audio-btn ${waSpeakingId === m.id ? 'playing' : ''}`}
                          title={waSpeakingId === m.id ? 'Stop audio' : 'Listen to reply via TTS'}
                        >
                          {waSpeakingId === m.id ? (
                            <>
                              <VolumeX size={13} color="#dc2626" />
                              <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700 }}>Stop</span>
                            </>
                          ) : (
                            <Volume2 size={13} />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="wa-time">
                      {m.languageName && (
                        <span style={{ fontSize: '9px', opacity: 0.8, marginRight: '4px', background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: '4px' }}>
                          {m.languageName}
                        </span>
                      )}
                      {m.time} {m.sender === 'user' && <CheckCheck size={12} color="#53bdeb" style={{ display: 'inline', marginLeft: '4px' }} />}
                    </div>
                  </div>
                ))}
                {waLoading && (
                  <div className="wa-bubble incoming" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                    typing...
                  </div>
                )}
                <div ref={waEndRef} />
              </div>

              {/* WhatsApp Input Footer */}
              <div className="wa-input-footer">
                <button
                  type="button"
                  onClick={handleToggleWaMic}
                  className={`wa-mic-btn ${waVoiceState === 'LISTENING' ? 'recording' : waVoiceState === 'SPEAKING' ? 'speaking' : ''}`}
                  title={
                    waVoiceState === 'LISTENING'
                      ? 'Click to stop recording'
                      : waVoiceState === 'SPEAKING'
                        ? 'Click to stop assistant audio'
                        : 'Click to speak using your microphone (auto-detects language)'
                  }
                >
                  {waVoiceState === 'LISTENING' ? (
                    <MicOff size={20} />
                  ) : waVoiceState === 'SPEAKING' ? (
                    <VolumeX size={20} color="#dc2626" />
                  ) : (
                    <Mic size={20} />
                  )}
                </button>
                <input
                  type="text"
                  className="wa-input"
                  placeholder={
                    waVoiceState === 'LISTENING'
                      ? 'Listening to microphone...'
                      : waVoiceState === 'SPEAKING'
                        ? 'Assistant is speaking (Click Stop Audio to silence)...'
                        : 'Type message or click mic to speak...'
                  }
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendWa()}
                />
                {waVoiceState === 'SPEAKING' ? (
                  <button
                    type="button"
                    className="wa-stop-audio-btn"
                    onClick={handleStopWaAudio}
                    title="Stop audio playback"
                    style={{ padding: '6px 10px' }}
                  >
                    <VolumeX size={15} />
                  </button>
                ) : (
                  <button type="button" className="wa-send-btn" onClick={() => handleSendWa()}>
                    <Send size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            Simulates Twilio Webhook POST to /api/channels/whatsapp/webhook
          </div>
        </div>

        {/* Column 2: Upgraded IVR & Real Multilingual Voice Assistant Mockup */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '8px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <PhoneCall size={18} /> IVR Helpline Simulator (Keypad DTMF)
          </div>

          <div className="ivr-frame">
            {/* LCD Screen Display */}
            <div className="ivr-lcd">
              {/* Header Status Bar */}
              <div className="ivr-call-status">
                <span>{callStatus}</span>
                <span className={`ivr-state-badge ${getVoiceStateBadgeClass()}`}>
                  {voiceState}
                </span>
                {callActive && <span>{formatTimer(callTimer)}</span>}
              </div>

              {/* Detected Language Chip */}
              {detectedLanguage && (
                <div className="ivr-detected-lang-chip">
                  <Languages size={12} />
                  <span>
                    Detected: <strong>{detectedLanguage.languageName}</strong> ({detectedLanguage.nativeName}) • {detectedLanguage.confidence}%
                  </span>
                </div>
              )}

              {/* Dialogue Box */}
              <div className="ivr-dialogue-box">
                {userTranscript && (
                  <div className="ivr-bubble-user">
                    <strong>You said:</strong> "{userTranscript}"
                  </div>
                )}
                <div className="ivr-bubble-ai">
                  <strong>Assistant:</strong> {assistantReply || ivrPrompt}
                </div>
              </div>

              {/* Error Notification if any */}
              {errorMessage && (
                <div style={{ color: '#fca5a5', fontSize: '11px', background: 'rgba(239, 68, 68, 0.2)', padding: '4px 8px', borderRadius: '4px', margin: '4px 0' }}>
                  {errorMessage}
                </div>
              )}

              {/* Extracted Skills Chips */}
              {extractedSkills.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#93c5fd' }}>Skills:</span>
                  {extractedSkills.map((sk, idx) => (
                    <span key={idx} style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.3)', padding: '1px 6px', borderRadius: '4px', color: '#bfdbfe' }}>
                      {sk.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom Display: DTMF */}
              <div className="ivr-digits-display">
                DTMF: {dtmfBuffer || '--'}
              </div>
            </div>

            {/* DTMF Keypad */}
            <div className="ivr-keypad">
              {[
                { d: '1', sub: 'TELUGU' },
                { d: '2', sub: 'HINDI' },
                { d: '3', sub: 'ENG' },
                { d: '4', sub: 'GHI' },
                { d: '5', sub: 'JKL' },
                { d: '6', sub: 'MNO' },
                { d: '7', sub: 'PQRS' },
                { d: '8', sub: 'TUV' },
                { d: '9', sub: 'WXYZ' },
                { d: '*', sub: 'REPEAT' },
                { d: '0', sub: 'OPERATOR' },
                { d: '#', sub: 'CONFIRM' }
              ].map((k) => (
                <button
                  key={k.d}
                  type="button"
                  className="keypad-btn"
                  onClick={() => handleKeypadPress(k.d)}
                >
                  <span>{k.d}</span>
                  <span className="keypad-sub">{k.sub}</span>
                </button>
              ))}
            </div>

            {/* Call Action Buttons */}
            <div className="ivr-call-actions">
              {!callActive ? (
                <button type="button" className="btn-call-start" onClick={handleStartCall} style={{ gridColumn: 'span 2' }}>
                  <PhoneCall size={18} /> Dial PM AJAY Helpline
                </button>
              ) : (
                <button type="button" className="btn-call-end" onClick={handleEndCall} style={{ gridColumn: 'span 2' }}>
                  <PhoneOff size={18} /> End Call
                </button>
              )}
            </div>

            {/* SMS Receipt upon Confirmation */}
            {smsReceived && (
              <div className="sms-receipt-card">
                <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} /> SMS Dispatched to Mobile:
                </div>
                <div>{smsReceived}</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            Connected to real multilingual Indic STT, Automatic Language Detection, and Indic TTS
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelDemo;
