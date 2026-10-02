import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { CheckCircle, AlertCircle, BookOpen, Building, ArrowRight } from 'lucide-react';

export const SkillGaps = () => {
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

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>Analyzing competencies...</div>;
  if (!data) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>Occupation data not found.</div>;

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '20px' }}>
        <span className="badge badge-blue" style={{ marginBottom: '8px' }}>NSQF Level {data.occupation?.nsqfLevel}</span>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Skill Gap Analysis: {data.occupation?.title}</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Comparison between your identified skills and certified industry standards</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <CheckCircle size={18} /> Acquired Competencies ({data.skillsSummary?.acquired?.length || 0})
          </h3>
          {data.skillsSummary?.acquired?.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.skillsSummary.acquired.map((s, idx) => (
                <li key={idx} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} color="#16a34a" /> {s.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: '13px', color: '#64748b' }}>No verified prior matches recorded.</div>
          )}
        </div>

        <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <AlertCircle size={18} /> Competency Gaps to Bridge ({data.skillsSummary?.missing?.length || 0})
          </h3>
          {data.skillsSummary?.missing?.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.skillsSummary.missing.map((s, idx) => (
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
          <BookOpen size={18} color="#4f46e5" /> Recommended Skilling Courses
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.recommendedCourses?.map((c) => (
            <div key={c.key} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.title}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{c.provider} • QP: {c.qpCode} • {c.durationMonths} Months</div>
              </div>
              <span className="badge badge-green">Free / 100% Grant</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <Link to="/opportunities" className="btn btn-secondary">Back to Opportunities</Link>
        <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary">
          View Detailed Roadmap <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
