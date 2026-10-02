/* ToastContext.jsx: Global toast notification system for SIH26097 PM-AJAY */
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="alert">
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
              {icons[t.type] || icons.info}
            </span>
            <span className="flex-1 text-sm">{t.message}</span>
            <button
              className="btn-ghost btn-sm btn-icon"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              style={{ minWidth: 28, minHeight: 28 }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.addToast;
}
