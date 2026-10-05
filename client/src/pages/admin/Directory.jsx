/* admin/Directory.jsx: Centers, counselors, schemes directory with filters
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonCard, EmptyState, SyntheticBadge } from '../../components.jsx';
import { getDirectoryCenters, getDirectoryCounselors, getDirectorySchemes } from '../../api.js';
import './Directory.css';

const DISTRICTS = ['Warangal', 'Adilabad', 'Nalgonda'];

function CenterCard({ center }) {
  return (
    <div className="card dir-card">
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="font-semibold dir-card-title">{center.name}</h3>
        {center.isSynthetic && <SyntheticBadge />}
      </div>
      <p className="text-sm text-muted">📍 {center.district}, {center.state}</p>
      {center.contact && <p className="text-sm mt-1">📞 {center.contact}</p>}
      {center.trades?.length > 0 && (
        <div className="dir-skills-container">
          {center.trades.slice(0, 4).map((t) => (
            <span key={t} className="badge badge-muted dir-skill-badge">{t}</span>
          ))}
        </div>
      )}
      {center.nsqfLevels?.length > 0 && (
        <p className="text-xs text-muted mt-2">NSQF Levels: {center.nsqfLevels.join(', ')}</p>
      )}
      {center.schemes?.length > 0 && (
        <div className="dir-skills-container">
          {center.schemes.map((s) => <span key={s} className="badge badge-primary dir-skill-badge">{s}</span>)}
        </div>
      )}
      {center.source && (
        <a href={center.source} target="_blank" rel="noopener noreferrer" className="text-xs text-accent mt-2 block dir-link">
          🔗 Verified Source
        </a>
      )}
    </div>
  );
}

function CounselorCard({ counselor }) {
  return (
    <div className="card dir-card">
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="font-semibold dir-card-title">{counselor.name}</h3>
        <div className="flex gap-2 flex-wrap">
          {counselor.isSynthetic && <SyntheticBadge />}
          {counselor.verified && <span className="badge badge-success">✓ Verified</span>}
        </div>
      </div>
      <p className="text-sm text-muted">📍 {counselor.district}</p>
      {counselor.contact && <p className="text-sm mt-1">📞 {counselor.contact}</p>}
      {counselor.languages?.length > 0 && (
        <p className="text-sm mt-1">🗣 {counselor.languages.join(', ')}</p>
      )}
    </div>
  );
}

function SchemeCard({ scheme }) {
  return (
    <div className="card dir-card">
      <div className="flex items-start justify-between mb-2 gap-2">
        <h3 className="font-semibold dir-card-title">{scheme.name}</h3>
        <span className="badge badge-primary dir-skill-badge">{scheme.type}</span>
      </div>
      <p className="text-sm text-muted dir-word-break">{scheme.eligibilitySummary}</p>
      {scheme.benefit && <p className="text-sm text-accent mt-2 dir-word-break">💰 {scheme.benefit}</p>}
      {scheme.link && (
        <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm mt-3 inline-flex">
          Apply on Portal →
        </a>
      )}
      {scheme.source && <p className="text-xs text-muted mt-1 dir-word-break">Source: {scheme.source}</p>}
    </div>
  );
}

const TABS = [
  { key: 'centers',    label: '🏫 Training Centers' },
  { key: 'counselors', label: '👩‍💼 Counselors' },
  { key: 'schemes',    label: '🎯 Schemes' },
];

export default function Directory() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('centers');
  const [district, setDistrict] = useState('');
  const [data, setData] = useState({ centers: [], counselors: [], schemes: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = district ? { district } : {};
    Promise.all([
      getDirectoryCenters(params),
      getDirectoryCounselors(params),
      getDirectorySchemes(params),
    ])
      .then(([cRes, coRes, sRes]) => {
        setData({
          centers: cRes.data.centers || [],
          counselors: coRes.data.counselors || [],
          schemes: sRes.data.schemes || [],
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [district]);

  const items = data[tab] || [];

  return (
    <div className="dir-page-container page-enter">
      <div className="dir-header">
        <h1 className="dir-title">{t('admin.directory')}</h1>
        <select
          id="sel-directory-district"
          className="input select dir-district-select"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">All Districts</option>
          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Tab selector */}
      <div className="tab-group dir-tab-group mb-6">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`tab ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
            id={`dir-tab-${key}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="dir-grid">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} rows={3} />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="📚"
          title={`No ${tab} found`}
          description={`No ${tab} available for the selected filters.`}
        />
      ) : (
        <div className="dir-grid">
          {items.map((item) => (
            tab === 'centers' ? <CenterCard key={item._id} center={item} /> :
            tab === 'counselors' ? <CounselorCard key={item._id} counselor={item} /> :
            <SchemeCard key={item._id} scheme={item} />
          ))}
        </div>
      )}
    </div>
  );
}
