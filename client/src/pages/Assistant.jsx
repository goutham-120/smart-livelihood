import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../lang.js';
import { VoiceInput, Card, Badge, Spinner } from '../components.jsx';
import {
  Sparkles,
  ArrowRight,
  Languages,
  Volume2,
  VolumeX,
  CheckCircle,
  Plus,
  MessageSquare,
  History,
  UserCheck,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { playIndicSpeech, stopIndicSpeech, getLanguageByCode } from '../i18n/languages.js';

const GREETINGS = {
  te: 'నమస్కారం! PM-AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. మీ అనుభవం, మీరు గతంలో చేసిన పనులు లేదా నేర్చుకోవాలనుకుంటున్న నైపుణ్యాల గురించి మాట్లాడండి.',
  hi: 'नमस्ते! PM-AJAY आजीविका सहायक में आपका स्वागत है। अपने अनुभव, पुराने काम या जो हुनर आप सीखना चाहते हैं, उसके बारे में बताएं।',
  en: 'Namaste! Welcome to the PM-AJAY Livelihood Assistant. Please speak or type about your past work, skills, or what you would like to learn.'
};

const SAMPLE_PROMPTS = {
  te: [
    { label: 'టైలరింగ్ & స్వయం ఉపాధి', text: 'నేను 10వ తరగతి వరకు చదువుకున్నాను. నాకు కుట్టుపని మరియు టైలరింగ్ అనుభవం ఉంది. ఇంట్లోనే చిన్న టైలరింగ్ షాప్ పెట్టి నెలకు 15000 సంపాదించాలనుకుంటున్నాను.' },
    { label: 'వ్యవసాయం & వర్మీకంపోస్ట్', text: 'మా ఊరిలో సేంద్రీయ వ్యవసాయం మరియు వర్మీకంపోస్ట్ ఎరువుల తయారీ అనుభవం ఉంది.' },
    { label: 'ఎలక్ట్రికల్ & మోటార్ రిపేర్', text: 'నాకు ఇంటి వైరింగ్ మరియు మోటార్ రీవైండింగ్ పనులు తెలుసు.' }
  ],
  hi: [
    { label: 'सिलाई एवं स्वरोज़गार', text: 'मैंने 10वीं तक पढ़ाई की है। मुझे सिलाई मशीन और कपड़े सिलने का अच्छा अनुभव है। मैं घर से काम करके हर महीने 15000 कमाना चाहता हूँ।' },
    { label: 'जैविक खेती एवं वर्मीकम्पोस्ट', text: 'मुझे अपने गांव में जैविक खाद और वर्मीकम्पोस्ट बनाने का अनुभव है।' },
    { label: 'इलेक्ट्रिकल एवं मोटर रिपेयर', text: 'मुझे घर की बिजली फिटिंग और इलेक्ट्रिक मोटर रिपेयर का काम आता है।' }
  ],
  en: [
    { label: 'Tailoring & Home Business', text: 'I studied until 10th class. I know basic tailoring and sewing machine operation. I want to work from home and earn 15000 rupees per month.' },
    { label: 'Agriculture & Vermicompost', text: 'I have experience in organic farming and vermicompost bed preparation in my village.' },
    { label: 'Electronics & Motor Repair', text: 'I know house wiring and basic electric motor rewinding.' }
  ]
};

export const Assistant = ({ forUserId = null }) => {
  const { t } = useTranslation();
  const { lang: globalLang } = useLang();
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('pmajay_lang') || globalLang || 'te';
  });

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: GREETINGS[localStorage.getItem('pmajay_lang') || 'te'] || GREETINGS.te
    }
  ]);

  const [extractedSkills, setExtractedSkills] = useState([]);
  const [updatedProfile, setUpdatedProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDetectedLanguage, setActiveDetectedLanguage] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [confirmedInsights, setConfirmedInsights] = useState(new Set());
  const messagesEndRef = useRef(null);

  // Auto-scroll messages thread to bottom on update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  useEffect(() => {
    return () => {
      stopIndicSpeech();
    };
  }, []);

  // Initial load
  useEffect(() => {
    api.getProfile(forUserId).then((res) => {
      if (res?.profile) {
        if (res.profile.skills) setExtractedSkills(res.profile.skills);
        setUpdatedProfile(res.profile);
      }
    }).catch(() => {});

    // Initial conversation list load
    (async () => {
      try {
        setIsLoadingHistory(true);
        const res = await api.getConversations(forUserId);
        if (res?.conversations) {
          setConversations(res.conversations);
          if (res.conversations.length > 0) {
            const firstConvId = res.conversations[0]._id;
            setActiveConvId(firstConvId);
            const convRes = await api.getConversation(firstConvId, forUserId);
            if (convRes?.conversation?.messages?.length > 0) {
              setMessages(convRes.conversation.messages);
            }
          }
        }
      } catch (err) {
        console.log('Conversations unavailable offline');
      } finally {
        setIsLoadingHistory(false);
      }
    })();
  }, [forUserId]);

  useEffect(() => {
    if (globalLang && globalLang !== lang) {
      handleLanguageChange(globalLang);
    }
  }, [globalLang]);

  useEffect(() => {
    if (showHistory) {
      refreshConversationList();
    }
  }, [showHistory, forUserId]);

  const refreshConversationList = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await api.getConversations(forUserId);
      if (res?.conversations) {
        setConversations(res.conversations);
      }
    } catch (err) {
      console.log('Failed to refresh conversation list');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadSingleConversation = async (convId) => {
    if (!convId || isProcessing) return;
    try {
      setIsProcessing(true);
      const res = await api.getConversation(convId, forUserId);
      if (res?.conversation) {
        setActiveConvId(res.conversation._id);
        if (res.conversation.messages && res.conversation.messages.length > 0) {
          setMessages(res.conversation.messages);
        } else {
          setMessages([{ sender: 'ai', text: GREETINGS[lang] || GREETINGS.en }]);
        }
      }
    } catch (err) {
      console.log('Failed to load conversation details');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewChat = async () => {
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      await refreshConversationList();
      setActiveConvId(null);
      setMessages([{ sender: 'ai', text: GREETINGS[lang] || GREETINGS.en }]);
    } catch (err) {
      setActiveConvId(null);
      setMessages([{ sender: 'ai', text: GREETINGS[lang] || GREETINGS.en }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('pmajay_lang', newLang);
    setMessages((prev) => {
      if (prev.length === 0) {
        return [{ sender: 'ai', text: GREETINGS[newLang] || GREETINGS.en }];
      }
      const isGreeting = (txt) => (
        txt === GREETINGS.te || txt === GREETINGS.hi || txt === GREETINGS.en
      );
      if (prev[0]?.sender === 'ai' && isGreeting(prev[0].text)) {
        return [{ sender: 'ai', text: GREETINGS[newLang] || GREETINGS.en }, ...prev.slice(1)];
      }
      return prev;
    });
  };

  const handleSendMessage = async (rawText, detectedLanguageCode = null, detectedLangObj = null) => {
    if (!rawText || !rawText.trim() || isProcessing) return;
    stopIndicSpeech();
    const text = rawText.trim();

    const userMsg = { sender: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    if (detectedLangObj) {
      setActiveDetectedLanguage(detectedLangObj);
    }

    const targetLang = detectedLanguageCode || lang || 'auto';

    try {
      const res = await api.sendVoiceMessage(text, targetLang, 'web', activeConvId, forUserId);

      if (res.conversationId) {
        setActiveConvId(res.conversationId);
      }

      const replyText = res.replyText || res.response || 'ధన్యవాదాలు! మీ వివరాలు నమోదయ్యాయి.';

      if (res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else if (res.replyText) {
        setMessages((prev) => [...prev, {
          sender: 'ai',
          text: replyText,
          timestamp: new Date(),
          profileInsight: res.profileInsight
        }]);
      }

      if (res.language) {
        const langInfo = getLanguageByCode(res.language);
        setActiveDetectedLanguage({
          code: res.language,
          name: res.languageName || langInfo.name,
          nativeName: res.nativeName || langInfo.nativeName,
          confidence: 96
        });
      }

      if (res.extractedSkills && res.extractedSkills.length > 0) {
        setExtractedSkills(res.extractedSkills);
      }
      if (res.updatedProfile) {
        setUpdatedProfile((prev) => ({ ...prev, ...res.updatedProfile }));
      }

      // Automatically speak the response in the user's detected language
      setIsSpeaking(true);
      playIndicSpeech({
        text: replyText,
        language: res.language || targetLang,
        onEnd: () => setIsSpeaking(false)
      });

      await refreshConversationList();
    } catch (err) {
      setMessages((prev) => [...prev, {
        sender: 'ai',
        text: 'Something went wrong while processing your message. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmInsight = async (insight, index) => {
    try {
      const payload = {
        skill: insight.detectedSkill,
        experienceYears: insight.detectedExperience ? parseInt(insight.detectedExperience) : null
      };
      await api.confirmProfileInsight(payload);
      setConfirmedInsights((prev) => new Set(prev).add(index));

      const profRes = await api.getProfile(forUserId);
      if (profRes?.profile) {
        if (profRes.profile.skills) setExtractedSkills(profRes.profile.skills);
        setUpdatedProfile(profRes.profile);
      }
    } catch (err) {
      console.log('Failed to confirm profile insight');
    }
  };

  const toggleSpeechAudio = () => {
    if (isSpeaking) {
      stopIndicSpeech();
      setIsSpeaking(false);
    } else {
      const lastAiMessage = [...messages].reverse().find((m) => m.sender === 'ai');
      if (lastAiMessage) {
        setIsSpeaking(true);
        playIndicSpeech({
          text: lastAiMessage.text,
          language: activeDetectedLanguage?.code || lang || 'te',
          onEnd: () => setIsSpeaking(false)
        });
      }
    }
  };

  const currentPrompts = SAMPLE_PROMPTS[lang] || SAMPLE_PROMPTS.en;

  // Group conversations by date
  const groupConversations = () => {
    const today = [];
    const yesterday = [];
    const older = [];
    const now = new Date();

    conversations.forEach((c) => {
      const date = new Date(c.updatedAt || c.createdAt);
      if (isNaN(date.getTime())) {
        older.push(c);
        return;
      }
      const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      const isSameDay = (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );

      if (isSameDay || diffHours < 24) {
        today.push(c);
      } else if (diffHours < 48) {
        yesterday.push(c);
      } else {
        older.push(c);
      }
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupConversations();

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            {t('pages.assistant', 'Empathetic AI Voice Assistant')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px', margin: 0 }}>
            {t('capabilities.subtitle', 'Discuss your past work, trade skills, or livelihood goals in your language')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {activeDetectedLanguage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-50, #eff6ff)', border: '1px solid var(--primary-200, #bfdbfe)', padding: '5px 12px', borderRadius: '16px', fontSize: '12px', color: 'var(--primary-700, #1d4ed8)', fontWeight: 700 }}>
              <Languages size={15} /> Detected: {activeDetectedLanguage.name} ({activeDetectedLanguage.nativeName})
            </div>
          )}

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-secondary"
            style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <History size={16} color="var(--primary-600)" />
            <span>{t('assistant.chatHistory', 'Chat History')}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface-subtle)', padding: '4px 8px', borderRadius: 'var(--radius-md)' }}>
            <Languages size={16} color="var(--primary-600)" />
            <button onClick={() => handleLanguageChange('te')} className={`btn ${lang === 'te' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 8px', fontSize: '12px' }}>తెలుగు</button>
            <button onClick={() => handleLanguageChange('hi')} className={`btn ${lang === 'hi' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 8px', fontSize: '12px' }}>हिंदी</button>
            <button onClick={() => handleLanguageChange('en')} className={`btn ${lang === 'en' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 8px', fontSize: '12px' }}>English</button>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={toggleSpeechAudio}
            style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title={isSpeaking ? 'Mute Speech Audio' : 'Replay Last Audio Response'}
          >
            {isSpeaking ? <VolumeX size={16} color="#ef4444" /> : <Volume2 size={16} color="var(--primary-600)" />}
            {isSpeaking ? 'Mute Voice' : 'Audio On'}
          </button>
        </div>
      </div>

      {/* Identified Profile Banner */}
      {extractedSkills.length > 0 && (
        <Card style={{ background: 'var(--primary-50)', borderColor: '#c7d2fe' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--primary-600)" /> {t('dashboard.identifiedCompetencies', 'Identified Profile Competencies')} ({extractedSkills.length})
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                {extractedSkills.map((s, idx) => (
                  <Badge key={idx} type="blue">{s.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
              {updatedProfile?.education && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Education: <strong>{updatedProfile.education}</strong> | Preference: <strong>{updatedProfile.employmentPreference}</strong>
                </div>
              )}
            </div>
            <Link to="/opportunities" className="btn btn-primary" style={{ fontSize: '13px' }}>
              {t('dashboard.exploreOpportunities', 'View Matched Opportunities')} <ArrowRight size={14} />
            </Link>
          </div>
        </Card>
      )}

      {/* Main Container Grid with Chat History Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: showHistory ? '260px 1fr' : '1fr', gap: '16px', alignItems: 'start' }}>
        {/* Chat History Panel */}
        {showHistory && (
          <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '560px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <History size={16} color="var(--primary-600)" />
                <span>{t('assistant.chatHistory', 'CHAT HISTORY')}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="btn btn-ghost"
                style={{ padding: '4px', display: 'flex', color: 'var(--text-muted)' }}
                title="Close History Panel"
              >
                <X size={18} />
              </button>
            </div>

            <button
              onClick={handleNewChat}
              className="btn btn-primary"
              disabled={isProcessing}
              style={{ width: '100%', justifyContent: 'center', fontSize: '13px', gap: '6px' }}
            >
              <Plus size={16} /> {t('assistant.newChat', '+ New Chat')}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {isLoadingHistory ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Spinner size={16} /> <span>{t('common.loading', 'Loading...')}</span>
                </div>
              ) : conversations.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  {t('assistant.noHistory', 'No previous conversations')}
                </div>
              ) : (
                <>
                  {today.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        {t('assistant.today', 'Today')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {today.map((c) => {
                          const isSelected = activeConvId && String(activeConvId) === String(c._id);
                          return (
                            <div
                              key={c._id}
                              onClick={() => loadSingleConversation(c._id)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: 'var(--radius-md)',
                                background: isSelected ? 'var(--primary-50)' : 'transparent',
                                border: isSelected ? '1px solid #c7d2fe' : '1px solid transparent',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--primary-900)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.title || 'Conversation'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {yesterday.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        {t('assistant.yesterday', 'Yesterday')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {yesterday.map((c) => {
                          const isSelected = activeConvId && String(activeConvId) === String(c._id);
                          return (
                            <div
                              key={c._id}
                              onClick={() => loadSingleConversation(c._id)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: 'var(--radius-md)',
                                background: isSelected ? 'var(--primary-50)' : 'transparent',
                                border: isSelected ? '1px solid #c7d2fe' : '1px solid transparent',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--primary-900)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.title || 'Conversation'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {older.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        {t('assistant.older', 'Older')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {older.map((c) => {
                          const isSelected = activeConvId && String(activeConvId) === String(c._id);
                          return (
                            <div
                              key={c._id}
                              onClick={() => loadSingleConversation(c._id)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: 'var(--radius-md)',
                                background: isSelected ? 'var(--primary-50)' : 'transparent',
                                border: isSelected ? '1px solid #c7d2fe' : '1px solid transparent',
                                cursor: 'pointer'
                              }}
                            >
                              <div style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--primary-900)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.title || 'Conversation'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fallback rendering if date grouping returns empty arrays despite conversations existing */}
                  {today.length === 0 && yesterday.length === 0 && older.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {conversations.map((c) => {
                        const isSelected = activeConvId && String(activeConvId) === String(c._id);
                        return (
                          <div
                            key={c._id}
                            onClick={() => loadSingleConversation(c._id)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-md)',
                              background: isSelected ? 'var(--primary-50)' : 'transparent',
                              border: isSelected ? '1px solid #c7d2fe' : '1px solid transparent',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--primary-900)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.title || 'Conversation'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        )}

        {/* Message Active Thread Area */}
        <Card style={{ minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', marginBottom: '20px', maxHeight: '420px', paddingRight: '4px' }}>
            {messages.map((m, idx) => (
              <React.Fragment key={idx}>
                <div
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

                {/* Profile Evidence Insight Confirmation Card */}
                {m.profileInsight && (
                  <div style={{ alignSelf: 'flex-start', maxWidth: '82%', background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 16px', borderRadius: '12px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <UserCheck size={16} /> {t('assistant.profileInsight', 'PROFILE INSIGHT')}
                    </div>
                    <div style={{ color: '#78350f', marginBottom: '4px' }}>
                      {t('assistant.youMentioned', 'You mentioned')}: <em>"{m.profileInsight.rawText}"</em>
                    </div>
                    <div style={{ color: '#78350f', fontWeight: 600, marginBottom: '8px' }}>
                      {t('assistant.possibleUpdate', 'Possible profile update')}:{' '}
                      {m.profileInsight.detectedSkill && <span>Skill: <strong>{m.profileInsight.detectedSkill}</strong> </span>}
                      {m.profileInsight.detectedExperience && <span>Experience: <strong>{m.profileInsight.detectedExperience}</strong></span>}
                    </div>

                    {confirmedInsights.has(idx) || m.profileInsight.confirmed ? (
                      <div style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <CheckCircle size={14} /> {t('assistant.confirmed', 'Confirmed & Added to Profile')}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConfirmInsight(m.profileInsight, idx)}
                        className="btn btn-sm btn-primary"
                        style={{ fontSize: '12px' }}
                      >
                        {t('assistant.confirmUpdate', 'Confirm & Save to Profile')}
                      </button>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* Thinking / Processing Spinner Indicator */}
            {isProcessing && (
              <div style={{ alignSelf: 'flex-start', background: 'var(--surface-subtle)', padding: '12px 18px', borderRadius: '16px 16px 16px 2px', fontSize: '14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spinner size={16} /> <span>{t('assistant.thinking', 'Thinking...')}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
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

          <VoiceInput
            onSend={(text, langCode, detectedObj) => handleSendMessage(text, langCode, detectedObj)}
            isProcessing={isProcessing}
            lang={lang}
            voiceState={isSpeaking ? 'SPEAKING' : 'IDLE'}
          />
        </Card>
      </div>
    </div>
  );
};

export default Assistant;
