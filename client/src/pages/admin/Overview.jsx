/* admin/Overview.jsx: Analytics dashboard with funnel, demand vs supply, dropout risk
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../AuthContext.jsx';
import { SkeletonCard, SyntheticBadge, StatCard } from '../../components.jsx';
import { getAnalyticsOverview } from '../../api.js';
import './Overview.css';

/* Simple CSS bar chart */
function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="bar-row">
      <span className="bar-label text-xs" title={label}>{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color || 'var(--color-saffron)' }} />
      </div>
      <span className="bar-val text-xs font-bold">{value.toLocaleString()}</span>
    </div>
  );
}

/* Funnel visualization */
function Funnel({ data }) {
  const steps = [
    { key: 'registered',       label: 'Registered',        icon: '👥', color: 'var(--color-info)' },
    { key: 'skillsIdentified', label: 'Skills Identified',  icon: '💡', color: 'var(--color-warning)' },
    { key: 'trainingEnrolled', label: 'Training Enrolled',  icon: '📚', color: 'var(--color-saffron)' },
    { key: 'certified',        label: 'Certified',          icon: '🏅', color: 'var(--color-accent)' },
    { key: 'placedOrSelfEmployed', label: 'Placed / Self-Employed', icon: '✅', color: 'var(--color-success)' },
  ];
  const maxVal = data.registered || 1;

  return (
    <div className="funnel">
      {steps.map((s, i) => {
        const val = data[s.key] || 0;
        const widthPct = Math.max(15, Math.round((val / maxVal) * 100));
        return (
          <div key={s.key} className="funnel-step" style={{ '--w': `${widthPct}%` }}>
            <div className="funnel-bar" style={{ background: s.color }}>
              <span className="funnel-icon" aria-hidden="true">{s.icon}</span>
              <span className="funnel-label">{s.label}</span>
              <span className="funnel-val">{val.toLocaleString()}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const DISTRICTS = ['Warangal', 'Adilabad', 'Nalgonda'];

export default function Overview() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState(user?.district || '');

  const load = (d) => {
    setLoading(true);
    getAnalyticsOverview(d)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(district);
  }, [district]);

  return (
    <div className="overview-root page-enter">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">{t('admin.overview')}</h1>
        <div className="flex items-center gap-3">
          <SyntheticBadge />
          {user?.role === 'admin' && (
            <select
              id="sel-district"
              className="input select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ width: 180 }}
            >
              <option value="">All Districts</option>
              {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-2 gap-6">
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
        </div>
      ) : data ? (
        <>
          {/* Key stats */}
          <div className="grid grid-4 gap-4 mb-8">
            <StatCard icon="👥" label="Registered" value={data.funnel?.registered || 0} color="var(--color-info)" />
            <StatCard icon="✅" label="Placed" value={data.funnel?.placedOrSelfEmployed || 0} color="var(--color-success)" />
            <StatCard icon="📈" label="Placement Rate" value={`${data.placementRate || 0}%`} color="var(--color-accent)" />
            <StatCard icon="🚨" label="Dropout Risk (High)" value={data.dropoutRisk?.high || 0} color="var(--risk-high)" />
          </div>

          <div className="grid grid-2 gap-6 mb-6">
            {/* Training funnel */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">📊 {t('admin.funnel')}</h2>
              <Funnel data={data.funnel || {}} />
              {data.funnel?.dropouts > 0 && (
                <p className="text-xs text-muted mt-3">
                  ⚠ {data.funnel.dropouts} dropouts recorded.
                </p>
              )}
            </div>

            {/* Dropout risk */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">⚠️ {t('admin.dropoutRisk')}</h2>
              <div className="risk-rings">
                <div className="risk-ring" style={{ '--color': 'var(--risk-high)' }}>
                  <span className="risk-val">{data.dropoutRisk?.high || 0}</span>
                  <span className="risk-lbl">{t('admin.riskHigh')}</span>
                </div>
                <div className="risk-ring" style={{ '--color': 'var(--risk-medium)' }}>
                  <span className="risk-val">{data.dropoutRisk?.medium || 0}</span>
                  <span className="risk-lbl">{t('admin.riskMedium')}</span>
                </div>
                <div className="risk-ring" style={{ '--color': 'var(--risk-low)' }}>
                  <span className="risk-val">{data.dropoutRisk?.low || 0}</span>
                  <span className="risk-lbl">{t('admin.riskLow')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demand vs Supply */}
          {data.demandVsSupply?.length > 0 && (
            <div className="card mb-6">
              <h2 className="text-lg font-semibold mb-4">📉 Demand vs Supply</h2>
              <div className="dvs-grid">
                {data.demandVsSupply.slice(0, 8).map((d) => (
                  <div key={d.occupationKey} className="dvs-row">
                    <span className="text-xs font-medium" style={{ minWidth: 120 }}>{d.occupationKey}</span>
                    <div className="dvs-bars">
                      <div className="dvs-bar-wrap">
                        <span className="text-xs text-muted">Demand</span>
                        <Bar label="" value={d.openings} max={Math.max(d.openings, d.availableCandidates) || 1} color="var(--color-saffron)" />
                      </div>
                      <div className="dvs-bar-wrap">
                        <span className="text-xs text-muted">Supply</span>
                        <Bar label="" value={d.availableCandidates} max={Math.max(d.openings, d.availableCandidates) || 1} color="var(--color-green-light)" />
                      </div>
                    </div>
                    <span className={`text-xs ${d.gap > 0 ? 'text-success' : 'text-danger'}`}>
                      {d.gap > 0 ? `+${d.gap} gap` : `${d.gap} surplus`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top trades */}
          {data.byTrade?.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">🔧 Top Skills in District</h2>
              <div className="flex-col gap-2 flex">
                {data.byTrade.map((t) => (
                  <Bar
                    key={t.trade}
                    label={t.trade}
                    value={t.count}
                    max={data.byTrade[0].count}
                    color="var(--color-saffron)"
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted">No data available for this district.</p>
      )}
    </div>
  );
}
