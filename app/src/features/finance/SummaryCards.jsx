import { ArrowDownRight, ArrowUpRight, Landmark, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../lib/format.js';
import { Skeleton } from '../../components/ui/States.jsx';

export default function SummaryCards({ initial, income, expense, loading }) {
  const final = initial + income - expense;
  const cards = [
    {
      label: 'Saldo inicial',
      hint: 'Arrastre mes anterior',
      value: initial,
      icon: Landmark,
      tone: 'text-slate-800 dark:text-slate-100',
      iconCls: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    },
    {
      label: 'Ingresos',
      hint: 'Mes seleccionado',
      value: income,
      icon: ArrowUpRight,
      tone: 'text-emerald-600 dark:text-emerald-400',
      iconCls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    },
    {
      label: 'Gastos',
      hint: 'Mes seleccionado',
      value: expense,
      icon: ArrowDownRight,
      tone: 'text-rose-600 dark:text-rose-400',
      iconCls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    },
    {
      label: 'Saldo final',
      hint: 'Disponible',
      value: final,
      icon: PiggyBank,
      tone: final >= 0 ? 'text-teal-700 dark:text-teal-300' : 'text-rose-600 dark:text-rose-400',
      iconCls: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {cards.map(({ label, hint, value, icon: Icon, tone, iconCls, highlight }) => (
        <div
          key={label}
          className={`card p-4 ${highlight ? 'ring-1 ring-teal-500/20 dark:ring-teal-400/20' : ''}`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconCls}`}>
              <Icon className="h-4 w-4" />
            </span>
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-6 w-24" />
          ) : (
            <p className={`mt-1 break-all text-base font-semibold tabular-nums sm:text-lg ${tone}`}>{formatCurrency(value)}</p>
          )}
          <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>
        </div>
      ))}
    </div>
  );
}
