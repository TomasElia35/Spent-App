import { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { FileSpreadsheet, ListFilter, Plus, Receipt, Search, X } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAsync, useIsDesktop } from '../../lib/hooks.js';
import { currentMonthStr, formatCurrency, monthLabel } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { useConfirm } from '../../components/ui/ConfirmDialog.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { Field, Input, Select } from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { EmptyState, ErrorState, ListSkeleton, Skeleton } from '../../components/ui/States.jsx';
import { useConfigLists } from '../config/useConfigLists.js';
import TransactionForm from './TransactionForm.jsx';
import TransactionList from './TransactionList.jsx';
import SummaryCards from './SummaryCards.jsx';
import { exportTransactionsCsv } from './exportCsv.js';

// recharts es pesado: se carga bajo demanda en un chunk separado.
const FinanceCharts = lazy(() => import('./FinanceCharts.jsx'));

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export default function FinancePage() {
  const toast = useToast();
  const confirm = useConfirm();
  const isDesktop = useIsDesktop();

  const [month, setMonth] = useState(currentMonthStr());
  const [category, setCategory] = useState('ALL');
  const [payment, setPayment] = useState('ALL');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const config = useConfigLists();
  const categoryNames = useMemo(() => config.categories.map((c) => c.name), [config.categories]);
  const paymentNames = useMemo(() => config.paymentMethods.map((p) => p.name), [config.paymentMethods]);

  const { data, loading, error, reload } = useAsync(
    () => api.get('/transactions', { month, category, payment }),
    [month, category, payment],
  );
  const items = useMemo(() => data?.items ?? [], [data]);
  const initialBalance = data?.initialBalance ?? 0;

  const visible = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return items;
    return items.filter((t) =>
      [t.title, t.category, t.paymentMethod, t.location, t.obs].some((f) => normalize(f).includes(term)),
    );
  }, [items, search]);

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    items.forEach((t) => (t.type === 'income' ? (income += t.amount) : (expense += t.amount)));
    return { income, expense };
  }, [items]);

  const visibleNet = useMemo(
    () => visible.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0),
    [visible],
  );

  const openNew = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const handleEdit = (tx) => {
    setEditing(tx);
    if (isDesktop) window.scrollTo({ top: 0, behavior: 'smooth' });
    else setSheetOpen(true);
  };

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setSheetOpen(false);
  }, []);

  const handleSaved = (tx, isEdit) => {
    if (isEdit) setEditing(null);
    if (isEdit || !isDesktop) setSheetOpen(false);
    const txMonth = tx.date.substring(0, 7);
    if (txMonth !== month) setMonth(txMonth); // dispara recarga
    else reload({ silent: true });
  };

  const handleDelete = async (tx) => {
    const ok = await confirm({
      title: 'Eliminar movimiento',
      message: `¿Estás seguro de eliminar "${tx.title}" (${formatCurrency(tx.amount)})?`,
      confirmText: 'Eliminar',
    });
    if (!ok) return;
    try {
      await api.del(`/transactions/${tx.id}`);
      if (editing?.id === tx.id) cancelEdit();
      toast.success('Movimiento eliminado');
      reload({ silent: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleExport = () => {
    if (visible.length === 0) {
      toast.error('No hay datos para exportar con los filtros actuales');
      return;
    }
    exportTransactionsCsv(visible, month);
  };

  const filtersActive = category !== 'ALL' || payment !== 'ALL' || search;

  const form = (
    <TransactionForm
      categories={categoryNames}
      paymentMethods={paymentNames}
      editing={editing}
      onSaved={handleSaved}
      onCancel={cancelEdit}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Finanzas</h1>
          <p className="text-sm cap-first text-slate-500 dark:text-slate-400">{monthLabel(month)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna de formulario (solo desktop) */}
        {isDesktop && (
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-8">
              <CardHeader
                title={editing ? 'Editar movimiento' : 'Registrar movimiento'}
                icon={editing ? Receipt : Plus}
                actions={
                  editing && (
                    <button type="button" onClick={cancelEdit} className="text-xs font-medium text-rose-500 hover:text-rose-700">
                      Cancelar edición
                    </button>
                  )
                }
              />
              <div className="p-5">{form}</div>
            </Card>
          </div>
        )}

        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* Filtros */}
          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <ListFilter className="h-4 w-4 text-emerald-600" /> Panel de reporte
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Mes" htmlFor="f-month" className="col-span-2 sm:col-span-1">
                <Input
                  id="f-month"
                  type="month"
                  className="input-sm"
                  value={month}
                  onChange={(e) => e.target.value && setMonth(e.target.value)}
                />
              </Field>
              <Field label="Categoría" htmlFor="f-cat">
                <Select id="f-cat" className="input-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="ALL">Todas</option>
                  {categoryNames.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Pago" htmlFor="f-pay">
                <Select id="f-pay" className="input-sm" value={payment} onChange={(e) => setPayment(e.target.value)}>
                  <option value="ALL">Todos</option>
                  {paymentNames.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <SummaryCards initial={initialBalance} income={totals.income} expense={totals.expense} loading={loading && !data} />

          {/* Movimientos */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Movimientos del mes"
              subtitle={
                data ? `${visible.length} movimiento${visible.length === 1 ? '' : 's'}${search ? ` · neto ${formatCurrency(visibleNet)}` : ''}` : undefined
              }
              icon={Receipt}
              actions={
                <Button variant="secondary" size="sm" onClick={handleExport}>
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  Exportar Excel
                </Button>
              }
            />
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  className="input input-sm pl-9 pr-9"
                  placeholder="Buscar por título, categoría, lugar…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Buscar movimientos"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="scrollbar-thin max-h-[560px] overflow-y-auto">
              {loading && !data ? (
                <ListSkeleton rows={5} />
              ) : error ? (
                <ErrorState message={error} onRetry={() => reload()} />
              ) : visible.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="Sin movimientos"
                  description={
                    filtersActive
                      ? 'No hay movimientos registrados para los filtros seleccionados.'
                      : 'Todavía no registraste movimientos en este mes.'
                  }
                />
              ) : (
                <div className={loading ? 'opacity-60 transition-opacity' : ''}>
                  <TransactionList items={visible} editingId={editing?.id} onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              )}
            </div>
          </Card>

          <Suspense fallback={<Skeleton className="h-72 rounded-2xl" />}>
            <FinanceCharts items={items} loading={loading && !data} monthText={monthLabel(month)} />
          </Suspense>
        </div>
      </div>

      {/* Mobile: FAB + bottom sheet */}
      {!isDesktop && (
        <>
          <button
            type="button"
            onClick={openNew}
            className="fab-pos fixed right-4 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 active:scale-95"
            aria-label="Nuevo movimiento"
          >
            <Plus className="h-6 w-6" />
          </button>
          <Modal
            open={sheetOpen}
            onClose={cancelEdit}
            title={editing ? 'Editar movimiento' : 'Nuevo movimiento'}
          >
            {form}
          </Modal>
        </>
      )}
    </div>
  );
}
