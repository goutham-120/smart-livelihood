/* admin/Coordination.jsx: Cross-org task board with comments
   SIH26097 PM-AJAY Livelihood Assistant */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../AuthContext.jsx';
import { SkeletonCard, EmptyState, Modal, ConfirmDialog } from '../../components.jsx';
import {
  getTasks,
  postTask,
  patchTask,
  deleteTask,
  postTaskComment,
  patchTaskComment,
  deleteTaskComment
} from '../../api.js';
import { useToast } from '../../ToastContext.jsx';
import { Trash2, Edit3 } from 'lucide-react';
import './Coordination.css';

const STATUS_COLORS = {
  open: 'var(--color-info)',
  in_progress: 'var(--color-warning)',
  done: 'var(--color-success)',
};

function TaskCard({ task, onStatusChange, onOpen, onDeleteRequest }) {
  const dateLabel = task.dueAt ? new Date(task.dueAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
  const isOverdue = task.dueAt && new Date(task.dueAt) < new Date() && task.status !== 'done';
  const commentCount = task.comments?.length || 0;

  return (
    <div
      className="card coord-card"
      style={{ borderLeft: `3px solid ${STATUS_COLORS[task.status] || 'var(--color-info)'}`, cursor: 'pointer', position: 'relative' }}
      onClick={() => onOpen(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(task)}
      id={`task-card-${task._id}`}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-sm" style={{ margin: 0, wordBreak: 'break-word', flex: 1 }}>{task.title}</h3>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <select
            className="input select"
            style={{ width: 120, minHeight: 32, fontSize: '0.75rem', padding: '4px 8px', flexShrink: 0 }}
            value={task.status}
            id={`sel-task-status-${task._id}`}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button
            type="button"
            className="btn btn-sm btn-ghost text-danger"
            style={{ padding: '4px 8px', minHeight: 32, color: '#dc2626' }}
            title="Delete Task"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(task);
            }}
            id={`btn-delete-task-${task._id}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="text-xs text-muted mt-1">🏢 {task.assignedOrg} · 📍 {task.district}</p>
      {dateLabel && (
        <p className={`text-xs mt-1 ${isOverdue ? 'text-danger' : 'text-muted'}`}>
          {isOverdue ? '⚠ OVERDUE: ' : '📅 '}{dateLabel}
        </p>
      )}
      <p className="text-xs text-muted mt-2">💬 {commentCount} comment(s)</p>
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

  // Task deletion state
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [commentToDelete, setCommentToDelete] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      setTasks(res.data.tasks || []);
    } catch {
      toast('Failed to load coordination tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Change Task Status
  const handleStatusChange = async (id, status) => {
    try {
      const res = await patchTask(id, { status });
      const updated = res.data.task;
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      if (selectedTask?._id === id) {
        setSelectedTask(updated);
      }
    } catch {
      toast(t('common.error'), 'error');
    }
  };

  // Delete Task Confirm
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete._id);
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      if (selectedTask?._id === taskToDelete._id) {
        setSelectedTask(null);
      }
      toast(`Task "${taskToDelete.title}" deleted`, 'success');
      setTaskToDelete(null);
    } catch {
      toast('Failed to delete task', 'error');
    }
  };

  // Add Comment
  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTask) return;
    setCommentLoading(true);
    try {
      const res = await postTaskComment(selectedTask._id, commentText);
      const updated = res.data.task;
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setSelectedTask(updated);
      setCommentText('');
      toast('Comment added', 'success');
    } catch {
      toast('Failed to add comment', 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  // Save Edited Comment
  const handleSaveEditedComment = async (commentId) => {
    if (!editingText.trim() || !selectedTask) return;
    try {
      const res = await patchTaskComment(selectedTask._id, commentId, editingText);
      const updated = res.data.task;
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setSelectedTask(updated);
      setEditingCommentId(null);
      setEditingText('');
      toast('Comment updated', 'success');
    } catch {
      toast('Failed to update comment', 'error');
    }
  };

  // Delete Comment Confirm
  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete || !selectedTask) return;
    try {
      const res = await deleteTaskComment(selectedTask._id, commentToDelete._id);
      const updated = res.data.task;
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setSelectedTask(updated);
      setCommentToDelete(null);
      toast('Comment deleted', 'success');
    } catch {
      toast('Failed to delete comment', 'error');
    }
  };

  if (loading) {
    return (
      <div className="coord-page-container page-container page-enter">
        <SkeletonCard rows={4} />
      </div>
    );
  }

  return (
    <div className="coord-page-container page-container page-enter">
      <div className="coord-header flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="coord-title text-3xl font-bold">{t('admin.coordination')}</h1>
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
        <div className="coord-grid grid grid-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={handleStatusChange}
              onOpen={setSelectedTask}
              onDeleteRequest={setTaskToDelete}
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

      {/* Task detail modal with comments & actions */}
      <Modal open={!!selectedTask} title={selectedTask?.title || ''} onClose={() => setSelectedTask(null)}>
        {selectedTask && (
          <div>
            <div className="flex justify-between items-start mb-3 gap-2">
              <div>
                <p className="text-sm text-muted">
                  🏢 <strong>{selectedTask.assignedOrg}</strong> · 📍 <strong>{selectedTask.district}</strong>
                </p>
                {selectedTask.dueAt && (
                  <p className="text-xs text-muted mt-1">
                    📅 Due: {new Date(selectedTask.dueAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ borderColor: '#dc2626', color: '#dc2626', fontWeight: 600, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setTaskToDelete(selectedTask)}
              >
                <Trash2 size={13} /> Delete Task
              </button>
            </div>

            <div className="divider" style={{ margin: '12px 0' }} />
            <h3 className="font-semibold mb-3">Comments ({selectedTask.comments?.length || 0})</h3>

            <div className="flex-col gap-2 flex mb-4" style={{ maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
              {(selectedTask.comments || []).length === 0 && (
                <p className="text-muted text-sm" style={{ fontStyle: 'italic', padding: '12px 0' }}>No comments yet. Be the first to add a comment below.</p>
              )}
              {(selectedTask.comments || []).map((c) => {
                const commentId = c._id;
                const authorName = c.authorName || c.author?.name || 'Officer';
                const authorId = c.author?._id || c.author;
                const canModifyComment = user && (user.role === 'admin' || (authorId && authorId.toString() === user._id?.toString()));
                const isEditing = editingCommentId === commentId;

                return (
                  <div key={commentId || c.at} className="card" style={{ padding: '10px 14px', background: '#fff8f2', borderColor: 'var(--border-light, #e2d9cf)' }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--primary-800, #4F3728)' }}>
                        {authorName} · <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{c.at ? new Date(c.at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </span>

                      {canModifyComment && !isEditing && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            style={{ padding: '2px 6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            title="Edit Comment"
                            onClick={() => {
                              setEditingCommentId(commentId);
                              setEditingText(c.text);
                            }}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost text-danger"
                            style={{ padding: '2px 6px', fontSize: '11px', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            title="Delete Comment"
                            onClick={() => setCommentToDelete(c)}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="mt-2">
                        <textarea
                          className="input"
                          rows={2}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          style={{ width: '100%', fontSize: '13px', padding: '6px 10px', marginBottom: '6px' }}
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '11px', padding: '3px 10px' }}
                            onClick={() => setEditingCommentId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '11px', padding: '3px 10px' }}
                            onClick={() => handleSaveEditedComment(commentId)}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm mt-1" style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                        {c.text}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ADD COMMENT INPUT */}
            <div className="flex gap-2">
              <input
                id="inp-comment"
                className="input flex-1"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                disabled={commentLoading}
              />
              <button
                id="btn-add-comment"
                className="btn btn-primary"
                onClick={handleAddComment}
                disabled={commentLoading || !commentText.trim()}
              >
                {commentLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRMATION MODAL: DELETE TASK */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDeleteTask}
        title="Delete Coordination Task"
        message={`Are you sure you want to delete "${taskToDelete?.title || 'this task'}"? This action cannot be undone.`}
        danger={true}
      />

      {/* CONFIRMATION MODAL: DELETE COMMENT */}
      <ConfirmDialog
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onCancel={() => setCommentToDelete(null)}
        onConfirm={handleConfirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        danger={true}
      />
    </div>
  );
}
