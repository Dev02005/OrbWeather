import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastContext } from './toast-context';
import type { Toast, ToastType } from './toast-context';
import '../components/Toast.css';

const EXIT_ANIMATION_MS = 300;
const AUTO_DISMISS_MS = 4000;

const TOAST_ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  alert: AlertTriangle,
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Tracked so nothing fires after unmount.
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const defer = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, exiting: true } : t)));
    defer(() => setToasts(prev => prev.filter(t => t.id !== id)), EXIT_ANIMATION_MS);
  }, [defer]);

  const showToast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, title, message, type }]);
    defer(() => removeToast(id), AUTO_DISMISS_MS);
  }, [defer, removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Announced to screen readers as notifications arrive. */}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => {
          const Icon = TOAST_ICONS[toast.type];
          const urgent = toast.type === 'alert' || toast.type === 'error';
          return (
            <div
              key={toast.id}
              className={`toast ${toast.type} ${toast.exiting ? 'toast-exit' : ''}`}
              role={urgent ? 'alert' : 'status'}
            >
              <div className="toast-icon">
                <Icon size={24} aria-hidden="true" />
              </div>
              <div className="toast-content">
                <span className="toast-title">{toast.title}</span>
                <span className="toast-message">{toast.message}</span>
              </div>
              <button
                type="button"
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label={`Dismiss notification: ${toast.title}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
