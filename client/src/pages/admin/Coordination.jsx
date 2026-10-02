/* admin/Coordination.jsx: Cross-org task board with comments
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../AuthContext.jsx';
import { SkeletonCard, EmptyState, Modal } from '../../components.jsx';
import { getTasks, postTask, patchTask } from '../../api.js';
import { useToast } from '../../ToastContext.jsx';

const STATUS_COLORS = {
  open: 'var(--color-info)',
  in_progress: 'var(--color-warning)',
  done: 'var(--color-success)',
};

function TaskCard({ task, onStatusChange, onOpen }) {
  const dateLabel = task.dueAt ? new Date(task.dueAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
  const isOverdue = task.dueAt && new Date(task.dueAt) < new Date() && task.status !== 'done';

  return (
    <div
      className="card"
      style={{ borderLeft: `3px solid ${STATUS_COLORS[task.status] || 'var(--color-info)'}`, cursor: 'pointer' }}
      onClick={() => onOpen(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(task)}
      id={`task-card-${task._id}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-sm">{task.title}</h3>
        <select
          className="input select"
          style={{ width: 130, minHeight: 32, fontSize: '0.75rem', padding: '4px 8px' }}
          value={task.status}
          id={`sel-task-status-${task._id}`}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <p className="text-xs text-muted mt-1">🏢 {task.assignedOrg} · 📍 {task.district}</p>
      {dateLabel && (
        <p className={`text-xs mt-1 ${isOverdue ? 'text-danger' : 'text-muted'}`}>
          {isOverdue ? '⚠ OVERDUE: ' : '📅 '}{dateLabel}
        </p>
      )}
      <p className="text-xs text-muted mt-2">💬 {task.comments?.length || 0} comment(s)</p>
    </div>
  );
}

function NewTaskForm({ onSave, onCancel }) {
  const { user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    title: '',
    assignedOrg: 'department',
    district: user?.district || 'Warangal',
    dueAt: '',
    status: 'open',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await postTask(form);
      onSave(res.data.task);
    } catch {
      toast('Failed to create task', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-col gap-4 flex">
      <div className="form-group">
        <label className="label">Task Title</label>
        <input id="inp-task-title" className="input" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="label">Assigned Org</label>
        <select id="sel-task-org" className="input select" value={form.assignedOrg} onChange={(e) => setForm((f) => ({ ...f, assignedOrg: e.target.value }))}>
          <option value="corporation">Corporation</option>
          <option value="department">Department</option>
          <option value="ministry">Ministry</option>
          <option value="training_partner">Training Partner</option>
        </select>
      </div>
      <div className="form-group">
        <label className="label">District</label>
        <input id="inp-task-district" className="input" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="label">Due Date</label>
        <input id="inp-task-due" className="input" type="date" value={form.dueAt} onChange={(e) => setForm((f) => ({ ...f, dueAt: e.target.value }))} />
      </div>
      <div className="flex gap-3">
        <button id="btn-task-cancel" type="button" className="btn btn-secondary flex-1" onClick={onCancel}>Cancel</button>
        <button id="btn-task-save" type="submit" className="btn btn-primary flex-1">Create Task</button>
      </div>
    </form>
  );
}

export default function Coordination() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    getTasks()
      .then((res) => setTasks(res.data.tasks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await patchTask(id, { status });
      setTasks((prev) => prev.map((t) => t._id === id ? res.data.task : t));
    } catch {
      toast(t('common.error'), 'error');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedTask) return;
    try {
      const res = await patchTask(selectedTask._id, { comment });
      const updated = res.data.task;
      setTasks((prev) => prev.map((t) => t._id === updated._id ? updated : t));
      setSelectedTask(updated);
      setComment('');
    } catch {
      toast('Failed to add comment', 'error');
    }
  };

  if (loading) return <SkeletonCard rows={4} />;

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('admin.coordination')}</h1>
        <button id="btn-new-task" className="btn btn-primary" onClick={() => setShowNew(true)}>
          + New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="No coordination tasks"
          description="Create tasks and assign them to departments or training partners."
          action={<button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>Create First Task</button>}
        />
      ) : (
        <div className="grid grid-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onOpen={setSelectedTask}
            />
          ))}
        </div>
      )}

      {/* New task modal */}
      <Modal open={showNew} title="New Coordination Task" onClose={() => setShowNew(false)}>
        <NewTaskForm
          onSave={(task) => { setTasks((p) => [task, ...p]); setShowNew(false); toast('Task created', 'success'); }}
          onCancel={() => setShowNew(false)}
        />
      </Modal>

      {/* Task detail modal with comments */}
      <Modal open={!!selectedTask} title={selectedTask?.title || ''} onClose={() => setSelectedTask(null)}>
        {selectedTask && (
          <div>
            <p className="text-sm text-muted mb-3">
              🏢 {selectedTask.assignedOrg} · 📍 {selectedTask.district}
            </p>
            <div className="divider" />
            <h3 className="font-semibold mb-3">Comments ({selectedTask.comments?.length || 0})</h3>
            <div className="flex-col gap-2 flex mb-4" style={{ maxHeight: 200, overflowY: 'auto' }}>
              {(selectedTask.comments || []).length === 0 && (
                <p className="text-muted text-sm">No comments yet.</p>
              )}
              {(selectedTask.comments || []).map((c, i) => (
                <div key={i} className="card" style={{ padding: 'var(--sp-3)' }}>
                  <p className="text-xs text-muted">{c.author || 'Officer'} · {new Date(c.at).toLocaleDateString('en-IN')}</p>
                  <p className="text-sm mt-1">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id="inp-comment"
                className="input flex-1"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button id="btn-add-comment" className="btn btn-primary" onClick={handleAddComment}>
                Send
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
