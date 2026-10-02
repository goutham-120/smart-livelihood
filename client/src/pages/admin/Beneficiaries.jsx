/* admin/Beneficiaries.jsx: List with filters, risk badges, assisted interview
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { SkeletonCard, EmptyState, RiskBadge, SyntheticBadge, Modal } from '../../components.jsx';
import { getOfficerBeneficiaries } from '../../api.js';
import Assistant from '../Assistant.jsx';

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
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">{t('admin.beneficiaries')}</h1>
        <SyntheticBadge />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-6">
        <input
          id="inp-beneficiary-search"
          className="input"
          style={{ maxWidth: 280 }}
          placeholder="🔍 Search by name, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="tab-group" style={{ width: 'auto' }}>
          {['all', 'high', 'medium', 'low'].map((f) => (
            <button
              key={f}
              className={`tab ${riskFilter === f ? 'active' : ''}`}
              onClick={() => setRiskFilter(f)}
              id={`ben-filter-${f}`}
            >
              {f === 'all' ? 'All' : f === 'high' ? '🔴 High' : f === 'medium' ? '🟡 Medium' : '🟢 Low'}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted mb-4">{filtered.length} beneficiaries shown</p>

      {loading ? (
        <>
          <SkeletonCard rows={3} />
          <SkeletonCard rows={3} />
        </>
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" title="No beneficiaries found" description="Adjust filters or add new beneficiaries." />
      ) : (
        <div className="flex-col gap-3 flex">
          {filtered.map(({ user: u, profile, placements }) => (
            <div key={u._id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-base">{u.name}</span>
                  {u.isSynthetic && <SyntheticBadge />}
                  {profile && <RiskBadge score={profile.riskScore} />}
                </div>
                <p className="text-sm text-muted">
                  📍 {u.district} · {u.phone || u.email || 'No contact'}
                </p>
                {profile?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profile.skills.slice(0, 3).map((s) => (
                      <span key={s} className="badge badge-muted text-xs">{s}</span>
                    ))}
                    {profile.skills.length > 3 && (
                      <span className="badge badge-muted text-xs">+{profile.skills.length - 3}</span>
                    )}
                  </div>
                )}
                {profile?.riskReasons?.length > 0 && (
                  <p className="text-xs text-muted mt-1 italic">
                    ⚠ {profile.riskReasons[0]}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs text-muted self-center">
                  {placements?.length || 0} placement(s)
                </span>
                <button
                  id={`btn-interview-${u._id}`}
                  className="btn btn-accent btn-sm"
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
