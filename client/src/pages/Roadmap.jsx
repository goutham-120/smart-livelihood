import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { CheckCircle2, Circle, Clock, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

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

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>Loading career roadmap...</div>;

  return (
    <div className="container" style={{ maxWidth: '840px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Livelihood & Skilling Roadmap</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Step-by-step milestone plan from skill gap closure to sustainable income</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', background: '#eef2ff', borderColor: '#c7d2fe' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#4338ca', fontWeight: 600 }}>Target Pathway</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b' }}>{occKey.replace(/_/g, ' ').toUpperCase()}</h2>
          </div>
          <div>
            <span className="badge badge-green" style={{ fontSize: '13px', padding: '6px 12px' }}>
              Readiness Score: {data?.readinessScore}%
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {data?.roadmap?.steps?.map((step) => (
          <div key={step.step} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
              {step.step}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{step.title}</h3>
                <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                  <Clock size={12} /> {step.durationMonths} Month{step.durationMonths > 1 ? 's' : ''}
                </span>
              </div>
              <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.4' }}>{step.description}</p>
              {step.recommendedCourse && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#4338ca', fontWeight: 600 }}>
                  Course Module: {step.recommendedCourse}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/opportunities" className="btn btn-secondary">&larr; Back to Opportunities</Link>
        <Link to="/progress" className="btn btn-primary">Track My Active Milestones &rarr;</Link>
      </div>
    </div>
  );
};
