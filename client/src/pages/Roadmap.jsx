import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { Clock, ArrowRight, MapPin, Building, IndianRupee, Award, Layers } from 'lucide-react';

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/\b([a-z0-9]+(?:_[a-z0-9]+)+)\b/gi, (match) => {
    return match.replace(/^crs_/, '').replace(/_/g, ' ');
  });
};

export const Roadmap = () => {
  const [searchParams] = useSearchParams();
  const occKey = searchParams.get('occ') || 'self_employed_tailor';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRoadmap(occKey).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [occKey]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>Building personalized career roadmap...</div>;

  const steps = data?.roadmap?.steps || [];
  const occupation = data?.occupation || {};
  const centers = data?.nearbyCenters || [];

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Livelihood and Skilling Roadmap</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Step by step milestone plan ordered by prerequisite graph and local market linkages</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', background: '#eef2ff', borderColor: '#c7d2fe' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: 600 }}>Target Pathway</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-900)' }}>{occupation.title || occKey.replace(/_/g, ' ').toUpperCase()}</h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Sector: {occupation.sector} | Target NSQF Level {occupation.nsqfLevel}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span className="badge badge-green" style={{ fontSize: '13px', padding: '6px 12px' }}>
              Readiness Score: {data?.readinessScore}%
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Est. Duration: {data?.roadmap?.totalEstimatedMonths || 5} Months
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        {steps.map((step) => (
          <div key={step.step} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '16px' }}>
              {step.step}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{step.title}</h3>
                <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                  <Clock size={12} /> {step.durationMonths} Month{step.durationMonths > 1 ? 's' : ''}
                </span>
              </div>

              <p style={{ color: 'var(--text-main)', fontSize: '13px', lineHeight: '1.5', marginBottom: '10px' }}>{cleanText(step.description)}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', background: 'var(--bg-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                {step.nsqfProgression && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>NSQF Level Progression:</span>
                    <strong style={{ color: 'var(--primary-600)' }}>{cleanText(step.nsqfProgression)}</strong>
                  </div>
                )}

                {step.estimatedIncomeInr !== undefined && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Projected Stage Income:</span>
                    <strong style={{ color: 'var(--accent-green)' }}>₹{step.estimatedIncomeInr.toLocaleString()}/mo</strong>
                  </div>
                )}

                {step.recommendedCourse && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Recommended Skilling Course:</span>
                    <strong style={{ color: 'var(--primary-700)' }}>{cleanText(step.recommendedCourse)}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {centers.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building size={18} color="var(--primary-600)" /> Accredited Centers for this Pathway
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
            {centers.slice(0, 3).map((c, i) => (
              <div key={i} style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '12px' }}>
                <strong>{c.name}</strong>
                <div style={{ color: 'var(--text-muted)' }}>{c.district}, {c.state}</div>
                <div style={{ color: 'var(--primary-600)', fontWeight: 600, marginTop: '2px' }}>{c.contact}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/opportunities" className="btn btn-secondary">&larr; Back to Opportunities</Link>
        <Link to="/progress" className="btn btn-primary">Track My Active Milestones &rarr;</Link>
      </div>
    </div>
  );
};
