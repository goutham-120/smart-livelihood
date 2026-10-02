import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { BookOpen, Award, Filter } from 'lucide-react';

export const Training = () => {
  const [searchParams] = useSearchParams();
  const occKey = searchParams.get('occ') || 'self_employed_tailor';
  const [trainingData, setTrainingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [costFilter, setCostFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  useEffect(() => {
    api.getTraining(occKey).then((res) => {
      setTrainingData(res);
      setLoading(false);
    });
  }, [occKey]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>Loading certified training details...</div>;

  const rawCourses = trainingData.courses || [];
  const filteredCourses = rawCourses.filter((course) => {
    if (costFilter === 'free' && course.costInr > 0) return false;
    if (modeFilter !== 'all' && course.mode !== modeFilter) return false;
    if (languageFilter !== 'all' && course.language !== languageFilter) return false;
    if (durationFilter === 'short' && course.durationMonths > 3) return false;
    if (durationFilter === 'long' && course.durationMonths <= 3) return false;
    return true;
  });

  return (
    <div className="container" style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Certified Training Programs: {trainingData.occupation?.title}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Free government funded skilling with NSQF certification under PMKVY and PM-AJAY GIA</p>
      </div>

      <div className="card" style={{ marginBottom: '20px', background: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '12px', fontSize: '14px' }}>
          <Filter size={16} /> Filter Course Modules
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Cost</label>
            <select value={costFilter} onChange={(e) => setCostFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
              <option value="all">All Costs</option>
              <option value="free">100% Free / Subsidized</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mode</label>
            <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
              <option value="all">All Modes</option>
              <option value="offline">Offline / Workshop</option>
              <option value="hybrid">Hybrid</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Duration</label>
            <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
              <option value="all">All Durations</option>
              <option value="short">1 to 3 Months</option>
              <option value="long">3 to 6 Months</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Language</label>
            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="te">Telugu</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.key} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-blue">NSQF Level {course.nsqfLevel}</span>
                <span className="badge badge-green">
                  {course.costInr === 0 ? '100% Free Subsidy (PM-AJAY GIA)' : `₹${course.costInr.toLocaleString()}`}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0' }}>{course.title}</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Provider: {course.provider} | QP Code: {course.qpCode} | Duration: {course.durationMonths} Months | Mode: {course.mode}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Required Trade Skills & Competencies Gained:</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {course.skillsGained?.map((sk, i) => (
                    <span key={i} className="badge badge-blue" style={{ fontSize: '11px' }}>{sk.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '12px' }}>
                <a href={course.source || 'https://www.skillindiadigital.gov.in'} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: 600 }}>
                  Official Skill India Digital Listing &rarr;
                </a>
                <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary" style={{ fontSize: '13px' }}>
                  Enroll in Career Roadmap
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No courses match the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
