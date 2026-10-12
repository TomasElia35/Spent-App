import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/40 shadow-sm shadow-emerald-600/20',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500/40 shadow-sm',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/40 shadow-sm',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-400/30 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
  ghost:
    'text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400/30 dark:text-slate-300 dark:hover:bg-slate-800',
  'soft-danger':
    'bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20',
};

const SIZES = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  icon: 'h-9 w-9 justify-center',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
