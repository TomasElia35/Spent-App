import { useMemo } from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { formatCurrency } from '../../lib/format.js';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { EmptyState, Skeleton } from '../../components/ui/States.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#f43f5e', '#14b8a6', '#6366f1', '#84cc16', '#ec4899', '#64748b'];

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="font-medium text-slate-700 dark:text-slate-200">{p.payload.name}</p>
      <p className="tabular-nums text-slate-500 dark:text-slate-400">{formatCurrency(p.value)}</p>
    </div>
  );
}

export default function FinanceCharts({ items, loading, monthText }) {
  const { theme } = useTheme();
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  const { byCategory, totals, totalExpense } = useMemo(() => {
    const map = new Map();
    let income = 0;
    let expense = 0;
    items.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else {
        expense += t.amount;
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      }
    });
    const sorted = [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    // Agrupar categorías chicas en "Otras" para que el gráfico se lea bien.
    let byCat = sorted;
    if (sorted.length > 8) {
      const rest = sorted.slice(7).reduce((acc, x) => acc + x.value, 0);
      byCat = [...sorted.slice(0, 7), { name: 'Otras', value: rest }];
    }
    return {
      byCategory: byCat,
      totals: [
        { name: 'Ingresos', value: income, fill: '#10b981' },
        { name: 'Gastos', value: expense, fill: '#f43f5e' },
      ],
      totalExpense: expense,
    };
  }, [items]);

  return (
    <Card>
      <CardHeader title="Resumen" subtitle={monthText} icon={PieIcon} />
      {loading ? (
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={PieIcon} title="Sin datos para graficar" description="Registrá movimientos para ver el resumen del mes." />
      ) : (
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Gastos por categoría
            </p>
            {byCategory.length === 0 ? (
              <EmptyState title="No hay gastos este mes" className="py-16" />
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row md:flex-col 2xl:flex-row">
                <div className="relative h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byCategory}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="62%"
                        outerRadius="100%"
                        paddingAngle={2}
                        stroke="none"
                      >
                        {byCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase tracking-wide text-slate-400">Total</span>
                    <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-200">
                      {formatCurrency(totalExpense)}
                    </span>
                  </div>
                </div>
                <ul className="w-full space-y-1.5 text-sm">
                  {byCategory.map((c, i) => (
                    <li key={c.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="flex-1 truncate text-slate-600 dark:text-slate-300">{c.name}</span>
                      <span className="text-xs tabular-nums text-slate-400">
                        {totalExpense ? Math.round((c.value / totalExpense) * 100) : 0}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Ingresos vs. gastos
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totals} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={(v) =>
                      new Intl.NumberFormat('es-AR', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
                    }
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={72}>
                    {totals.map((t) => (
                      <Cell key={t.name} fill={t.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
