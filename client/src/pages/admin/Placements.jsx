/* admin/Placements.jsx: Kanban-style pipeline board
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonCard, EmptyState, SyntheticBadge } from '../../components.jsx';
import { getPlacements, patchPlacement } from '../../api.js';
import { useToast } from '../../ToastContext.jsx';

const COLUMNS = [
  { key: 'enrolled',  label: 'Enrolled',  icon: '📚', color: 'var(--color-info)' },
  { key: 'completed', label: 'Completed', icon: '🏅', color: 'var(--color-warning)' },
  { key: 'placed',    label: 'Placed',    icon: '✅', color: 'var(--color-success)' },
  { key: 'dropped',   label: 'Dropped',  icon: '⚠️', color: 'var(--color-danger)' },
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
  const date = new Date(placement.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="plm-card card">
      <div className="font-semibold text-sm">{user.name || 'Unknown'}</div>
      <div className="text-xs text-muted" style={{ fontWeight: 600 }}>
        {placement.courseTitle || placement.title || formatCourseTitle(placement.courseKey)}
      </div>
      {placement.employer && <div className="text-xs text-accent mt-1">🏢 {placement.employer}</div>}
      {placement.wage > 0 && <div className="text-xs text-success mt-1">₹{placement.wage.toLocaleString()}/mo</div>}
      {placement.user?.isSynthetic && <SyntheticBadge />}
      <div className="text-xs text-muted mt-2">{date}</div>
      <div className="flex gap-1 mt-2 flex-wrap">
        {COLUMNS.filter((c) => c.key !== placement.status).map((c) => (
          <button
            key={c.key}
            className="btn btn-sm btn-ghost"
            style={{ fontSize: '0.7rem', minHeight: 28, padding: '2px 6px' }}
            id={`btn-move-${placement._id}-${c.key}`}
            onClick={() => onMove(placement._id, c.key)}
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

  if (loading) return <SkeletonCard rows={5} />;

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('admin.placements')}</h1>
        <SyntheticBadge />
      </div>
      <p className="text-muted text-sm mb-6">Drag or use the arrow buttons to move candidates through the pipeline.</p>

      <div className="plm-board">
        {COLUMNS.map((col) => (
          <div key={col.key} className="plm-col">
            <div className="plm-col-header" style={{ borderColor: col.color }}>
              <span aria-hidden="true">{col.icon}</span>
              <span className="font-semibold">{col.label}</span>
              <span className="badge badge-muted">{byStatus(col.key).length}</span>
            </div>
            <div className="plm-col-body">
              {byStatus(col.key).length === 0 ? (
                <div className="text-center text-muted text-xs py-6">No records</div>
              ) : (
                byStatus(col.key).map((p) => (
                  <PlacementCard key={p._id} placement={p} onMove={handleMove} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .plm-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-4); min-height: 400px; }
        .plm-col { background: var(--surface-800); border-radius: var(--radius-lg); overflow: hidden; }
        .plm-col-header { display: flex; align-items: center; gap: var(--sp-2); padding: var(--sp-3) var(--sp-4); border-top: 3px solid; }
        .plm-col-body { padding: var(--sp-3); display: flex; flex-direction: column; gap: var(--sp-2); min-height: 200px; }
        .plm-card { padding: var(--sp-3) !important; cursor: default; }
        @media (max-width: 900px) { .plm-board { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .plm-board { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
