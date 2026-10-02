/* Dashboard.jsx: Role-adaptive Dashboard
   - Beneficiaries see skilling progress, checklist, donut chart, skills, and placements
   - Officers & Admins see district command cockpit with 5-stage funnel, dropout risk, and demand metrics
   SIH26097 PM-AJAY Livelihood Assistant */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../AuthContext.jsx';
import { TrendingUp, Users, Award, AlertTriangle, ShieldCheck, BarChart3, Plus, FileText } from 'lucide-react';
import { SkeletonCard, EmptyState, RiskBadge, StatCard, ReadAloudButton, ProgressBar } from '../components.jsx';
import { getProfile, getPlacements, api } from '../api.js';
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

/* Officer Cockpit Component */
function OfficerCockpit({ user }) {
  const [district, setDistrict] = useState(user?.district || 'Warangal');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getOfficerAnalytics(district).then((res) => {
      setAnalytics(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [district]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>🏛️ District Officer Command Cockpit</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>PM-AJAY GIA Skilling, Placement, and Dropout Governance ({district})</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>Filter District:</span>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="input select"
            style={{ minHeight: '36px', padding: '4px 12px', width: 'auto' }}
          >
            <option value="Warangal">Warangal</option>
            <option value="Adilabad">Adilabad</option>
            <option value="Nalgonda">Nalgonda</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}><SkeletonCard rows={4} /></div>
      ) : (
        <div>
          {/* 5-Stage Funnel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--color-saffron)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>1. REGISTERED</div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#f8fafc' }}>{analytics?.funnel?.registered || 100}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-saffron)' }}>Beneficiaries Mobilized</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>2. SKILLS IDENTIFIED</div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#f8fafc' }}>{analytics?.funnel?.skillsIdentified || 95}</div>
              <div style={{ fontSize: '12px', color: '#0284c7' }}>Assessed via Voice AI</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>3. ENROLLED IN NSQF</div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#f8fafc' }}>{analytics?.funnel?.trainingEnrolled || 78}</div>
              <div style={{ fontSize: '12px', color: '#d97706' }}>Active in Training</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>4. PLACED / ENTERPRISE</div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#f8fafc' }}>{analytics?.funnel?.placedOrSelfEmployed || 33}</div>
              <div style={{ fontSize: '12px', color: '#16a34a' }}>Placement Rate: {analytics?.placementRate}%</div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>5. DROPOUTS FLAGGED</div>
              <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0', color: '#f8fafc' }}>{analytics?.funnel?.dropouts || 14}</div>
              <div style={{ fontSize: '12px', color: '#dc2626' }}>Requires Intervention</div>
            </div>
          </div>

          {/* Dropout Risk Management */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#dc2626" /> Early Dropout Risk Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(239,68,68,0.15)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#ef4444' }}>High Risk (Mobility/Literacy):</span>
                  <strong>{analytics?.dropoutRisk?.high || 18} candidates</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(245,158,11,0.15)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#f59e0b' }}>Medium Risk:</span>
                  <strong>{analytics?.dropoutRisk?.medium || 34} candidates</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(34,197,94,0.15)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#22c55e' }}>Low Risk:</span>
                  <strong>{analytics?.dropoutRisk?.low || 48} candidates</strong>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="var(--color-saffron)" /> Top Competencies in Demand
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analytics?.byTrade?.slice(0, 5).map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--surface-700)' }}>
                    <span style={{ textTransform: 'capitalize' }}>{t.trade.replace(/_/g, ' ')}</span>
                    <span className="badge badge-info">{t.count} candidates</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Beneficiary Home Component */
function BeneficiaryDashboard({ user }) {
  const { t } = useTranslation();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getPlacements()])
      .then(([pRes, plRes]) => {
        setProfile(pRes.data?.profile || pRes.data || null);
        setPlacements(plRes.data?.placements || []);
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
    <div className="dash-root page-enter container">
      <div className="mb-4">
        <ReadAloudButton lang={lang} />
      </div>

      <div className="dash-hero card-glass mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {t ? t('dashboard.welcome', 'Welcome') : 'Welcome'},{' '}
            <span className="text-primary">{user?.name?.split(' ')[0] || 'Beneficiary'}!</span>
          </h1>
          {doneCount < checks.length && (
            <p className="text-muted text-sm mt-1">Complete your profile to unlock tailored livelihood pathways.</p>
          )}
          {profile && <RiskBadge score={profile.riskScore} />}
        </div>
        <div className="dash-hero-donut">
          <DonutChart value={doneCount} max={checks.length} />
          <span className="text-xs text-muted text-center">Profile complete</span>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap mb-6">
        <button
          id="btn-start-interview"
          className="btn btn-primary"
          onClick={() => navigate('/assistant')}
        >
          🎙️ Speak with Voice AI
        </button>
        <button
          id="btn-view-opportunities"
          className="btn btn-accent"
          onClick={() => navigate('/opportunities')}
        >
          ✨ View Matched Opportunities
        </button>
      </div>

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
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">📋 Profile Checklist</h2>
          <div className="flex-col gap-2 flex">
            {checks.map((c, i) => <CheckItem key={i} {...c} />)}
          </div>
          <ProgressBar value={doneCount} max={checks.length} label="Overall Progress" color="var(--color-saffron)" />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">💼 My Identified Skills</h2>
          {profile?.skills?.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="badge badge-primary">{s}</span>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="💡"
              description="No skills recorded yet. Speak with our Voice AI to map your skills."
              action={
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/assistant')}>
                  🎙️ Start Voice Interview
                </button>
              }
            />
          )}

          {latestPlacement && (
            <div className="mt-4">
              <div className="divider" />
              <p className="text-xs text-muted mb-2">Latest Training</p>
              <div className="flex items-center gap-2">
                <span
                  className="badge"
                  style={{ background: `${STATUS_COLORS[latestPlacement.status] || '#666'}22`, color: STATUS_COLORS[latestPlacement.status] || '#fff' }}
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

export function Dashboard({ user: propUser }) {
  const auth = useAuth?.();
  const user = propUser || auth?.user || (typeof localStorage !== 'undefined' && JSON.parse(localStorage.getItem('pmajay_user') || 'null'));

  if (user?.role === 'officer' || user?.role === 'admin') {
    return <OfficerCockpit user={user} />;
  }

  return <BeneficiaryDashboard user={user} />;
}

export default Dashboard;
