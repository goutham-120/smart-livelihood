import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Briefcase, Building, Layers, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

export const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [filter, setFilter] = useState('all'); // all, wage, self
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOpportunities().then((res) => {
      setOpportunities(res.opportunities || []);
      setLoading(false);
    });
  }, []);

  const filtered = opportunities.filter((op) => {
    if (filter === 'wage') return op.track === 'wage';
    if (filter === 'self') return op.track === 'self';
    return true;
  });

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Tailored Livelihood Pathways</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>NSQF-aligned opportunities matched with your local district demand</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setFilter('all')} className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>All Tracks</button>
          <button onClick={() => setFilter('self')} className={`btn ${filter === 'self' ? 'btn-primary' : 'btn-secondary'}`}>Micro-Enterprise (Self)</button>
          <button onClick={() => setFilter('wage')} className={`btn ${filter === 'wage' ? 'btn-primary' : 'btn-secondary'}`}>Wage Employment</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Matching opportunities...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map((op) => (
            <div key={op.id || op.occupationKey} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className={`badge ${op.track === 'self' ? 'badge-amber' : 'badge-green'}`}>
                    {op.track === 'self' ? 'Self-Employment' : 'Wage Placement'}
                  </span>
                  <span className="badge badge-blue">NSQF Level {op.nsqfLevel}</span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0 4px 0' }}>{op.title}</h3>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{op.sector} • NCO {op.ncoCode || '7531'}</div>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Match Alignment:</span>
                    <strong style={{ color: '#4f46e5' }}>{op.matchScore}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748b' }}>Est. Monthly Income:</span>
                    <strong>₹{op.incomeRange?.min?.toLocaleString()} - ₹{op.incomeRange?.max?.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>Local District Demand:</span>
                    <span className="badge badge-green" style={{ fontSize: '11px', padding: '2px 6px' }}>Level {op.demand?.level} / 5</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                <Link to={`/skill-gaps?occ=${op.occupationKey}`} className="btn btn-secondary" style={{ fontSize: '12px' }}>
                  Skill Gaps
                </Link>
                <Link to={`/roadmap?occ=${op.occupationKey}`} className="btn btn-primary" style={{ fontSize: '12px' }}>
                  View Roadmap <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
