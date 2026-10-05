/* admin/Beneficiaries.jsx: List with filters, risk badges, assisted interview
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { SkeletonCard, EmptyState, RiskBadge, SyntheticBadge, Modal } from '../../components.jsx';
import { getOfficerBeneficiaries } from '../../api.js';
import Assistant from '../Assistant.jsx';
import './Beneficiaries.css';

export default function Beneficiaries() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [interviewUserId, setInterviewUserId] = useState(null);
  const [interviewName, setInterviewName] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    getOfficerBeneficiaries(user?.role === 'admin' && { district: undefined })
      .then((res) => setBeneficiaries(res.data.beneficiaries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const filtered = beneficiaries.filter(({ user: u, profile }) => {
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search) ||
      u.district?.toLowerCase().includes(search.toLowerCase());

    const riskScore = profile?.riskScore || 0;
    const matchRisk =
      riskFilter === 'all' ||
      (riskFilter === 'high'   && riskScore >= 60) ||
      (riskFilter === 'medium' && riskScore >= 30 && riskScore < 60) ||
      (riskFilter === 'low'    && riskScore < 30);

    return matchSearch && matchRisk;
  });

  return (
    <div className="ben-page-container page-enter">
      <div className="ben-header">
        <h1 className="ben-title">{t('admin.beneficiaries')}</h1>
        <SyntheticBadge />
      </div>

      {/* Filters */}
      <div className="ben-filters-bar">
        <div className="ben-search-wrapper">
          <input
            id="inp-beneficiary-search"
            className="input ben-search-input"
            placeholder="🔍 Search by name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ben-tab-group tab-group">
          {['all', 'high', 'medium', 'low'].map((f) => (
            <button
              key={f}
              className={`tab ben-filter-btn ${riskFilter === f ? 'active' : ''}`}
              onClick={() => setRiskFilter(f)}
              id={`ben-filter-${f}`}
            >
              {f === 'all' ? 'All' : f === 'high' ? '🔴 High' : f === 'medium' ? '🟡 Medium' : '🟢 Low'}
            </button>
          ))}
        </div>
      </div>

      <p className="ben-count-text">{filtered.length} beneficiaries shown</p>

      {loading ? (
        <div className="ben-cards-list">
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" title="No beneficiaries found" description="Adjust filters or add new beneficiaries." />
      ) : (
        <div className="ben-cards-list">
          {filtered.map(({ user: u, profile, placements }) => (
            <div key={u._id} className="ben-card card">
              {/* LEFT SECTION */}
              <div className="ben-card-left">
                <div className="ben-card-header-row">
                  <span className="ben-name">{u.name}</span>
                  {u.isSynthetic && <SyntheticBadge />}
                  {profile && <RiskBadge score={profile.riskScore} />}
                </div>
                <p className="ben-location-text">
                  📍 {u.district} · {u.phone || u.email || 'No contact'}
                </p>
                {profile?.skills?.length > 0 && (
                  <div className="ben-skills-list">
                    {profile.skills.slice(0, 3).map((s) => (
                      <span key={s} className="badge badge-muted text-xs ben-skill-tag">{s}</span>
                    ))}
                    {profile.skills.length > 3 && (
                      <span className="badge badge-muted text-xs ben-skill-tag">+{profile.skills.length - 3}</span>
                    )}
                  </div>
                )}
                {profile?.riskReasons?.length > 0 && (
                  <p className="ben-warning-text">
                    ⚠ {profile.riskReasons[0]}
                  </p>
                )}
              </div>

              {/* CENTER SECTION */}
              <div className="ben-card-center">
                <span className="ben-placements-count">
                  {placements?.length || 0} placement(s)
                </span>
              </div>

              {/* RIGHT SECTION */}
              <div className="ben-card-right">
                <button
                  id={`btn-interview-${u._id}`}
                  className="btn btn-accent ben-interview-btn"
                  onClick={() => {
                    setInterviewUserId(u._id);
                    setInterviewName(u.name);
                  }}
                >
                  🎙️ {t('admin.startInterview')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assisted interview modal */}
      <Modal
        open={!!interviewUserId}
        onClose={() => setInterviewUserId(null)}
        title={`Assisted Interview: ${interviewName}`}
        size="lg"
      >
        {interviewUserId && (
          <Assistant forUserId={interviewUserId} />
        )}
      </Modal>
    </div>
  );
}
