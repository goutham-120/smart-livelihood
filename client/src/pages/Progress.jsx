import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Award, CheckCircle2, Clock, Circle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Progress = () => {
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProgress().then((res) => {
      setJourney(res.journey);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>Loading progress milestones...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={24} color="#4f46e5" /> My Livelihood Journey Progress
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Live milestone tracking under PM-AJAY GIA Welfare & Skilling Initiative</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>CURRENT STAGE</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>
              {journey?.currentStage?.replace(/_/g, ' ') || 'Skill Discovery'}
            </div>
          </div>
          <Link to="/opportunities" className="btn btn-primary" style={{ fontSize: '13px' }}>
            Browse New Pathways &rarr;
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Welfare & Certification Milestones</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {journey?.milestones?.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {m.status === 'completed' ? (
                <CheckCircle2 size={24} color="#16a34a" />
              ) : m.status === 'in_progress' ? (
                <Clock size={24} color="#4f46e5" />
              ) : (
                <Circle size={24} color="#cbd5e1" />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{m.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>Status: {m.status.replace(/_/g, ' ')}</div>
              </div>
              <span className={`badge ${m.status === 'completed' ? 'badge-green' : m.status === 'in_progress' ? 'badge-blue' : 'badge-amber'}`}>
                {m.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
