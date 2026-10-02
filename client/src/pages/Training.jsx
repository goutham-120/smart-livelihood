import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { BookOpen, MapPin, Phone, Award } from 'lucide-react';

export const Training = () => {
  const [searchParams] = useSearchParams();
  const occKey = searchParams.get('occ') || 'self_employed_tailor';
  const [trainingData, setTrainingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTraining(occKey).then((res) => {
      setTrainingData(res);
      setLoading(false);
    });
  }, [occKey]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>Loading training details...</div>;

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Certified Training Programs: {trainingData.occupation?.title}</h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Free government-funded skilling with NSQF certification under PMKVY and PM-AJAY GIA</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {trainingData.courses?.map((course) => (
          <div key={course.key} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-blue">NSQF Level {course.nsqfLevel}</span>
              <span className="badge badge-green">100% Subsidy / PM-AJAY</span>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0' }}>{course.title}</h3>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              <strong>Provider:</strong> {course.provider} | <strong>QP Code:</strong> {course.qpCode} | <strong>Duration:</strong> {course.durationMonths} Months
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Competencies Gained:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {course.skillsGained?.map((sk, i) => (
                  <span key={i} className="badge badge-blue" style={{ fontSize: '11px' }}>{sk.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
              <a href={course.source || 'https://www.skillindiadigital.gov.in'} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 600 }}>
                Official Skill India Portal Listing &rarr;
              </a>
              <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary" style={{ fontSize: '13px' }}>
                Enroll in Career Roadmap
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
