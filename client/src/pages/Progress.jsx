/* Progress.jsx: Training journey timeline and milestones for beneficiaries
   SIH26097 PM-AJAY Livelihood Assistant */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Clock, Circle } from 'lucide-react';
import { SkeletonCard, EmptyState, ReadAloudButton } from '../components.jsx';
import { getPlacements, api } from '../api.js';
import { useLang } from '../lang.js';
import './Progress.css';

const STATUS_META = {
  enrolled:  { icon: '📚', color: 'var(--color-info)',    label: 'Enrolled'  },
  completed: { icon: '🏅', color: 'var(--color-accent)',  label: 'Completed' },
  placed:    { icon: '✅', color: 'var(--color-success)', label: 'Placed'    },
  dropped:   { icon: '⚠️', color: 'var(--color-danger)',  label: 'Dropped'   },
};

function TimelineItem({ placement, isLast }) {
  const meta = STATUS_META[placement.status] || STATUS_META.enrolled;
  const date = new Date(placement.at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="timeline-item">
      <div className="timeline-connector">
        <div className="timeline-dot" style={{ background: meta.color }}>
          <span aria-hidden="true">{meta.icon}</span>
        </div>
        {!isLast && <div className="timeline-line" />}
      </div>
      <div className="timeline-content card">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="badge"
            style={{ background: `${meta.color}22`, color: meta.color }}
          >
            {meta.label}
          </span>
          <span className="text-xs text-muted">{date}</span>
        </div>
        <h3 className="font-semibold text-base">{placement.courseKey}</h3>
        {placement.employer && (
          <p className="text-sm text-muted mt-1">🏢 {placement.employer}</p>
        )}
        {placement.wage > 0 && (
          <p className="text-sm text-accent mt-1">
            💰 ₹{placement.wage.toLocaleString()} / month
          </p>
        )}
        {placement.notes && (
          <p className="text-xs text-muted mt-2 italic">{placement.notes}</p>
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
      setPlacements(plRes.data?.placements || []);
      setJourney(progRes?.journey || null);
    }).finally(() => setLoading(false));
  }, []);

  const counts = { enrolled: 0, completed: 0, placed: 0, dropped: 0 };
  placements.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });

  if (loading) return <div className="progress-root"><SkeletonCard rows={5} /></div>;

  return (
    <div className="progress-root page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award size={28} color="var(--color-saffron)" /> {t ? t('progress.title', 'My Progress & Milestones') : 'My Progress & Milestones'}
          </h1>
          <p className="text-muted text-sm mt-1">
            Live milestone tracking under PM-AJAY GIA Welfare & Skilling Initiative
          </p>
        </div>
        <ReadAloudButton lang={lang} />
      </div>

      {/* Current stage banner */}
      <div className="card mb-6" style={{ background: 'var(--surface-800)', border: '1px solid var(--surface-700)' }}>
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted font-bold">CURRENT STAGE</div>
            <div className="text-xl font-bold text-primary mt-1" style={{ textTransform: 'capitalize' }}>
              {journey?.currentStage?.replace(/_/g, ' ') || 'Skill Discovery & Skilling'}
            </div>
          </div>
          <Link to="/opportunities" className="btn btn-primary btn-sm">
            Browse New Pathways &rarr;
          </Link>
        </div>
      </div>

      {/* Welfare & Certification Milestones */}
      {journey?.milestones?.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-base font-bold mb-4">Welfare & Certification Milestones</h3>
          <div className="flex-col gap-3 flex">
            {journey.milestones.map((m, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface-700)', border: '1px solid var(--surface-600)' }}>
                {m.status === 'completed' ? (
                  <CheckCircle2 size={22} color="var(--color-success)" />
                ) : m.status === 'in_progress' ? (
                  <Clock size={22} color="var(--color-saffron)" />
                ) : (
                  <Circle size={22} color="var(--surface-400)" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-sm">{m.name}</div>
                  <div className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>
                    Status: {m.status.replace(/_/g, ' ')}
                  </div>
                </div>
                <span className={`badge ${m.status === 'completed' ? 'badge-success' : m.status === 'in_progress' ? 'badge-primary' : 'badge-muted'}`}>
                  {m.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key} className="progress-stat-pill" style={{ borderColor: meta.color }}>
            <span aria-hidden="true">{meta.icon}</span>
            <span className="font-bold" style={{ color: meta.color }}>{counts[key]}</span>
            <span className="text-xs text-muted">{meta.label}</span>
          </div>
        ))}
      </div>

      {/* Placement Timeline */}
      <div className="card">
        <h3 className="text-base font-bold mb-4">Training & Placement Records</h3>
        {placements.length === 0 ? (
          <EmptyState
            icon="🗺️"
            title="No training enrolled yet"
            description="You have not enrolled in any training courses yet. Explore NSQF-aligned pathways tailored to your profile."
            action={
              <Link to="/opportunities" className="btn btn-primary btn-sm">
                ✨ Find Training
              </Link>
            }
          />
        ) : (
          <div className="timeline">
            {placements.map((p, i) => (
              <TimelineItem key={p._id} placement={p} isLast={i === placements.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Progress;
