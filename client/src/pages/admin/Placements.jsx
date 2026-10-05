/* admin/Placements.jsx: Kanban-style pipeline board
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonCard, EmptyState, SyntheticBadge } from '../../components.jsx';
import { getPlacements, patchPlacement } from '../../api.js';
import { useToast } from '../../ToastContext.jsx';
import './Placements.css';

const COLUMNS = [
  { key: 'enrolled',  label: 'Enrolled',  icon: '📚', color: 'var(--primary-600, #ca6603)' },
  { key: 'completed', label: 'Completed', icon: '🏅', color: '#b35a02' },
  { key: 'placed',    label: 'Placed',    icon: '✅', color: 'var(--status-success, #16a34a)' },
  { key: 'dropped',   label: 'Dropped',   icon: '⚠️', color: 'var(--status-danger, #dc2626)' },
];

const formatCourseTitle = (key) => {
  if (!key) return 'Certified Skilling Program';
  return key
    .replace(/^crs_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function PlacementCard({ placement, onMove }) {
  const user = placement.user || {};
  const date = placement.at || placement.createdAt ? new Date(placement.at || placement.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
  const formattedCourse = placement.courseTitle || placement.title || formatCourseTitle(placement.courseKey);

  return (
    <div className="plm-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main, #4F3728)', wordBreak: 'break-word' }}>
          {user.name || 'Unknown Candidate'}
        </div>
        {placement.user?.isSynthetic && <SyntheticBadge />}
      </div>

      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-600, #ca6603)', marginBottom: '6px', wordBreak: 'break-word' }}>
        {formattedCourse}
      </div>

      {placement.employer && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted, #6b5240)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          🏢 <strong>{placement.employer}</strong>
        </div>
      )}

      {placement.wage > 0 && (
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--status-success, #16a34a)', marginBottom: '4px' }}>
          ₹{placement.wage.toLocaleString()}/mo
        </div>
      )}

      {date && (
        <div style={{ fontSize: '11px', color: 'var(--text-subtle, #8c7360)', marginBottom: '10px' }}>
          📅 {date}
        </div>
      )}

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--border-light, #e1d7c8)' }}>
        {COLUMNS.filter((c) => c.key !== placement.status).map((c) => (
          <button
            key={c.key}
            type="button"
            className="plm-move-btn"
            id={`btn-move-${placement._id}-${c.key}`}
            onClick={() => onMove(placement._id, c.key)}
            title={`Move to ${c.label}`}
          >
            → {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Placements() {
  const { t } = useTranslation();
  const toast = useToast();
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlacements()
      .then((res) => setPlacements(res.data.placements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMove = async (id, newStatus) => {
    try {
      const res = await patchPlacement(id, { status: newStatus });
      setPlacements((prev) =>
        prev.map((p) => p._id === id ? res.data.placement : p)
      );
      toast(`Moved to ${newStatus}`, 'success');
    } catch {
      toast(t('common.error'), 'error');
    }
  };

  const byStatus = (status) => placements.filter((p) => p.status === status);

  if (loading) {
    return (
      <div className="plm-page page-enter">
        <div className="plm-header">
          <h1 className="plm-title">{t('admin.placements')}</h1>
        </div>
        <div className="plm-board" style={{ marginTop: '24px' }}>
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
          <SkeletonCard rows={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="plm-page page-enter">
      <div className="plm-header">
        <h1 className="plm-title">{t('admin.placements')}</h1>
        <SyntheticBadge />
      </div>
      <p className="plm-subtitle">Drag or use the arrow buttons to move candidates through the pipeline.</p>

      <div className="plm-board">
        {COLUMNS.map((col) => (
          <div key={col.key} className="plm-col">
            <div className="plm-col-header" style={{ '--col-color': col.color }}>
              <span className="plm-col-icon" aria-hidden="true">{col.icon}</span>
              <span className="plm-col-title">{col.label}</span>
              <span className="plm-col-count">{byStatus(col.key).length}</span>
            </div>
            <div className="plm-col-body">
              {byStatus(col.key).length === 0 ? (
                <div className="plm-empty-state">No candidates in this stage</div>
              ) : (
                byStatus(col.key).map((p) => (
                  <PlacementCard key={p._id} placement={p} onMove={handleMove} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
