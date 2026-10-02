/* Progress.jsx: Training journey timeline for beneficiaries
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonCard, EmptyState, ReadAloudButton } from '../components.jsx';
import { getPlacements } from '../api.js';
import { useLang } from '../lang.js';
import './Progress.css';

const STATUS_META = {
  enrolled:  { icon: '📚', color: 'var(--color-info)',    label: 'Enrolled'  },
  completed: { icon: '🏅', color: 'var(--color-accent)',  label: 'Completed' },
  placed:    { icon: '✅', color: 'var(--color-success)', label: 'Placed'    },
  dropped:   { icon: '⚠️', color: 'var(--color-danger)',  label: 'Dropped'   },
};

function TimelineItem({ placement, isLast }) {
  const { t } = useTranslation();
  const meta = STATUS_META[placement.status] || STATUS_META.enrolled;
  const date = new Date(placement.at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="timeline-item">
      {/* Connector line */}
      <div className="timeline-connector">
        <div className="timeline-dot" style={{ background: meta.color }}>
          <span aria-hidden="true">{meta.icon}</span>
        </div>
        {!isLast && <div className="timeline-line" />}
      </div>
      {/* Content */}
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

export default function Progress() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlacements()
      .then((res) => setPlacements(res.data.placements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Summary stats */
  const counts = { enrolled: 0, completed: 0, placed: 0, dropped: 0 };
  placements.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });

  if (loading) return <SkeletonCard rows={5} />;

  return (
    <div className="progress-root page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('progress.title')}</h1>
        <ReadAloudButton lang={lang} />
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key} className="progress-stat-pill" style={{ borderColor: meta.color }}>
            <span aria-hidden="true">{meta.icon}</span>
            <span className="font-bold" style={{ color: meta.color }}>{counts[key]}</span>
            <span className="text-xs text-muted">{meta.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {placements.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title="No training yet"
          description={t('progress.noProgress')}
          action={
            <a href="/opportunities" className="btn btn-primary btn-sm">
              ✨ Find Training
            </a>
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
  );
}
