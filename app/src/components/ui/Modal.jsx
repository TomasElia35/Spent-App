import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modal accesible. En mobile se muestra como bottom sheet; en desktop, centrado.
 */
export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = size === 'sm' ? 'sm:max-w-sm' : size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl animate-slide-up dark:bg-slate-900 sm:rounded-2xl sm:animate-scale-in ${width}`}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-200 dark:bg-slate-700 sm:hidden" />
        {title && (
          <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-3 sm:pt-5">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="scrollbar-thin overflow-y-auto px-5 pb-5 pt-2">{children}</div>
        {footer && <div className="pb-safe border-t border-slate-100 px-5 py-4 dark:border-slate-800">{footer}</div>}
        {!footer && <div className="pb-safe" />}
      </div>
    </div>,
    document.body,
  );
}
