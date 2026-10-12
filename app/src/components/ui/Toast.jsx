import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' },
  error: { icon: XCircle, cls: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400' },
  info: { icon: Info, cls: 'text-sky-600 bg-sky-50 dark:bg-sky-500/10 dark:text-sky-400' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const show = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = ++idRef.current;
      setToasts((t) => [...t.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (m) => show(m, 'success'),
      error: (m) => show(m, 'error', 5000),
      info: (m) => show(m, 'info'),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:pr-6">
          {toasts.map((t) => {
            const { icon: Icon, cls } = STYLES[t.type] || STYLES.info;
            return (
              <div
                key={t.id}
                role="status"
                className="pointer-events-auto flex w-full max-w-sm animate-scale-in items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cls}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="flex-1 pt-1.5 text-sm text-slate-700 dark:text-slate-200">{t.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
