import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api.js';
import { useLang } from '../lang.js';
import { VoiceInput, Card, Badge } from '../components.jsx';
import { Sparkles, Plus, History, MessageSquare, Clock, ChevronRight, X } from 'lucide-react';
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
    samplePromptsLabel: 'Or choose a sample scenario to simulate conversation:',
    newChatBtn: '+ New Chat',
    historyTitle: 'Chat History',
    noHistory: 'No past conversations yet',
    activeChat: 'Active Chat',
    newChatTitle: 'New Conversation'
  },
  hi: {
    title: 'सहानुभूतिपूर्ण एआई वॉयस असिस्टेंट',
    subtitle: 'अपने पिछले काम, कौशल या आजीविका लक्ष्यों पर अपनी भाषा में चर्चा करें',
    bannerTitle: '2-मिनट वॉइस मूल्यांकन: कौशल एवं प्रोफ़ाइल पहचानी गई!',
    bannerDesc: 'आपकी क्षमताएं एआई द्वारा पहचानी गई हैं। अपनी व्यक्तिगत आजीविका के अवसरों को अनलॉक करने के लिए विवरण सत्यापित करें।',
    samplePromptsLabel: 'या बातचीत शुरू करने के लिए कोई उदाहरण चुनें:',
    newChatBtn: '+ नई बातचीत',
    historyTitle: 'बातचीत का इतिहास',
    noHistory: 'कोई पुरानी बातचीत नहीं मिली',
    activeChat: 'सक्रिय बातचीत',
    newChatTitle: 'नई बातचीत'
  },
  te: {
    title: 'సానుభూతిపూర్వక AI వాయిస్ అసిస్టెంట్',
    subtitle: 'మీ గత పని, నైపుణ్యాలు లేదా జీవనోపాధి లక్ష్యాల గురించి మీ స్వంత భాషలో మాట్లాడండి',
    bannerTitle: '2 నిమిషాల వాయిస్ అసెస్‌మెంట్: నైపుణ్యాలు & ప్రొఫైల్ గుర్తించబడ్డాయి!',
    bannerDesc: 'మీ నైపుణ్యాలను AI గుర్తించింది. మీ వ్యక్తిగతీకరించిన డాష్‌బోర్డ్ మరియు ఉపాధి మార్గాలను అన్‌లాక్ చేయడానికి వివరాలను ధృవీకరించండి.',
    samplePromptsLabel: 'లేదా సంభాషణ ప్రారంభించడానికి ఒక ఉదాహరణను ఎంచుకోండి:',
    newChatBtn: '+ కొత్త సంభాషణ',
    historyTitle: 'గత సంభాషణలు',
    noHistory: 'గత సంభాషణలేవీ లేవు',
    activeChat: 'ప్రస్తుత సంభాషణ',
    newChatTitle: 'కొత్త సంభాషణ'
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
    { label: 'इलेक्ट्रिकल एवं मोटर रिपेयर', text: 'मुझे घर की बिजली फिट फिटिंग और इलेक्ट्रिक मोटर रिपेयर का काम आता है।' }
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
  
  // Persistent Conversation State
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const [messages, setMessages] = useState(() => [
    {
      sender: 'ai',
      text: GREETINGS[lang] || GREETINGS.en
    }
  ]);
  
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [updatedProfile, setUpdatedProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync greeting ONLY when starting a brand-new conversation (no conversationId and 1 message)
  useEffect(() => {
    setMessages((prev) => {
      if (!conversationId && prev.length === 1 && prev[0]?.sender === 'ai') {
        return [{ sender: 'ai', text: GREETINGS[lang] || GREETINGS.en }];
      }
      return prev;
    });
  }, [lang, conversationId]);

  // Load user profile
  useEffect(() => {
    api.getProfile(forUserId).then((res) => {
      if (res?.profile) {
        if (res.profile.skills) setExtractedSkills(res.profile.skills);
        setUpdatedProfile(res.profile);
      }
    }).catch(() => {});
  }, [forUserId]);

  // Fetch conversation history list from backend
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.getConversations(forUserId);
      if (res?.conversations) {
        setConversations(res.conversations);
      }
    } catch (err) {
      console.error('Failed to load conversation history:', err);
    }
  }, [forUserId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle "+ New Chat" action
  const handleNewChat = () => {
    if (isProcessing) return;
    setConversationId(null);
    setMessages([{ sender: 'ai', text: GREETINGS[lang] || GREETINGS.en }]);
    setShowHistory(false);
    fetchConversations();
  };

  // Select and restore an existing conversation from history
  const handleSelectConversation = async (id) => {
    if (isProcessing || id === conversationId) return;
    setIsProcessing(true);
    try {
      const res = await api.getConversation(id, forUserId);
      if (res?.conversation) {
        setConversationId(res.conversation._id);
        const loaded = (res.conversation.messages || []).map((m) => ({
          sender: m.sender,
          text: m.text,
          profileInsight: m.profileInsight
        }));
        setMessages(loaded.length > 0 ? loaded : [{ sender: 'ai', text: GREETINGS[lang] || GREETINGS.en }]);
        setShowHistory(false);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Send message (typed or spoken) using current conversationId
  const handleSendMessage = async (text) => {
    if (!text || !text.trim()) return;
    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const res = await api.sendVoiceMessage(text, lang, 'web', conversationId, forUserId);
      
      if (res.conversationId && res.conversationId !== conversationId) {
        setConversationId(res.conversationId);
      }
      if (res.replyText) {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.replyText }]);
      }
      if (res.extractedSkills && res.extractedSkills.length > 0) {
        setExtractedSkills(res.extractedSkills);
      }
      if (res.updatedProfile) {
        setUpdatedProfile((prev) => ({ ...prev, ...res.updatedProfile }));
      }
      
      // Update history list in background
      fetchConversations();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: lang === 'te'
            ? 'నమస్కారం! మీ సమాచారాన్ని రికార్డ్ చేశాము. మన సంభాషణను కొనసాగిద్దాం.'
            : lang === 'hi'
              ? 'नमस्ते! आपकी जानकारी दर्ज कर ली गई है। आइए अपनी बातचीत जारी रखें।'
              : 'Namaste! We have recorded your information. Please continue your response.'
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPrompts = SAMPLE_PROMPTS[lang] || SAMPLE_PROMPTS.en;
  const content = ASSISTANT_CONTENT[lang] || ASSISTANT_CONTENT.en;

  const activeConvObj = conversations.find(c => c._id === conversationId);

  return (
    <div className="page-container">
      {/* PAGE HEADER & CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{content.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '2px 0 0 0' }}>{content.subtitle}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-secondary"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              padding: '8px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: showHistory ? 'var(--primary-50, #fff7ed)' : undefined,
              borderColor: showHistory ? 'var(--primary-600, #c2410c)' : undefined
            }}
          >
            <History size={16} /> {content.historyTitle} ({conversations.length})
          </button>

          <button
            type="button"
            onClick={handleNewChat}
            disabled={isProcessing}
            className="btn btn-primary"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              padding: '8px 16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Plus size={16} /> {content.newChatBtn}
          </button>
        </div>
      </div>

      {/* CHAT HISTORY PANEL (EXPANDABLE) */}
      {showHistory && (
        <Card style={{ marginBottom: '20px', background: 'var(--surface-subtle)', borderColor: 'var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={17} color="var(--primary-600)" /> {content.historyTitle}
            </div>
            <button
              onClick={() => setShowHistory(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          {conversations.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
              {content.noHistory}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
              {conversations.map((c) => {
                const isActive = c._id === conversationId;
                const formattedDate = new Date(c.updatedAt || c.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => handleSelectConversation(c._id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isActive ? 'var(--primary-600)' : '#ffffff',
                      color: isActive ? '#ffffff' : 'var(--text-main)',
                      border: isActive ? '1px solid var(--primary-600)' : '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                        {c.title || 'Conversation'}
                      </span>
                      <span style={{ fontSize: '10.5px', opacity: isActive ? 0.9 : 0.6 }}>
                        {formattedDate}
                      </span>
                    </div>
                    {c.preview && (
                      <div style={{ fontSize: '12px', opacity: isActive ? 0.9 : 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.preview}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}

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

      {/* CHAT MESSAGES WINDOW */}
      <Card style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
        {/* ACTIVE CONVERSATION BADGE HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MessageSquare size={14} color="var(--primary-600)" />
            {conversationId ? (
              <span>{content.activeChat}: <strong>{activeConvObj?.title || 'Active Session'}</strong></span>
            ) : (
              <span>{content.newChatTitle}</span>
            )}
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </div>
        </div>

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
