import { useEffect, useState } from 'react';
import { CreditCard, TrendingDown, TrendingUp } from 'lucide-react';
import { api } from '../../api/client.js';
import { useToast } from '../../components/ui/Toast.jsx';
import Button from '../../components/ui/Button.jsx';
import { Field, Input, Select } from '../../components/ui/Input.jsx';
import { isCreditMethod, todayStr } from '../../lib/format.js';

const emptyForm = (categories, paymentMethods) => ({
  type: 'expense',
  date: todayStr(),
  title: '',
  amount: '',
  paymentMethod: paymentMethods[0] || '',
  category: categories[0] || '',
  location: '',
  obs: '',
  installments: 1,
  expiration: '',
});

const fromTx = (tx) => ({
  type: tx.type,
  date: tx.date,
  title: tx.title,
  amount: String(tx.amount),
  paymentMethod: tx.paymentMethod,
  category: tx.category,
  location: tx.location || '',
  obs: tx.obs || '',
  installments: tx.installments || 1,
  expiration: tx.expiration || '',
});

/**
 * Formulario de alta/edición de movimientos.
 * @param {{ categories: string[], paymentMethods: string[], editing: object|null, onSaved: (tx, isEdit) => void, onCancel: () => void }} props
 */
export default function TransactionForm({ categories, paymentMethods, editing, onSaved, onCancel }) {
  const toast = useToast();
  const [form, setForm] = useState(() => (editing ? fromTx(editing) : emptyForm(categories, paymentMethods)));
  const [saving, setSaving] = useState(false);
  const isEdit = !!editing;

  // Al cambiar el registro en edición, recargar el formulario.
  useEffect(() => {
    setForm(editing ? fromTx(editing) : emptyForm(categories, paymentMethods));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  // Completar selects cuando las listas terminan de cargar.
  useEffect(() => {
    setForm((f) =>
      f.category && f.paymentMethod
        ? f
        : {
            ...f,
            category: f.category || categories[0] || '',
            paymentMethod: f.paymentMethod || paymentMethods[0] || '',
          },
    );
  }, [categories, paymentMethods]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const showCredit = form.type === 'expense' && isCreditMethod(form.paymentMethod);

  // Si el valor en edición ya no existe en la configuración, lo mostramos igual.
  const catOptions = form.category && !categories.includes(form.category) ? [form.category, ...categories] : categories;
  const payOptions =
    form.paymentMethod && !paymentMethods.includes(form.paymentMethod)
      ? [form.paymentMethod, ...paymentMethods]
      : paymentMethods;

  const onSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.title.trim()) return toast.error('Ingresá un título.');
    if (!Number.isFinite(amount) || amount <= 0) return toast.error('El monto debe ser mayor a 0.');
    if (!form.category || !form.paymentMethod) return toast.error('Seleccioná categoría y método de pago.');
    if (showCredit && !form.expiration) return toast.error('Indicá el vencimiento de la tarjeta.');

    const payload = {
      type: form.type,
      date: form.date,
      title: form.title.trim(),
      amount,
      paymentMethod: form.paymentMethod,
      category: form.category,
      location: form.location,
      obs: form.obs,
      installments: showCredit ? parseInt(form.installments, 10) || 1 : null,
      expiration: showCredit ? form.expiration : null,
    };

    setSaving(true);
    try {
      const res = isEdit
        ? await api.put(`/transactions/${editing.id}`, payload)
        : await api.post('/transactions', payload);
      toast.success(isEdit ? 'Movimiento actualizado' : 'Movimiento registrado');
      if (!isEdit) {
        // Igual que el original: se limpian los campos comunes y se conservan tipo/fecha/método/categoría.
        setForm((f) => ({ ...f, title: '', amount: '', location: '', obs: '', installments: 1, expiration: '' }));
      }
      onSaved(res.item, isEdit);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Tipo como segmented control */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {[
          { v: 'expense', label: 'Gasto', icon: TrendingDown, active: 'bg-white text-rose-600 shadow-sm dark:bg-slate-900 dark:text-rose-400' },
          { v: 'income', label: 'Ingreso', icon: TrendingUp, active: 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400' },
        ].map(({ v, label, icon: Icon, active }) => (
          <button
            key={v}
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: v }))}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all ${
              form.type === v ? active : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
            aria-pressed={form.type === v}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha" htmlFor="fin-date">
          <Input id="fin-date" type="date" required value={form.date} onChange={set('date')} />
        </Field>
        <Field label="Monto ($)" htmlFor="fin-amount">
          <Input
            id="fin-amount"
            type="number"
            inputMode="decimal"
            required
            min="0.01"
            step="0.01"
            placeholder="0,00"
            value={form.amount}
            onChange={set('amount')}
          />
        </Field>
      </div>

      <Field label="Título" htmlFor="fin-title">
        <Input id="fin-title" required maxLength={200} placeholder="Ej. Supermercado" value={form.title} onChange={set('title')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Método de pago" htmlFor="fin-pay">
          <Select id="fin-pay" value={form.paymentMethod} onChange={set('paymentMethod')}>
            {payOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Categoría" htmlFor="fin-cat">
          <Select id="fin-cat" value={form.category} onChange={set('category')}>
            {catOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {showCredit && (
        <div className="animate-fade-in rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CreditCard className="h-3.5 w-3.5" /> Detalles de Tarjeta de Crédito
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cuotas" htmlFor="fin-inst">
              <Input id="fin-inst" type="number" min="1" max="120" step="1" value={form.installments} onChange={set('installments')} />
            </Field>
            <Field label="Vencimiento" htmlFor="fin-exp">
              <Input id="fin-exp" type="date" required value={form.expiration} onChange={set('expiration')} />
            </Field>
          </div>
        </div>
      )}

      <Field label="Ubicación" htmlFor="fin-loc">
        <Input id="fin-loc" maxLength={200} placeholder="¿Dónde?" value={form.location} onChange={set('location')} />
      </Field>

      <Field label="Observación (opcional)" htmlFor="fin-obs">
        <Input id="fin-obs" maxLength={500} placeholder="Detalles adicionales" value={form.obs} onChange={set('obs')} />
      </Field>

      <div className={`grid gap-3 ${isEdit ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {isEdit && (
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant={isEdit ? 'warning' : 'primary'} loading={saving}>
          {isEdit ? 'Actualizar movimiento' : 'Guardar movimiento'}
        </Button>
      </div>
    </form>
  );
}
