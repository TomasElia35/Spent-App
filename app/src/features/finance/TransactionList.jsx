import { ArrowDownRight, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDateShort } from '../../lib/format.js';

export default function TransactionList({ items, editingId, onEdit, onDelete }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {items.map((t) => {
        const income = t.type === 'income';
        const isEditing = editingId === t.id;
        return (
          <li
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3.5 transition-colors sm:items-center sm:px-5 ${
              isEditing ? 'bg-amber-50/70 dark:bg-amber-500/5' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
            }`}
          >
            <span
              className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:mt-0 ${
                income
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'
              }`}
            >
              {income ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 min-w-0 break-words text-sm font-medium sm:line-clamp-1 text-slate-800 dark:text-slate-100">{t.title}</p>
                <p
                  className={`shrink-0 text-sm font-semibold tabular-nums sm:hidden ${
                    income ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {income ? '+' : '-'}
                  {formatCurrency(t.amount)}
                </p>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                {formatDateShort(t.date)} · {t.category}
                {t.location ? ` · ${t.location}` : ''}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {t.paymentMethod}
                </span>
                {t.installments > 1 && (
                  <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    {t.installments} cuotas (Vto: {formatDateShort(t.expiration)})
                  </span>
                )}
                {t.obs && (
                  <span className="max-w-full truncate text-[11px] italic text-slate-400" title={t.obs}>
                    {t.obs}
                  </span>
                )}
                <div className="ml-auto sm:hidden">
                  <Actions t={t} onEdit={onEdit} onDelete={onDelete} />
                </div>
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-4 sm:flex">
              <p
                className={`hidden text-sm font-semibold tabular-nums sm:block ${
                  income ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {income ? '+' : '-'}
                {formatCurrency(t.amount)}
              </p>
              <Actions t={t} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Actions({ t, onEdit, onDelete }) {
  return (
  <div className="flex gap-1">
    <button
      type="button"
      onClick={() => onEdit(t)}
      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-500/10"
      title="Editar"
      aria-label={`Editar ${t.title}`}
    >
      <Pencil className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={() => onDelete(t)}
      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
      title="Eliminar"
      aria-label={`Eliminar ${t.title}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  </div>
  );
}
