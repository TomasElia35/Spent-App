import { useCallback, useMemo, useState } from 'react';
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAsync, useIsDesktop } from '../../lib/hooks.js';
import {
  DAY_NAMES,
  addDays,
  formatDateShort,
  getMonday,
  longDayLabel,
  monthYearLabel,
  parseDateStr,
  timeToMins,
  toDateStr,
  todayStr,
} from '../../lib/format.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { useConfirm } from '../../components/ui/ConfirmDialog.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import AgendaForm from './AgendaForm.jsx';
import AgendaItemCard from './AgendaItemCard.jsx';

export default function AgendaPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const isDesktop = useIsDesktop();

  const [monday, setMonday] = useState(() => getMonday(new Date()));
  const [selected, setSelected] = useState(todayStr());
  const [editing, setEditing] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(monday, i);
        return { date: toDateStr(d), label: DAY_NAMES[i], dayNum: d.getDate(), month: d.getMonth() + 1 };
      }),
    [monday],
  );
  const from = days[0].date;
  const to = days[6].date;

  const { data, loading, error, reload } = useAsync(() => api.get('/agenda', { from, to }), [from, to]);
  const items = useMemo(() => data?.items ?? [], [data]);

  const byDay = useMemo(() => {
    const map = Object.fromEntries(days.map((d) => [d.date, []]));
    [...items]
      .sort((a, b) => timeToMins(a.start) - timeToMins(b.start))
      .forEach((it) => map[it.date]?.push(it));
    return map;
  }, [items, days]);

  const today = todayStr();

  const changeWeek = (offset) => {
    const next = addDays(monday, offset * 7);
    setMonday(next);
    // Mantener el mismo día de la semana seleccionado en mobile.
    const idx = days.findIndex((d) => d.date === selected);
    setSelected(toDateStr(addDays(next, idx >= 0 ? idx : 0)));
  };

  const goToday = () => {
    setMonday(getMonday(new Date()));
    setSelected(todayStr());
  };

  const handleEdit = (item) => {
    setEditing(item);
    if (isDesktop) window.scrollTo({ top: 0, behavior: 'smooth' });
    else setSheetOpen(true);
  };

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setSheetOpen(false);
  }, []);

  const handleSaved = (item, isEdit) => {
    if (isEdit) setEditing(null);
    if (isEdit || !isDesktop) setSheetOpen(false);
    const newMonday = getMonday(parseDateStr(item.date));
    setSelected(item.date);
    if (toDateStr(newMonday) !== from) setMonday(newMonday);
    else reload({ silent: true });
  };

  const handleDelete = async (item) => {
    const ok = await confirm({
      title: 'Eliminar compromiso',
      message: `¿Eliminar "${item.title}" del ${formatDateShort(item.date)} (${item.start}-${item.end})?`,
      confirmText: 'Eliminar',
    });
    if (!ok) return;
    try {
      await api.del(`/agenda/${item.id}`);
      if (editing?.id === item.id) cancelEdit();
      toast.success('Compromiso eliminado');
      reload({ silent: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const form = (
    <AgendaForm
      editing={editing}
      defaultDate={isDesktop ? undefined : selected}
      knownItems={items}
      onSaved={handleSaved}
      onCancel={cancelEdit}
    />
  );

  const weekNav = (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => changeWeek(-1)} aria-label="Semana anterior">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button variant="secondary" size="sm" onClick={goToday}>
        Hoy
      </Button>
      <Button variant="ghost" size="icon" onClick={() => changeWeek(1)} aria-label="Semana siguiente">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );

  const weekTitle = monthYearLabel(monday);
  const weekSubtitle = `Semana del ${formatDateShort(from)} al ${formatDateShort(to)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Agenda</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Organizá tus compromisos de la semana.</p>
      </div>

      {isDesktop ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <Card className="h-fit xl:sticky xl:top-8 xl:col-span-1">
            <CardHeader
              title={editing ? 'Editar compromiso' : 'Nuevo compromiso'}
              icon={CalendarPlus}
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

          <Card className="min-w-0 xl:col-span-3">
            <CardHeader
              title={<span className="cap-first">{weekTitle}</span>}
              subtitle={weekSubtitle}
              icon={CalendarDays}
              actions={weekNav}
            />
            <div className="p-4">
              {error ? (
                <ErrorState message={error} onRetry={() => reload()} />
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {days.map((d) => {
                    const isToday = d.date === today;
                    return (
                      <div key={d.date} className="flex min-w-0 flex-col">
                        <div
                          className={`mb-2 rounded-xl py-2 text-center ${
                            isToday
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300'
                          }`}
                        >
                          <p className="text-xs font-medium">{d.label}</p>
                          <p className={`text-sm font-semibold ${isToday ? '' : 'text-slate-800 dark:text-slate-100'}`}>
                            {d.dayNum}/{d.month}
                          </p>
                        </div>
                        <div className="min-h-[420px] flex-1 space-y-2 rounded-xl border border-dashed border-slate-200 p-1.5 dark:border-slate-800">
                          {loading && !data ? (
                            <Skeleton className="h-16" />
                          ) : (
                            byDay[d.date].map((it) => (
                              <AgendaItemCard
                                key={it.id}
                                item={it}
                                compact
                                active={editing?.id === it.id}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 pt-4">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold cap-first text-slate-800 dark:text-slate-100">{weekTitle}</p>
                <p className="truncate text-xs text-slate-500">{weekSubtitle}</p>
              </div>
              {weekNav}
            </div>
            <div className="grid grid-cols-7 gap-1 p-3">
              {days.map((d) => {
                const isSel = d.date === selected;
                const isToday = d.date === today;
                const count = byDay[d.date]?.length || 0;
                return (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelected(d.date)}
                    className={`flex flex-col items-center rounded-xl py-2 transition-colors ${
                      isSel
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                        : isToday
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                    aria-pressed={isSel}
                  >
                    <span className="text-[11px] font-medium">{d.label}</span>
                    <span className="text-base font-semibold">{d.dayNum}</span>
                    <span
                      className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                        count ? (isSel ? 'bg-white' : 'bg-emerald-500') : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title={<span className="cap-first">{longDayLabel(selected)}</span>} icon={CalendarDays} />
            <div className="space-y-2 p-4">
              {error ? (
                <ErrorState message={error} onRetry={() => reload()} />
              ) : loading && !data ? (
                <>
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </>
              ) : (byDay[selected] || []).length === 0 ? (
                <EmptyState icon={CalendarDays} title="Sin compromisos" description="Tocá + para agendar algo en este día." />
              ) : (
                byDay[selected].map((it) => (
                  <AgendaItemCard key={it.id} item={it} onEdit={handleEdit} onDelete={handleDelete} />
                ))
              )}
            </div>
          </Card>

          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
            className="fab-pos fixed right-4 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 active:scale-95"
            aria-label="Nuevo compromiso"
          >
            <Plus className="h-6 w-6" />
          </button>
          <Modal open={sheetOpen} onClose={cancelEdit} title={editing ? 'Editar compromiso' : 'Nuevo compromiso'}>
            {sheetOpen && form}
          </Modal>
        </>
      )}
    </div>
  );
}
