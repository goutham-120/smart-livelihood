import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { useLang } from '../lang.js';
import { VoiceInput, Card, Badge } from '../components.jsx';
import { Sparkles, ArrowRight, Languages, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Assistant = () => {
  const { lang } = useLang();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'నమస్కారం! PM-AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. మీ అనుభవం, మీరు గతంలో చేసిన పనులు లేదా నేర్చుకోవాలనుకుంటున్న నైపుణ్యాల గురించి మాట్లాడండి.'
    }
  ]);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [updatedProfile, setUpdatedProfile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    api.getProfile().then((res) => {
      if (res.profile) {
        if (res.profile.skills) setExtractedSkills(res.profile.skills);
        setUpdatedProfile(res.profile);
      }
    });
  }, []);

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

  const samplePrompts = [
    { label: 'Tailoring & Home Business', text: 'I studied until 10th class. I know basic tailoring and sewing machine operation. I want to work from home and earn 15000 rupees per month.' },
    { label: 'Agriculture & Vermicompost', text: 'I have experience in organic farming and vermicompost bed preparation in my village.' },
    { label: 'Electronics & Motor Repair', text: 'I know house wiring and basic electric motor rewinding.' }
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Empathetic AI Voice Assistant</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Discuss your past work, trade skills, or livelihood goals in your language</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-subtle)', padding: '4px 8px', borderRadius: 'var(--radius-md)' }}>
          <Languages size={16} color="var(--primary-600)" />
          <button onClick={() => setLang('te')} className={`btn ${lang === 'te' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 8px', fontSize: '12px' }}>తెలుగు</button>
          <button onClick={() => setLang('hi')} className={`btn ${lang === 'hi' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 8px', fontSize: '12px' }}>हिंदी</button>
          <button onClick={() => setLang('en')} className={`btn ${lang === 'en' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '4px 8px', fontSize: '12px' }}>English</button>
        </div>
      </div>

      {extractedSkills.length > 0 && (
        <Card style={{ marginBottom: '20px', background: 'var(--primary-50)', borderColor: '#c7d2fe' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--primary-600)" /> Identified Profile Competencies ({extractedSkills.length})
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
              View Matched Opportunities <ArrowRight size={14} />
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
            {samplePrompts.map((p, idx) => (
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

        <VoiceInput onSend={handleSendMessage} isProcessing={isProcessing} />
      </Card>
    </div>
  );
};

export default Assistant;
