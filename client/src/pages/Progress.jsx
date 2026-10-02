/* Progress.jsx: Training journey timeline and milestones for beneficiaries
   PM-AJAY Livelihood Assistant */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { SkeletonCard, EmptyState, ReadAloudButton } from '../components.jsx';
import { getPlacements, api } from '../api.js';
import { useLang } from '../lang.js';
import './Progress.css';

const STATUS_META = {
  enrolled:  { icon: '📚', color: '#2563eb', bg: '#eff6ff', label: 'Enrolled Courses'  },
  completed: { icon: '🏅', color: '#d97706', bg: '#fffbeb', label: 'Completed Modules' },
  placed:    { icon: '✅', color: '#15803d', bg: '#f0fdf4', label: 'Placed or Linked'  },
  dropped:   { icon: '⚠️', color: '#dc2626', bg: '#fef2f2', label: 'Flagged Follow-ups' }
};

const formatCourseTitle = (key) => {
  if (!key) return 'Certified Skilling Program';
  return key
    .replace(/^crs_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function TimelineItem({ placement, isLast }) {
  const meta = STATUS_META[placement.status] || STATUS_META.enrolled;
  const date = new Date(placement.at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="timeline-item">
      <div className="timeline-connector">
        <div className="timeline-dot" style={{ borderColor: meta.color, background: meta.bg }}>
          <span aria-hidden="true">{meta.icon}</span>
        </div>
        {!isLast && <div className="timeline-line" />}
      </div>
      <div className="timeline-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span
            style={{
              background: meta.bg,
              color: meta.color,
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            {meta.label}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{date}</span>
        </div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
          {placement.courseTitle || placement.title || formatCourseTitle(placement.courseKey)}
        </h4>
        {placement.employer && (
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
            🏢 {placement.employer}
          </p>
        )}
        {placement.wage > 0 && (
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#15803d', fontWeight: 700 }}>
            💰 ₹{placement.wage.toLocaleString()} / month
          </p>
        )}
        {placement.notes && (
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
            {placement.notes}
          </p>
        )}
      </div>
    </div>
  );
}

export function Progress() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [placements, setPlacements] = useState([]);
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPlacements().catch(() => ({ data: { placements: [] } })),
      api.getProgress().catch(() => ({ journey: null }))
    ]).then(([plRes, progRes]) => {
      setPlacements(plRes?.data?.placements || []);
      setJourney(progRes?.journey || null);
    }).finally(() => setLoading(false));
  }, []);

  const counts = { enrolled: 0, completed: 0, placed: 0, dropped: 0 };
  placements.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });

  const milestones = journey?.milestones?.length > 0 ? journey.milestones : [
    { name: 'Voice Assessment & Skill Identification', status: 'completed' },
    { name: 'NSQF Course Enrollment', status: 'in_progress' },
    { name: 'Practical Assessment & Certification', status: 'pending' },
    { name: 'Placement / Enterprise Linkage', status: 'pending' }
  ];

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const progressPct = Math.round((completedCount / milestones.length) * 100);

  if (loading) {
    return (
      <div className="progress-root page-enter">
        <SkeletonCard rows={5} />
      </div>
    );
  }

  return (
    <div className="progress-root page-enter">
      {/* Page Header */}
      <div className="progress-header">
        <div>
          <h1 className="progress-header-title">
            <Award size={28} color="#ea580c" />
            {t ? t('progress.title', 'Active Livelihood Milestones') : 'Active Livelihood Milestones'}
          </h1>
          <p className="progress-header-subtitle">
            Real-time tracking of PM-AJAY skilling, assessment, certification, and livelihood placement
          </p>
        </div>
        <ReadAloudButton lang={lang} />
      </div>

      {/* Hero Stage Banner */}
      <div className="progress-hero-banner">
        <div className="progress-hero-top">
          <div>
            <div className="progress-stage-label">
              <Sparkles size={14} /> CURRENT LIVELIHOOD STAGE
            </div>
            <h2 className="progress-stage-title" style={{ textTransform: 'capitalize' }}>
              {journey?.currentStage?.replace(/_/g, ' ') || 'Trade Skill Discovery'}
            </h2>
          </div>
          <Link to="/opportunities" className="progress-hero-btn">
            Browse New Pathways &rarr;
          </Link>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar-labels">
            <span>Overall Milestone Completion</span>
            <span>{completedCount} of {milestones.length} Completed ({progressPct}%)</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Welfare & Certification Milestones List */}
      <div className="milestones-card">
        <div className="milestones-header">
          <h3 className="milestones-title">
            <CheckCircle2 size={20} color="#2563eb" /> Welfare & Certification Milestones
          </h3>
          <span className="milestones-counter">
            {completedCount} of {milestones.length} Steps Done
          </span>
        </div>

        <div className="milestones-list">
          {milestones.map((m, idx) => {
            const isDone = m.status === 'completed';
            const isInProg = m.status === 'in_progress';
            return (
              <div key={idx} className={`milestone-item ${m.status}`}>
                <div className="milestone-icon-wrap">
                  {isDone ? (
                    <CheckCircle2 size={22} color="#16a34a" />
                  ) : isInProg ? (
                    <Clock size={22} color="#d97706" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div className="milestone-content">
                  <h4 className="milestone-name">{m.name}</h4>
                  <div className="milestone-sub">
                    {isDone ? (
                      <span style={{ color: '#15803d', fontWeight: 600 }}>Completed milestone</span>
                    ) : isInProg ? (
                      <span style={{ color: '#b45309', fontWeight: 600 }}>Currently in active progression</span>
                    ) : (
                      <span>Scheduled after preceding milestones</span>
                    )}
                  </div>
                </div>

                <span className={`milestone-badge ${m.status}`}>
                  {isDone ? 'Completed' : isInProg ? 'In Progress' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Metrics Grid */}
      <div className="progress-stats-grid">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key} className="progress-stat-card">
            <div className="progress-stat-icon" style={{ background: meta.bg }}>
              <span>{meta.icon}</span>
            </div>
            <div>
              <div className="progress-stat-num" style={{ color: meta.color }}>
                {counts[key]}
              </div>
              <div className="progress-stat-lbl">{meta.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Training & Placement Records Timeline */}
      <div className="timeline-card">
        <h3 className="milestones-title" style={{ marginBottom: '16px' }}>
          <Award size={20} color="#2563eb" /> Certified Training & Placement Timeline
        </h3>
        {placements.length === 0 ? (
          <EmptyState
            title="No Active Training Enrollments Yet"
            description="You have not enrolled in certified skilling programs yet. Explore NSQF accredited courses and government toolkit schemes tailored to your local district demand."
            action={
              <Link to="/opportunities" className="btn btn-primary" style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Explore Tailored Pathways
              </Link>
            }
          />
        ) : (
          <div className="timeline">
            {placements.map((p, i) => (
              <TimelineItem key={p._id || i} placement={p} isLast={i === placements.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Progress;
