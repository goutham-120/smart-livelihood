/* Dashboard.jsx: Beneficiary home with charts, profile checklist, skills
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import {
  SkeletonCard, EmptyState, RiskBadge, StatCard, ReadAloudButton, ProgressBar
} from '../components.jsx';
import { getProfile, getPlacements } from '../api.js';
import { useLang } from '../lang.js';
import './Dashboard.css';

/* Simple SVG donut chart */
function DonutChart({ value, max = 100, color = 'var(--color-saffron)', size = 90 }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const dash = circ * pct;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${Math.round(pct * 100)}%`}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-700)" strokeWidth="12" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="50" y="55" textAnchor="middle" fill="currentColor" fontSize="18" fontWeight="700">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

/* Checklist item */
function CheckItem({ done, label }) {
  return (
    <div className="dash-check-item">
      <span className={`dash-check-dot ${done ? 'done' : ''}`} aria-hidden="true">
        {done ? '✓' : '○'}
      </span>
      <span className={done ? '' : 'text-muted'}>{label}</span>
    </div>
  );
}

const STATUS_COLORS = {
  enrolled: 'var(--color-info)',
  completed: 'var(--color-accent)',
  placed: 'var(--color-success)',
  dropped: 'var(--color-danger)',
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getPlacements()])
      .then(([pRes, plRes]) => {
        setProfile(pRes.data.profile);
        setPlacements(plRes.data.placements || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dash-root">
        <SkeletonCard rows={3} />
        <div className="grid grid-2 gap-4 mt-6">
          <SkeletonCard rows={2} />
          <SkeletonCard rows={2} />
        </div>
      </div>
    );
  }

  /* Checklist items */
  const checks = [
    { done: !!(profile?.language), label: 'Language selected' },
    { done: !!(profile?.village || profile?.block), label: 'Location set' },
    { done: !!(profile?.currentLivelihood), label: 'Current work entered' },
    { done: !!(profile?.skills?.length), label: 'Skills identified' },
    { done: placements.length > 0, label: 'Training enrolled' },
  ];
  const doneCount = checks.filter((c) => c.done).length;

  const latestPlacement = placements[0] || null;

  return (
    <div className="dash-root page-enter">
      {/* Read aloud */}
      <div className="mb-4">
        <ReadAloudButton lang={lang} />
      </div>

      {/* Welcome header */}
      <div className="dash-hero card-glass mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {t('dashboard.welcome')},{' '}
            <span className="text-primary">{user?.name?.split(' ')[0]}!</span>
          </h1>
          {doneCount < checks.length && (
            <p className="text-muted text-sm mt-1">{t('dashboard.completeProfile')}</p>
          )}
          {profile && <RiskBadge score={profile.riskScore} />}
        </div>
        <div className="dash-hero-donut">
          <DonutChart value={doneCount} max={checks.length} />
          <span className="text-xs text-muted text-center">Profile complete</span>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-3 flex-wrap mb-6">
        <button
          id="btn-start-interview"
          className="btn btn-primary"
          onClick={() => navigate('/assistant')}
          aria-label={t('dashboard.startInterview')}
        >
          🎙️ {t('dashboard.startInterview')}
        </button>
        <button
          id="btn-view-opportunities"
          className="btn btn-accent"
          onClick={() => navigate('/opportunities')}
          aria-label={t('dashboard.viewOpportunities')}
        >
          ✨ {t('dashboard.viewOpportunities')}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-3 gap-4 mb-6">
        <StatCard
          icon="🎯"
          label="Skills Identified"
          value={profile?.skills?.length || 0}
          color="var(--color-saffron)"
        />
        <StatCard
          icon="📚"
          label="Placements"
          value={placements.length}
          color="var(--color-info)"
        />
        <StatCard
          icon="💰"
          label="Income Goal"
          value={profile?.incomeGoal ? `₹${profile.incomeGoal.toLocaleString()}` : 'Not set'}
          sub="per month"
          color="var(--color-success)"
        />
      </div>

      <div className="grid grid-2 gap-6">
        {/* Profile checklist */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            📋 {t('dashboard.profileChecklist')}
          </h2>
          <div className="flex-col gap-2 flex">
            {checks.map((c, i) => <CheckItem key={i} {...c} />)}
          </div>
          <ProgressBar value={doneCount} max={checks.length} label="Overall Progress" color="var(--color-saffron)" />
        </div>

        {/* My skills */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            💼 {t('dashboard.mySkills')}
          </h2>
          {profile?.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="badge badge-primary">{s}</span>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="💡"
              description={t('dashboard.noSkills')}
              action={
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/assistant')}>
                  🎙️ Start Interview
                </button>
              }
            />
          )}

          {/* Latest training status */}
          {latestPlacement && (
            <div className="mt-4">
              <div className="divider" />
              <p className="text-xs text-muted mb-2">Latest Training</p>
              <div className="flex items-center gap-2">
                <span
                  className="badge"
                  style={{ background: `${STATUS_COLORS[latestPlacement.status]}22`, color: STATUS_COLORS[latestPlacement.status] }}
                >
                  {latestPlacement.status}
                </span>
                <span className="text-sm">{latestPlacement.courseKey}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
