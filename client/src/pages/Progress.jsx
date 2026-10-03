/* Progress.jsx: Training journey timeline and milestones for beneficiaries
   PM-AJAY Livelihood Assistant */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Clock, Circle } from 'lucide-react';
import { Card, SkeletonCard, EmptyState, ReadAloudButton } from '../components.jsx';
import { getPlacements, api } from '../api.js';
import { useLang } from '../lang.js';
import './Progress.css';

const STATUS_META = {
  enrolled:  { icon: '📚', color: 'var(--primary-600)',    label: 'Enrolled'  },
  completed: { icon: '🏅', color: 'var(--status-success)', label: 'Completed' },
  placed:    { icon: '✅', color: 'var(--accent-sky)',     label: 'Placed'    },
  dropped:   { icon: '⚠️', color: 'var(--status-danger)',  label: 'Dropped'   }
};

const DEFAULT_MILESTONES = [
  { name: 'Voice Assessment & Skill Identification', status: 'completed', description: 'Your prior skills and work experience have been verified by AI Voice Assistant.' },
  { name: 'NSQF Course Enrollment', status: 'in_progress', description: 'Active enrollment in NSQF Level 3 skilling module.' },
  { name: 'Practical Assessment & Certification', status: 'pending', description: 'Hands-on practical trade evaluation and Sector Skill Council certification.' },
  { name: 'Placement / Enterprise Linkage', status: 'pending', description: 'District placement drive or micro-enterprise grant disbursement.' }
];

function TimelineItem({ placement, isLast }) {
  const meta = STATUS_META[placement.status] || STATUS_META.enrolled;
  const date = placement.at ? new Date(placement.at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }) : 'Recent';

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

  if (loading) return <div className="page-container"><SkeletonCard rows={5} /></div>;

  const formatStatus = (st) => {
    if (!st) return 'Pending';
    const s = String(st).toLowerCase();
    if (s.includes('completed')) return 'Completed';
    if (s.includes('progress') || s.includes('in_progress')) return 'In Progress';
    if (s.includes('enrolled')) return 'Enrolled';
    if (s.includes('placed')) return 'Placed';
    return 'Pending';
  };

  const milestonesToRender = (journey?.milestones && journey.milestones.length > 0)
    ? journey.milestones
    : DEFAULT_MILESTONES;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={26} color="var(--accent-gold)" /> {t('progress.title', 'Active Livelihood Milestones')}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
            {t('progress.subtitle', 'Live milestone tracking under PM-AJAY GIA Welfare & Skilling Initiative')}
          </p>
        </div>
        <ReadAloudButton text="Active Livelihood Milestones. Track your progress across skilling, assessment, and placement." />
      </div>

      {/* Current stage banner */}
      <Card style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>{t('roadmap.current', 'CURRENT STAGE')}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginTop: '4px', textTransform: 'capitalize' }}>
              {journey?.currentStage?.replace(/_/g, ' ') || 'NSQF Course Enrollment'}
            </div>
            <h2 className="progress-stage-title" style={{ textTransform: 'capitalize' }}>
              {journey?.currentStage?.replace(/_/g, ' ') || 'Trade Skill Discovery'}
            </h2>
          </div>
          <Link to="/opportunities" className="btn btn-primary" style={{ fontSize: '13px' }}>
            {t('dashboard.exploreOpportunities', 'Browse New Pathways')} &rarr;
          </Link>
        </div>
      </Card>

      {/* Welfare & Certification Milestones */}
      <Card title={t('progress.welfareMilestones', 'Welfare & Certification Milestones')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          {milestonesToRender.map((m, idx) => {
            const formatted = formatStatus(m.status);
            const isComp = formatted === 'Completed';
            const isInProg = formatted === 'In Progress';
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                {isComp ? (
                  <CheckCircle2 size={22} color="var(--status-success)" />
                ) : isInProg ? (
                  <Clock size={22} color="var(--accent-gold)" />
                ) : (
                  <Circle size={22} color="var(--text-subtle)" />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{m.name}</div>
                  {m.description && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{m.description}</div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Status: <strong>{formatted}</strong>
                  </div>
                </div>
                <span className={`badge ${isComp ? 'badge-green' : isInProg ? 'badge-blue' : 'badge-amber'}`}>
                  {formatted}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'var(--surface-card)', border: `1px solid ${meta.color}`, borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
            <span aria-hidden="true">{meta.icon}</span>
            <span style={{ fontWeight: 800, color: meta.color }}>{counts[key]}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t(`progress.${key}`, meta.label)}</span>
          </div>
        ))}
      </div>

      {/* Placement Timeline */}
      <Card title={t('progress.timeline', 'Training & Placement Records')}>
        {placements.length === 0 ? (
          <EmptyState
            title={t('progress.noPlacements', 'No active placements yet')}
            description={t('progress.noProgress', 'You have not enrolled in any training courses yet. Explore NSQF-aligned pathways tailored to your profile.')}
            action={
              <Link to="/opportunities" className="btn btn-primary" style={{ fontSize: '13px' }}>
                {t('dashboard.exploreOpportunities', 'Find Training Pathways')} &rarr;
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
      </Card>
    </div>
  );
}

export default Progress;

