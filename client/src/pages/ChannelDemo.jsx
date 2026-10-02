import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  PhoneCall,
  PhoneOff,
  Mic,
  Send,
  Sparkles,
  CheckCheck,
  CheckCircle,
  FileText,
  Volume2
} from 'lucide-react';
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
  // WhatsApp State
  const [waMessages, setWaMessages] = useState([
    {
      sender: 'bot',
      text: 'నమస్కారం! PM AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. మీ నైపుణ్యాల ఆధారంగా ఉచిత శిక్షణ మరియు రుణ పథకాలను సిఫార్సు చేయడానికి మేము మీ వివరాలు నమోదు చేయవచ్చా? ప్రారంభించడానికి YES అని పంపండి.',
      time: '10:00 AM'
    }
  ]);
  const [waInput, setWaInput] = useState('');
  const [waPhone, setWaPhone] = useState('9848011223');
  const [waLoading, setWaLoading] = useState(false);
  const waEndRef = useRef(null);

  // IVR State
  const [callActive, setCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('IDLE');
  const [ivrStep, setIvrStep] = useState('language');
  const [ivrPrompt, setIvrPrompt] = useState('Dial 1800-123-AJAY to connect with the automated PM AJAY livelihood helpline.');
  const [dtmfBuffer, setDtmfBuffer] = useState('');
  const [smsReceived, setSmsReceived] = useState(null);
  const [callTimer, setCallTimer] = useState(0);
  const callIntervalRef = useRef(null);

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
    }
    return () => clearInterval(callIntervalRef.current);
  }, [callActive]);

  const speakIvr = (textToSpeak) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(textToSpeak);
    utt.lang = 'hi-IN';
    utt.rate = 0.95;
    window.speechSynthesis.speak(utt);
  };

  // WhatsApp Send
  const handleSendWa = async (msgText) => {
    const text = String(msgText || waInput).trim();
    if (!text) return;

    setWaInput('');
    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWaMessages((prev) => [...prev, userMsg]);
    setWaLoading(true);

    try {
      const res = await fetch('/api/channels/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'whatsapp',
          message: text,
          phone: waPhone,
          language: 'te'
        })
      });
      const data = await res.json();
      if (data.simulatedResponse || data.replyText) {
        setWaMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.simulatedResponse || data.replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setWaMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'సమాధానం నమోదైంది. మా కౌన్సెలర్ మిమ్మల్ని సంప్రదిస్తారు.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setWaLoading(false);
    }
  };

  const handleSendVoiceNoteWa = () => {
    handleSendWa('🎤 [Voice Note]: నాకు 3 సంవత్సరాలుగా టైలరింగ్ అనుభవం ఉంది. బ్లౌజులు మరియు డ్రెస్సులు కుట్టగలను.');
  };

  // IVR Actions
  const handleStartCall = async () => {
    setCallActive(true);
    setCallStatus('CONNECTED');
    setIvrStep('language');
    setDtmfBuffer('');
    setSmsReceived(null);

    const greeting = 'PM AJAY Rozgar Helpline me aapka swagat hai. Telugu bhasha kosam 1 nokkandi. Hindi ke liye 2 dabayein. For English press 3.';
    setIvrPrompt(greeting);
    speakIvr(greeting);
  };

  const handleEndCall = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setCallActive(false);
    setCallStatus('CALL ENDED');
    setIvrPrompt('Call disconnected. Press Start Call to dial again.');
  };

  const handleKeypadPress = async (digit) => {
    if (!callActive) return;

    setDtmfBuffer((prev) => prev + digit);

    try {
      const res = await fetch('/api/channels/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'ivr',
          digits: String(digit),
          ivrStep,
          phone: '9848011223'
        })
      });
      const data = await res.json();

      if (data.audioPrompt) {
        setIvrPrompt(data.audioPrompt);
        speakIvr(data.audioPrompt);
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
        text: 'నమస్కారం! PM AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. మీ నైపుణ్యాల ఆధారంగా ఉచిత శిక్షణ మరియు రుణ పథకాలను సిఫార్సు చేయడానికి మేము మీ వివరాలు నమోదు చేయవచ్చా? ప్రారంభించడానికి YES అని పంపండి.',
        time: '10:00 AM'
      },
      {
        sender: 'user',
        text: 'YES',
        time: '10:01 AM'
      },
      {
        sender: 'bot',
        text: 'ధన్యవాదాలు! మీ సమ్మతి నమోదైంది. మీ అనుభవం లేదా పని నైపుణ్యాల గురించి చెప్పండి.',
        time: '10:01 AM'
      },
      {
        sender: 'user',
        text: sc.firstMsg,
        time: '10:02 AM'
      }
    ]);
    handleSendWa(sc.firstMsg);
  };

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="channel-demo-container">
      {/* Header */}
      <div className="channel-demo-header">
        <h1 className="channel-demo-title">
          <Sparkles size={24} color="#ea580c" />
          Omni-Channel Voice & Messaging Telephony Mockup
        </h1>
        <p className="channel-demo-subtitle">
          Test interactive WhatsApp Bot and IVR Phone Telephony connected to live state engine
        </p>
      </div>

      {/* Preset Personas */}
      <div className="scenario-chips-row">
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Load Test Scenario:</span>
        {SCENARIOS.map((sc, i) => (
          <button key={i} className="scenario-chip" onClick={() => handleApplyScenario(sc)}>
            {sc.title}
          </button>
        ))}
      </div>

      {/* Dual Mockup Columns */}
      <div className="mockup-grid">
        {/* WhatsApp Smartphone Mockup */}
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

              {/* WhatsApp Message Body */}
              <div className="wa-messages-body">
                {waMessages.map((m, idx) => (
                  <div key={idx} className={`wa-bubble ${m.sender === 'user' ? 'outgoing' : 'incoming'}`}>
                    <div>{m.text}</div>
                    <div className="wa-time">
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
                  onClick={handleSendVoiceNoteWa}
                  style={{ background: 'none', border: 'none', color: '#128c7e', cursor: 'pointer' }}
                  title="Simulate WhatsApp Audio Voice Note"
                >
                  <Mic size={20} />
                </button>
                <input
                  type="text"
                  className="wa-input"
                  placeholder="Type message in Telugu, Hindi..."
                  value={waInput}
                  onChange={(e) => setWaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendWa()}
                />
                <button type="button" className="wa-send-btn" onClick={() => handleSendWa()}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            Simulates Twilio Webhook POST to /api/channels/whatsapp/webhook
          </div>
        </div>

        {/* IVR Feature Phone / Dialer Mockup */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '8px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <PhoneCall size={18} /> IVR Phone Telephony (Twilio Voice)
          </div>
          <div className="ivr-frame">
            {/* LCD Screen */}
            <div className="ivr-lcd">
              <div className="ivr-call-status">
                <span>{callStatus}</span>
                {callActive && <span>{formatTimer(callTimer)}</span>}
              </div>

              <div className="ivr-speech-text">
                {ivrPrompt}
              </div>

              <div className="ivr-digits-display">
                DTMF: {dtmfBuffer || '--'}
              </div>
            </div>

            {/* Numeric Keypad */}
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

            {/* Call Control Buttons */}
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
            Simulates Twilio Voice POST to /api/channels/ivr/voice and /ivr/gather
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelDemo;
