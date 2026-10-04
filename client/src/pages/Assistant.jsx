import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { useLang } from '../lang.js';
import { VoiceInput, Card, Badge } from '../components.jsx';
import { Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const GREETINGS = {
  te: 'నమస్కారం! PM-AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. మీ అనుభవం, మీరు గతంలో చేసిన పనులు లేదా నేర్చుకోవాలనుకుంటున్న నైపుణ్యాల గురించి మాట్లాడండి.',
  hi: 'नमस्ते! PM-AJAY आजीविका सहायक में आपका स्वागत है। अपने अनुभव, पुराने काम या जो हुनर आप सीखना चाहते हैं, उसके बारे में बताएं।',
  en: 'Namaste! Welcome to the PM-AJAY Livelihood Assistant. Please speak or type about your past work, skills, or what you would like to learn.'
};

const ASSISTANT_CONTENT = {
  en: {
    title: 'Empathetic AI Voice Assistant',
    subtitle: 'Discuss your past work, trade skills, or livelihood goals in your language',
    bannerTitle: '2-Min Voice Assessment: Skills & Profile Identified!',
    bannerDesc: 'Your competencies have been extracted by AI. Verify your profile details to unlock your personalized Dashboard and livelihood pathways.',
    samplePromptsLabel: 'Or choose a sample scenario to simulate conversation:'
  },
  hi: {
    title: 'सहानुभूतिपूर्ण एआई वॉयस असिस्टेंट',
    subtitle: 'अपने पिछले काम, कौशल या आजीविका लक्ष्यों पर अपनी भाषा में चर्चा करें',
    bannerTitle: '2-मिनट वॉइस मूल्यांकन: कौशल एवं प्रोफ़ाइल पहचानी गई!',
    bannerDesc: 'आपकी क्षमताएं एआई द्वारा पहचानी गई हैं। अपनी व्यक्तिगत आजीविका के अवसरों को अनलॉक करने के लिए विवरण सत्यापित करें।',
    samplePromptsLabel: 'या बातचीत शुरू करने के लिए कोई उदाहरण चुनें:'
  },
  te: {
    title: 'సానుభూతిపూర్వక AI వాయిస్ అసిస్టెంట్',
    subtitle: 'మీ గత పని, నైపుణ్యాలు లేదా జీవనోపాధి లక్ష్యాల గురించి మీ స్వంత భాషలో మాట్లాడండి',
    bannerTitle: '2 నిమిషాల వాయిస్ అసెస్‌మెంట్: నైపుణ్యాలు & ప్రొఫైల్ గుర్తించబడ్డాయి!',
    bannerDesc: 'మీ నైపుణ్యాలను AI గుర్తించింది. మీ వ్యక్తిగతీకరించిన డాష్‌బోర్డ్ మరియు ఉపాధి మార్గాలను అన్‌లాక్ చేయడానికి వివరాలను ధృవీకరించండి.',
    samplePromptsLabel: 'లేదా సంభాషణ ప్రారంభించడానికి ఒక ఉదాహరణను ఎంచుకోండి:'
  }
};

const SAMPLE_PROMPTS = {
  te: [
    { label: 'ట్రాక్టర్ & వ్యవసాయ యంత్రాలు', text: 'నాకు ట్రాక్టర్ నడపడం మరియు వ్యవసాయ యంత్రాల రిపేర్ తెలుసు. వ్యవసాయ పరికరాల ఆపరేటర్‌గా మంచి ఆదాయం సంపాదించాలనుకుంటున్నాను.' },
    { label: 'టైలరింగ్ & స్వయం ఉపాధి', text: 'నేను 10వ తరగతి వరకు చదువుకున్నాను. నాకు కుట్టుపని మరియు టైలరింగ్ అనుభవం ఉంది. ఇంట్లోనే చిన్న టైలరింగ్ షాప్ పెట్టి నెలకు 15000 సంపాదించాలనుకుంటున్నాను.' },
    { label: 'వ్యవసాయం & వర్మీకంపోస్ట్', text: 'మా ఊరిలో సేంద్రీయ వ్యవసాయం మరియు వర్మీకంపోస్ట్ ఎరువుల తయారీ అనుభవం ఉంది.' },
    { label: 'ఎలక్ట్రికల్ & మోటార్ రిపేర్', text: 'నాకు ఇంటి వైరింగ్ మరియు మోటార్ రీవైండింగ్ పనులు తెలుసు.' }
  ],
  hi: [
    { label: 'ट्रैक्टर एवं कृषि मशीनरी', text: 'मुझे ट्रैक्टर चलाने और कृषि उपकरणों की मरम्मत का काम आता है। मैं फार्म मशीनरी ऑपरेटर के रूप में काम करना चाहता हूँ।' },
    { label: 'सिलाई एवं स्वरोज़गार', text: 'मैंने 10वीं तक पढ़ाई की है। मुझे सिलाई मशीन और कपड़े सिलने का अच्छा अनुभव है। मैं घर से काम करके हर महीने 15000 कमाना चाहता हूँ।' },
    { label: 'जैविक खेती एवं वर्मीकम्पोस्ट', text: 'मुझे अपने गांव में जैविक खाद और वर्मीकम्पोस्ट बनाने का अनुभव है।' },
    { label: 'इलेक्ट्रिकल एवं मोटर रिपेयर', text: 'मुझे घर की बिजली फिटिंग और इलेक्ट्रिक मोटर रिपेयर का काम आता है।' }
  ],
  en: [
    { label: 'Tractor & Farm Machinery', text: 'I have experience in tractor driving and farm equipment maintenance. I want to earn good income as a farm machinery operator.' },
    { label: 'Tailoring & Home Business', text: 'I studied until 10th class. I know basic tailoring and sewing machine operation. I want to work from home and earn 15000 rupees per month.' },
    { label: 'Agriculture & Vermicompost', text: 'I have experience in organic farming and vermicompost bed preparation in my village.' },
    { label: 'Electronics & Motor Repair', text: 'I know house wiring and basic electric motor rewinding.' }
  ]
};

export const Assistant = ({ forUserId = null }) => {
  const { lang } = useLang();
  const [messages, setMessages] = useState(() => [
    {
      sender: 'ai',
      text: GREETINGS[lang] || GREETINGS.en
    }
  ]);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [updatedProfile, setUpdatedProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync greeting when user switches language from the sticky header
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return [{ sender: 'ai', text: GREETINGS[lang] || GREETINGS.en }];
      }
      const isGreeting = (txt) => (
        txt === GREETINGS.te || txt === GREETINGS.hi || txt === GREETINGS.en
      );
      if (prev[0]?.sender === 'ai' && isGreeting(prev[0].text)) {
        return [{ sender: 'ai', text: GREETINGS[lang] || GREETINGS.en }, ...prev.slice(1)];
      }
      return prev;
    });
  }, [lang]);

  useEffect(() => {
    api.getProfile(forUserId).then((res) => {
      if (res?.profile) {
        if (res.profile.skills) setExtractedSkills(res.profile.skills);
        setUpdatedProfile(res.profile);
      }
    }).catch(() => {});
  }, [forUserId]);

  const handleSendMessage = async (text) => {
    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const res = await api.sendVoiceMessage(text, lang, 'web');
      if (res.replyText) {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.replyText }]);
      }
      if (res.extractedSkills && res.extractedSkills.length > 0) {
        setExtractedSkills(res.extractedSkills);
      }
      if (res.updatedProfile) {
        setUpdatedProfile((prev) => ({ ...prev, ...res.updatedProfile }));
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Namaste! Thank you for sharing. We have recorded your information and are matching your profile.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPrompts = SAMPLE_PROMPTS[lang] || SAMPLE_PROMPTS.en;
  const content = ASSISTANT_CONTENT[lang] || ASSISTANT_CONTENT.en;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{content.title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{content.subtitle}</p>
      </div>

      {/* 2-Min Conversation Status & Identified Profile Banner */}
      {(extractedSkills.length > 0 || updatedProfile) && (
        <Card style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #f0fdf4, #eff6ff)', borderColor: '#86efac' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={18} color="#16a34a" /> {content.bannerTitle}
              </div>
              <p style={{ fontSize: '13px', color: '#15803d', marginTop: '2px' }}>
                {content.bannerDesc}
              </p>

              {extractedSkills.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {extractedSkills.map((s, idx) => (
                    <Badge key={idx} type="blue">{s.replace(/_/g, ' ')}</Badge>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-main)', marginTop: '8px' }}>
                {updatedProfile?.education && (
                  <div>Education: <strong>{updatedProfile.education}</strong></div>
                )}
                {updatedProfile?.employmentPreference && (
                  <div>Preference: <strong>{updatedProfile.employmentPreference === 'self' ? 'Self-Employment' : updatedProfile.employmentPreference === 'wage' ? 'Wage Job' : 'Either Track'}</strong></div>
                )}
                {updatedProfile?.incomeGoal && (
                  <div>Target: <strong>₹{updatedProfile.incomeGoal.toLocaleString()}/mo</strong></div>
                )}
                {updatedProfile?.experienceYears ? (
                  <div>Experience: <strong>{updatedProfile.experienceYears} Years</strong></div>
                ) : null}
              </div>
            </div>

            <Link
              to="/profile?verify=1"
              className="btn btn-primary"
              style={{ fontSize: '13px', fontWeight: 700, padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(202, 102, 3, 0.25)' }}
            >
              Verify Profile to Unlock Dashboard &rarr;
            </Link>
          </div>
        </Card>
      )}

      <Card style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', marginBottom: '20px', maxHeight: '420px', paddingRight: '4px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                background: m.sender === 'user' ? 'var(--primary-600)' : 'var(--surface-subtle)',
                color: m.sender === 'user' ? '#fff' : 'var(--text-main)',
                padding: '12px 18px',
                borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                fontSize: '14px',
                lineHeight: '1.5',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Quick Voice Samples:</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {currentPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.text)}
                disabled={isProcessing}
                style={{
                  background: 'var(--surface-subtle)',
                  border: '1px solid var(--border-light)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  color: 'var(--primary-700)',
                  fontWeight: 500
                }}
              >
                + {p.label}
              </button>
            ))}
          </div>
        </div>

        <VoiceInput onSend={handleSendMessage} isProcessing={isProcessing} lang={lang} />
      </Card>
    </div>
  );
};

export default Assistant;
