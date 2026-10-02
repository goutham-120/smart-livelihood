import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { VoiceInput } from '../components';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Assistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'నమస్కారం! PM-AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. మీ అనుభవం, మీరు గతంలో చేసిన పనులు లేదా నేర్చుకోవాలనుకుంటున్న నైపుణ్యాల గురించి మాట్లాడండి.'
    }
  ]);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    api.getProfile().then((res) => {
      if (res.profile?.skills) {
        setExtractedSkills(res.profile.skills);
      }
    });
  }, []);

  const handleSendMessage = async (text) => {
    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const res = await api.sendVoiceMessage(text, 'te', 'web');
      if (res.replyText) {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.replyText }]);
      }
      if (res.extractedSkills && res.extractedSkills.length > 0) {
        setExtractedSkills((prev) => Array.from(new Set([...prev, ...res.extractedSkills])));
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'నమస్కారం! మీ మాట అందింది. మా కౌన్సెలర్ మిమ్మల్ని సంప్రదిస్తారు.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>Empathetic Voice Assistant</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Discover your NSQF-aligned livelihood path through natural conversation</p>
      </div>

      {extractedSkills.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', background: '#eef2ff', borderColor: '#c7d2fe' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Identified Competencies ({extractedSkills.length})
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                {extractedSkills.map((s, idx) => (
                  <span key={idx} className="badge badge-blue">{s.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
            <Link to="/opportunities" className="btn btn-primary" style={{ fontSize: '13px' }}>
              View Matched Opportunities <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      <div className="card" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', marginBottom: '20px', maxHeight: '400px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: m.sender === 'user' ? '#4f46e5' : '#f1f5f9',
                color: m.sender === 'user' ? '#fff' : '#0f172a',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: '1.4'
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <VoiceInput onSend={handleSendMessage} isProcessing={isProcessing} />
      </div>
    </div>
  );
};
