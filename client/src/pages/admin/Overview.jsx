/* admin/Overview.jsx: Analytics dashboard with funnel, demand vs supply, dropout risk
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../AuthContext.jsx';
import { SkeletonCard, SyntheticBadge, StatCard } from '../../components.jsx';
import { getAnalyticsOverview } from '../../api.js';
import './Overview.css';

function formatLabel(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* Funnel visualization */
function Funnel({ data }) {
  const steps = [
    { key: 'registered',            label: 'Registered',            icon: '👥', color: 'var(--primary-700, #994d02)' },
    { key: 'skillsIdentified',      label: 'Skills Identified',      icon: '💡', color: 'var(--primary-600, #ca6603)' },
    { key: 'trainingEnrolled',      label: 'Training Enrolled',      icon: '📚', color: 'var(--primary-500, #ea580c)' },
    { key: 'certified',             label: 'Certified',              icon: '🏅', color: '#c2410c' },
    { key: 'placedOrSelfEmployed',  label: 'Placed / Self-Employed', icon: '✅', color: 'var(--status-success, #16a34a)' },
  ];
  const maxVal = data.registered || 1;

  return (
    <div className="funnel">
      {steps.map((s) => {
        const val = data[s.key] || 0;
        const widthPct = Math.max(18, Math.round((val / maxVal) * 100));
        return (
          <div key={s.key} className="funnel-step">
            <div className="funnel-bar" style={{ width: `${widthPct}%`, background: s.color }}>
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
    <div className="overview-page page-enter">
      {/* Header Controls */}
      <div className="overview-header">
        <h1 className="overview-title">{t('admin.overview')}</h1>
        <div className="overview-controls">
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
        <div className="overview-kpi-grid">
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
        </div>
      ) : data ? (
        <>
          {/* KPI / Summary Cards Grid */}
          <div className="overview-kpi-grid">
            <StatCard icon="👥" label="Registered" value={data.funnel?.registered || 0} color="var(--primary-600, #ca6603)" />
            <StatCard icon="✅" label="Placed" value={data.funnel?.placedOrSelfEmployed || 0} color="var(--status-success, #16a34a)" />
            <StatCard icon="📈" label="Placement Rate" value={`${data.placementRate || 0}%`} color="var(--primary-600, #ca6603)" />
            <StatCard icon="🚨" label="Dropout Risk (High)" value={data.dropoutRisk?.high || 0} color="var(--status-danger, #dc2626)" />
          </div>

          {/* Training Funnel & Dropout Risk Side-by-Side Row */}
          <div className="overview-two-col">
            {/* Training Funnel Card */}
            <div className="card">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 {t('admin.funnel')}
              </h2>
              <Funnel data={data.funnel || {}} />
              {data.funnel?.dropouts > 0 && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '14px', fontWeight: 500 }}>
                  ⚠️ {data.funnel.dropouts} dropouts recorded in funnel pipeline.
                </p>
              )}
            </div>

            {/* Dropout Risk Card */}
            <div className="card">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ {t('admin.dropoutRisk')}
              </h2>
              <div className="risk-rings">
                <div className="risk-ring" style={{ '--risk-color': 'var(--status-danger, #dc2626)' }}>
                  <span className="risk-val">{data.dropoutRisk?.high || 0}</span>
                  <span className="risk-lbl">{t('admin.riskHigh')}</span>
                </div>
                <div className="risk-ring" style={{ '--risk-color': '#d97706' }}>
                  <span className="risk-val">{data.dropoutRisk?.medium || 0}</span>
                  <span className="risk-lbl">{t('admin.riskMedium')}</span>
                </div>
                <div className="risk-ring" style={{ '--risk-color': 'var(--status-success, #16a34a)' }}>
                  <span className="risk-val">{data.dropoutRisk?.low || 0}</span>
                  <span className="risk-lbl">{t('admin.riskLow')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Demand vs Supply Section */}
          {data.demandVsSupply?.length > 0 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                📉 Demand vs Supply
              </h2>
              <div className="dvs-grid">
                {data.demandVsSupply.slice(0, 8).map((d) => {
                  const formattedName = formatLabel(d.occupationKey);
                  const maxVal = Math.max(d.openings, d.availableCandidates) || 1;
                  const demandPct = Math.round((d.openings / maxVal) * 100);
                  const supplyPct = Math.round((d.availableCandidates / maxVal) * 100);

                  return (
                    <div key={d.occupationKey} className="dvs-row">
                      <div className="dvs-occupation-title" title={formattedName}>{formattedName}</div>
                      <div className="dvs-bars">
                        <div className="dvs-bar-line">
                          <span className="dvs-bar-label">Demand</span>
                          <div className="dvs-bar-track">
                            <div className="dvs-bar-fill" style={{ width: `${demandPct}%`, background: 'var(--primary-600, #ca6603)' }} />
                          </div>
                          <span className="dvs-bar-val">{d.openings.toLocaleString()}</span>
                        </div>
                        <div className="dvs-bar-line">
                          <span className="dvs-bar-label">Supply</span>
                          <div className="dvs-bar-track">
                            <div className="dvs-bar-fill" style={{ width: `${supplyPct}%`, background: 'var(--status-success, #16a34a)' }} />
                          </div>
                          <span className="dvs-bar-val">{d.availableCandidates.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="dvs-gap-container">
                        <span className={`dvs-gap-badge ${d.gap >= 0 ? 'dvs-gap-positive' : 'dvs-gap-negative'}`}>
                          {d.gap > 0 ? `+${d.gap} gap` : d.gap === 0 ? 'Balanced' : `${d.gap} surplus`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Trades / Skills Section */}
          {data.byTrade?.length > 0 && (
            <div className="card">
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                🔧 Top Skills in District
              </h2>
              <div className="skills-grid">
                {data.byTrade.map((t) => {
                  const formattedTrade = formatLabel(t.trade);
                  const maxVal = data.byTrade[0]?.count || 1;
                  const pct = Math.round((t.count / maxVal) * 100);
                  return (
                    <div key={t.trade} className="skill-row">
                      <span className="skill-name" title={formattedTrade}>{formattedTrade}</span>
                      <div className="skill-track">
                        <div className="skill-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="skill-count">{t.count.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '24px 0' }}>No data available for this district.</p>
      )}
    </div>
  );
}
