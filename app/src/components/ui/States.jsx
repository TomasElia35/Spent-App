import { AlertCircle, Loader2, RotateCw } from 'lucide-react';
import Button from './Button.jsx';

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-emerald-600 ${className}`} />;
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800 ${className}`} />;
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
      {Icon && (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
      {description && <p className="mt-1 max-w-xs text-xs text-slate-400">{description}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-10 text-center ${className}`}>
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
        <AlertCircle className="h-6 w-6" />
      </span>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No se pudieron cargar los datos</p>
      <p className="mt-1 max-w-xs text-xs text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          <RotateCw className="h-3.5 w-3.5" /> Reintentar
        </Button>
      )}
    </div>
  );
}
