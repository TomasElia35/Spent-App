import { Clock, Pencil, StickyNote, Trash2 } from 'lucide-react';

export default function AgendaItemCard({ item, onEdit, onDelete, active, compact = false }) {
  return (
    <div
      className={`group relative rounded-xl border p-2.5 text-sm transition-colors ${
        active
          ? 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10'
          : 'border-emerald-200/70 bg-emerald-50/70 hover:bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10'
      }`}
    >
      <div className={compact ? '' : 'flex items-start justify-between gap-3'}>
        <div className="min-w-0">
          <p className={`font-semibold leading-tight text-slate-800 dark:text-slate-100 ${compact ? 'break-words text-[13px]' : ''}`}>
            {item.title}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
            <Clock className="h-3 w-3" />
            {item.start} - {item.end}
          </p>
          {item.notes && (
            <p
              className={`mt-1 flex items-start gap-1 text-xs text-slate-500 dark:text-slate-400 ${compact ? '' : 'whitespace-pre-line'}`}
              title={item.notes}
            >
              <StickyNote className="mt-0.5 h-3 w-3 shrink-0" />
              <span className={compact ? 'line-clamp-2' : ''}>{item.notes}</span>
            </p>
          )}
        </div>
        <div className={`flex gap-0.5 ${compact ? 'mt-1.5 justify-end' : 'shrink-0'}`}>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-sky-600 dark:hover:bg-slate-800"
            aria-label={`Editar ${item.title}`}
            title="Editar"
          >
            <Pencil className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600 dark:hover:bg-slate-800"
            aria-label={`Eliminar ${item.title}`}
            title="Eliminar"
          >
            <Trash2 className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          </button>
        </div>
      </div>
    </div>
  );
}
