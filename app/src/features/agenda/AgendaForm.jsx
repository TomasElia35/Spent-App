import { useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import { useToast } from '../../components/ui/Toast.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, Input, Textarea } from '../../components/ui/Input.jsx';
import { timeToMins, todayStr } from '../../lib/format.js';

const empty = (date) => ({ title: '', date: date || todayStr(), start: '', end: '', notes: '' });

/**
 * @param {{ editing: object|null, defaultDate?: string, knownItems: object[], onSaved: (item, isEdit) => void, onCancel: () => void }} props
 */
export default function AgendaForm({ editing, defaultDate, knownItems, onSaved, onCancel }) {
  const toast = useToast();
  const [form, setForm] = useState(() => (editing ? { ...editing } : empty(defaultDate)));
  const [saving, setSaving] = useState(false);
  const isEdit = !!editing;

  useEffect(() => {
    setForm(editing ? { ...editing, notes: editing.notes || '' } : empty(defaultDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Ingresá un título.');
    if (!form.date || !form.start || !form.end) return toast.error('Completá fecha y horarios.');
    const s = timeToMins(form.start);
    const en = timeToMins(form.end);
    if (s >= en) return toast.error('La hora de inicio debe ser anterior a la de fin.');

    // Chequeo rápido en cliente (el servidor vuelve a validar).
    const overlap = knownItems.some(
      (i) => i.date === form.date && i.id !== editing?.id && s < timeToMins(i.end) && en > timeToMins(i.start),
    );
    if (overlap) return toast.error('El horario se superpone con otro compromiso.');

    const payload = { title: form.title.trim(), date: form.date, start: form.start, end: form.end, notes: form.notes };
    setSaving(true);
    try {
      const res = isEdit ? await api.put(`/agenda/${editing.id}`, payload) : await api.post('/agenda', payload);
      toast.success(isEdit ? 'Compromiso actualizado' : 'Compromiso agendado');
      if (!isEdit) setForm((f) => ({ ...f, title: '', start: '', end: '', notes: '' }));
      onSaved(res.item, isEdit);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Título de la tarea" htmlFor="ag-title">
        <Input id="ag-title" required maxLength={200} placeholder="Ej. Reunión equipo" value={form.title} onChange={set('title')} />
      </Field>
      <Field label="Fecha" htmlFor="ag-date">
        <Input id="ag-date" type="date" required value={form.date} onChange={set('date')} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Hora inicio" htmlFor="ag-start">
          <Input id="ag-start" type="time" required value={form.start} onChange={set('start')} />
        </Field>
        <Field label="Hora fin" htmlFor="ag-end">
          <Input id="ag-end" type="time" required value={form.end} onChange={set('end')} />
        </Field>
      </div>
      <Field label="Notas (opcional)" htmlFor="ag-notes">
        <Textarea id="ag-notes" rows={3} maxLength={1000} placeholder="Detalles, links, lugar…" value={form.notes} onChange={set('notes')} />
      </Field>
      <div className={`grid gap-3 ${isEdit ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {isEdit && (
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant={isEdit ? 'warning' : 'primary'} loading={saving}>
          {isEdit ? 'Actualizar compromiso' : 'Agregar a agenda'}
        </Button>
      </div>
    </form>
  );
}
