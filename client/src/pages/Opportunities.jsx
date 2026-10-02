import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { ArrowRight, ChevronDown, ChevronUp, MapPin, Award, Building, Sparkles } from 'lucide-react';

export const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedBreakdown, setExpandedBreakdown] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getOpportunities();
        const payload = res?.data || res;
        setOpportunities(payload?.opportunities || (Array.isArray(payload) ? payload : []));
      } catch (err) {
        console.error('Failed to load opportunities:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleBreakdown = (key) => {
    setExpandedBreakdown((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            NSQF aligned opportunities matched with verified district market demand
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setFilter('all')} className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>All Tracks</button>
          <button onClick={() => setFilter('self')} className={`btn ${filter === 'self' ? 'btn-primary' : 'btn-secondary'}`}>Micro Enterprise (Self)</button>
          <button onClick={() => setFilter('wage')} className={`btn ${filter === 'wage' ? 'btn-primary' : 'btn-secondary'}`}>Wage Employment</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Calculating personalized opportunity matches...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface-800)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No opportunities found for this filter</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Try switching to "All Tracks" or refresh the opportunities list.</p>
          <button onClick={() => setFilter('all')} className="btn btn-primary">Show All Opportunities</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filtered.map((op) => {
            const occKey = op.occupationKey || op.id;
            const isExpanded = !!expandedBreakdown[occKey];

            return (
              <div key={occKey} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className={`badge ${op.track === 'self' ? 'badge-amber' : 'badge-green'}`}>
                      {op.track === 'self' ? 'Self Employment Track' : 'Wage Placement Track'}
                    </span>
                    <span className="badge badge-blue">NSQF Level {op.nsqfLevel}</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0 4px 0' }}>{op.title}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Sector: {op.sector} • NCO Code: {op.ncoCode || '7531'}
                  </div>

                  <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Overall Match Fit:</span>
                      <strong style={{ color: 'var(--primary-600)', fontSize: '15px' }}>{op.matchScore}%</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Est. Monthly Income:</span>
                      <strong>₹{op.incomeRange?.min?.toLocaleString()} to ₹{op.incomeRange?.max?.toLocaleString()}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>District Demand Level:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="badge badge-green" style={{ fontSize: '11px', padding: '2px 6px' }}>
                          Level {op.demand?.level} / 5
                        </span>
                        {op.demand?.isSynthetic && (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: '#f1f5f9', padding: '1px 4px', borderRadius: '4px' }}>
                            Demo Data
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBreakdown(occKey)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-600)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '10px',
                        padding: 0
                      }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Why this match score?
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {op.breakdown?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '11px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                              <span>{item.factor} ({item.weight}):</span>
                              <span style={{ color: 'var(--primary-600)' }}>{item.score}%</span>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{item.note}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {op.centers && op.centers.length > 0 && (
                    <div style={{ marginBottom: '12px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Building size={14} color="var(--primary-600)" /> Nearby Training Centers ({op.centers.length})
                      </div>
                      <ul style={{ listStyle: 'none', paddingLeft: '18px', color: 'var(--text-muted)' }}>
                        {op.centers.map((c, i) => (
                          <li key={i} style={{ marginBottom: '2px' }}>• {c.name} ({c.district})</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {op.schemes && op.schemes.length > 0 && (
                    <div style={{ marginBottom: '14px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Award size={14} color="var(--accent-gold)" /> Applicable PM Support Schemes
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {op.schemes.map((s, i) => (
                          <span key={i} className="badge badge-amber" style={{ fontSize: '10px' }}>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: op.track === 'self' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '6px', marginTop: '12px' }}>
                  <Link to={`/skill-gaps?occ=${occKey}`} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 8px' }}>
                    Skill Gaps
                  </Link>
                  <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 8px' }}>
                    Roadmap <ArrowRight size={12} />
                  </Link>
                  {op.track === 'self' && (
                    <Link to={`/self-employment?occ=${occKey}`} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 8px', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}>
                      Self Employment
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
