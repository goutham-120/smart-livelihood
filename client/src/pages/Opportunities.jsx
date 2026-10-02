/* Opportunities.jsx: Scored livelihood and training opportunities list
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonCard, EmptyState, SyntheticBadge, ReadAloudButton } from '../components.jsx';
import { getOpportunities, getSelfEmployment } from '../api.js';
import { useLang } from '../lang.js';
import './Opportunities.css';

function MatchMeter({ score }) {
  const color = score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';
  return (
    <div className="match-meter">
      <div className="match-meter-fill" style={{ width: `${score}%`, background: color }} />
      <span className="match-meter-label" style={{ color }}>{score}%</span>
    </div>
  );
}

function OpportunityCard({ opp, onViewSelfEmp }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="opp-card card">
      <div className="opp-card-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">{opp.title}</h3>
            <span className={`badge ${opp.track === 'self' ? 'badge-warning' : 'badge-info'}`}>
              {opp.track === 'self' ? t('opportunities.selfEmp') : t('opportunities.wageEmp')}
            </span>
          </div>
          <p className="text-xs text-muted">{opp.sector} · NSQF Level {opp.nsqfLevel} · NCO {opp.ncoCode}</p>
        </div>
        <div className="text-center" style={{ flexShrink: 0 }}>
          <MatchMeter score={opp.matchScore} />
          <span className="text-xs text-muted">{t('opportunities.matchScore')}</span>
        </div>
      </div>

      {/* Income and demand */}
      <div className="flex flex-wrap gap-3 mt-3">
        <div className="opp-stat">
          <span>💰</span>
          <span>₹{(opp.incomeRange?.min || 0).toLocaleString()} to ₹{(opp.incomeRange?.max || 0).toLocaleString()}/mo</span>
        </div>
        <div className="opp-stat">
          <span>📊</span>
          <span>{t('opportunities.demandLevel')}: {opp.demand?.level}/5 ({opp.demand?.openings} openings)</span>
        </div>
        <div className="opp-stat">
          <span>👥</span>
          <span>Avg ₹{(opp.demand?.avgIncome || 0).toLocaleString()}/mo</span>
        </div>
      </div>

      {/* Scheme and center count */}
      <div className="flex gap-3 mt-2 flex-wrap">
        {opp.centers?.length > 0 && (
          <span className="badge badge-muted">🏫 {opp.centers.length} {t('opportunities.centers')}</span>
        )}
        {opp.schemes?.length > 0 && (
          <span className="badge badge-success">🎯 {opp.schemes.length} {t('opportunities.schemes')}</span>
        )}
      </div>

      {/* Breakdown toggle */}
      <button
        className="btn btn-ghost btn-sm mt-3"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        id={`opp-expand-${opp.occupationKey}`}
      >
        {expanded ? '▲ Less' : '▼ Score Breakdown'}
      </button>

      {expanded && (
        <div className="opp-breakdown mt-3">
          {(opp.breakdown || []).map((b) => (
            <div key={b.factor} className="breakdown-row">
              <div className="flex justify-between text-xs mb-1">
                <span>{b.factor} <span className="text-muted">({b.weight})</span></span>
                <span className="font-semibold">{b.score}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${b.score}%` }} />
              </div>
              <p className="text-xs text-muted mt-1">{b.note}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        {opp.track === 'self' && (
          <button
            id={`btn-selfemp-${opp.occupationKey}`}
            className="btn btn-accent btn-sm"
            onClick={() => onViewSelfEmp(opp.occupationKey)}
          >
            🏪 {t('opportunities.viewPlan')}
          </button>
        )}
        {opp.source && (
          <a
            href={opp.source}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
          >
            🔗 Source
          </a>
        )}
      </div>
    </div>
  );
}

function SelfEmpModal({ occupationKey, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSelfEmployment(occupationKey)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [occupationKey]);

  return (
    <div className="selfemp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card selfemp-modal-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🏪 Business Plan: {data?.title || '...'}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} id="btn-close-selfemp">×</button>
        </div>
        {loading ? (
          <SkeletonCard rows={4} />
        ) : data ? (
          <>
            <p className="text-sm text-muted mb-4">{data.businessPlan?.summary}</p>
            <div className="opp-stat mb-3">
              <span>💸</span>
              <span>Startup cost: ₹{(data.startupCostInr || 0).toLocaleString()}</span>
            </div>
            <div className="opp-stat mb-4">
              <span>⏱</span>
              <span>Break-even in {data.businessPlan?.breakevenMonths} months</span>
            </div>
            <h3 className="font-semibold mb-2">Key Steps</h3>
            <ol className="flex-col gap-2 flex" style={{ paddingLeft: 'var(--sp-4)' }}>
              {(data.businessPlan?.keySteps || []).map((s, i) => (
                <li key={i} className="text-sm" style={{ listStyle: 'decimal' }}>{s}</li>
              ))}
            </ol>
            {data.schemes?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Available Schemes</h3>
                {data.schemes.map((s) => (
                  <div key={s._id} className="card mb-2" style={{ padding: 'var(--sp-3)' }}>
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{s.name}</span>
                      <span className="badge badge-primary">{s.type}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">{s.eligibilitySummary}</p>
                    {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent mt-1 block">Apply →</a>}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function Opportunities() {
  const { t } = useTranslation();
  const { lang } = useLang();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selfEmpKey, setSelfEmpKey] = useState(null);

  useEffect(() => {
    getOpportunities()
      .then((res) => setOpportunities(res.data.opportunities || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = opportunities.filter((o) => {
    if (filter === 'self') return o.track === 'self';
    if (filter === 'wage') return o.track === 'wage';
    return true;
  });

  if (loading) {
    return (
      <div>
        <SkeletonCard rows={4} />
        <SkeletonCard rows={4} />
        <SkeletonCard rows={4} />
      </div>
    );
  }

  return (
    <div className="opp-root page-enter">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{t('opportunities.title')}</h1>
        <ReadAloudButton lang={lang} />
      </div>
      <p className="text-muted text-sm mb-6">
        Opportunities are ranked by skill match, local demand, and your preferences.
      </p>

      {/* Filter tabs */}
      <div className="tab-group mb-6" style={{ maxWidth: 360 }}>
        {['all', 'wage', 'self'].map((f) => (
          <button
            key={f}
            className={`tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
            id={`opp-filter-${f}`}
          >
            {f === 'all' ? '🌐 All' : f === 'wage' ? '💼 Wage' : '🏪 Self'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No results" description={t('opportunities.noResults')} />
      ) : (
        <div className="flex-col gap-4 flex">
          {filtered.map((opp) => (
            <OpportunityCard key={opp.occupationKey} opp={opp} onViewSelfEmp={setSelfEmpKey} />
          ))}
        </div>
      )}

      {selfEmpKey && (
        <SelfEmpModal occupationKey={selfEmpKey} onClose={() => setSelfEmpKey(null)} />
      )}
    </div>
  );
}
