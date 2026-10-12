import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Trash2 } from 'lucide-react';
import { api } from '../../api/client.js';
import { formatDateTime } from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { useConfirm } from '../../components/ui/ConfirmDialog.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { EmptyState, ErrorState, ListSkeleton } from '../../components/ui/States.jsx';

const PAGE = 50;

const ACTIONS = {
  CREATE: { label: 'Creación', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  UPDATE: { label: 'Edición', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  DELETE: { label: 'Eliminación', cls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' },
};

const MODULES = {
  Finanzas: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  Agenda: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
};

const ActionBadge = ({ action }) => {
  const a = ACTIONS[action] || { label: action, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${a.cls}`}>{a.label}</span>;
};

const ModuleBadge = ({ module }) => (
  <span
    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
      MODULES[module] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
    }`}
  >
    {module}
  </span>
);

export default function AuditPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/audit', { limit: PAGE, offset: 0 });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await api.get('/audit', { limit: PAGE, offset: items.length });
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...res.items.filter((r) => !seen.has(r.id))];
      });
      setTotal(res.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const clear = async () => {
    const ok = await confirm({
      title: 'Limpiar historial',
      message: '¿Estás seguro de eliminar todo el historial de auditoría? Esta acción no se puede deshacer.',
      confirmText: 'Limpiar',
    });
    if (!ok) return;
    setClearing(true);
    try {
      await api.del('/audit');
      setItems([]);
      setTotal(0);
      toast.success('Historial limpiado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Auditoría</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Registro de todas las altas, ediciones y bajas.</p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader
          title="Historial de auditoría"
          subtitle={loading ? undefined : `${total} registro${total === 1 ? '' : 's'}`}
          icon={ClipboardList}
          actions={
            <Button variant="soft-danger" size="sm" onClick={clear} loading={clearing} disabled={!items.length}>
              {!clearing && <Trash2 className="h-3.5 w-3.5" />}
              Limpiar historial
            </Button>
          }
        />

        {loading ? (
          <ListSkeleton rows={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No hay registros de auditoría disponibles." />
        ) : (
          <>
            {/* Desktop: tabla */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">Fecha / Hora</th>
                    <th className="px-5 py-3 font-medium">Módulo</th>
                    <th className="px-5 py-3 font-medium">Acción</th>
                    <th className="px-5 py-3 font-medium">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="whitespace-nowrap px-5 py-3 tabular-nums text-slate-500 dark:text-slate-400">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <ModuleBadge module={log.module} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-200">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: tarjetas */}
            <ul className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
              {items.map((log) => (
                <li key={log.id} className="space-y-1.5 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <ModuleBadge module={log.module} />
                      <ActionBadge action={log.action} />
                    </div>
                    <span className="text-[11px] tabular-nums text-slate-400">{formatDateTime(log.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{log.details}</p>
                </li>
              ))}
            </ul>

            {items.length < total && (
              <div className="border-t border-slate-100 p-4 text-center dark:border-slate-800">
                <Button variant="secondary" size="sm" onClick={loadMore} loading={loadingMore}>
                  Cargar más ({total - items.length} restantes)
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
