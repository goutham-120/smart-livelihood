import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { CheckCircle, AlertCircle, BookOpen, Building, ArrowRight, Star } from 'lucide-react';

export const SkillGaps = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const occKey = searchParams.get('occ') || 'self_employed_tailor';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSkillGaps(occKey).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [occKey]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>{t('common.loading', 'Analyzing competency gaps...')}</div>;
  if (!data) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>{t('common.error', 'Occupation data not found.')}</div>;

  const acquired = data.skillsSummary?.acquired || [];
  const missing = data.skillsSummary?.missing || [];
  const learnFirst = data.skillsSummary?.learnFirst || missing.slice(0, 3);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <span className="badge badge-blue" style={{ marginBottom: '8px' }}>{t('dashboard.nsqfLevel', 'NSQF Level')} {data.occupation?.nsqfLevel}</span>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t('skillGaps.title', 'Competency Gap Analysis')}: {data.occupation?.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('skillGaps.subtitle', 'Comparison between your identified skills and certified industry standards')}</p>
      </div>

      {learnFirst.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', background: '#eef2ff', borderColor: '#c7d2fe' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Star size={18} color="var(--primary-600)" /> Priority Prerequisites: Learn First List
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            These foundational skills form the essential base graph required before advanced trade modules:
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {learnFirst.map((sk, idx) => (
              <span key={idx} className="badge badge-blue" style={{ fontSize: '12px', padding: '6px 12px' }}>
                Step {idx + 1}: {sk.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <CheckCircle size={18} /> Your Skills: Acquired Competencies ({acquired.length})
          </h3>
          {acquired.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {acquired.map((s, idx) => (
                <li key={idx} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} color="#16a34a" /> {s.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No verified prior matches recorded.</div>
          )}
        </div>

        <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <AlertCircle size={18} /> Required Skills: Competency Gaps ({missing.length})
          </h3>
          {missing.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {missing.map((s, idx) => (
                <li key={idx} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} color="#d97706" /> {s.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: '13px', color: '#16a34a' }}>All core competencies fulfilled!</div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} color="var(--primary-600)" /> Recommended Skilling Courses
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.recommendedCourses?.map((c) => (
            <div key={c.key} style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Provider: {c.provider} • QP Code: {c.qpCode} • Duration: {c.durationMonths} Months
                </div>
              </div>
              <span className="badge badge-green">100% Free PM-AJAY Grant</span>
            </div>
          ))}
        </div>
      </div>

      {data.nearbyCenters && data.nearbyCenters.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="var(--primary-600)" /> Accredited District Training Centers
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {data.nearbyCenters.map((center, idx) => (
              <div key={idx} style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                <strong style={{ display: 'block', marginBottom: '2px' }}>{center.name}</strong>
                <div style={{ color: 'var(--text-muted)' }}>District: {center.district}, {center.state}</div>
                <div style={{ color: 'var(--text-muted)' }}>Contact: {center.contact || 'N/A'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <Link to="/opportunities" className="btn btn-secondary">Back to Opportunities</Link>
        <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary">
          View Detailed Roadmap <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
