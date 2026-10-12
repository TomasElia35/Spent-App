import { useState } from 'react';
import { CreditCard, Plus, Tag, Trash2 } from 'lucide-react';
import { api } from '../../api/client.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { useConfirm } from '../../components/ui/ConfirmDialog.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { useConfigLists } from './useConfigLists.js';

function ConfigList({ title, icon, items, loading, error, onRetry, endpoint, placeholder, addedMsg, note, onChange }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const add = async (e) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;
    if (items.some((i) => i.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Ese elemento ya existe.');
      return;
    }
    setSaving(true);
    try {
      await api.post(endpoint, { name });
      setValue('');
      toast.success(addedMsg);
      onChange();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    const ok = await confirm({
      title: 'Eliminar elemento',
      message: `¿Eliminar "${item.name}"? Los movimientos existentes conservan su valor.`,
      confirmText: 'Eliminar',
    });
    if (!ok) return;
    setDeletingId(item.id);
    try {
      await api.del(endpoint, { id: item.id });
      toast.success(`"${item.name}" eliminado`);
      onChange();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader title={title} icon={icon} subtitle={loading ? undefined : `${items.length} elementos`} />
      <div className="p-5">
        <form onSubmit={add} className="flex gap-2">
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} maxLength={100} />
          <Button type="submit" loading={saving} disabled={!value.trim()} className="shrink-0">
            {!saving && <Plus className="h-4 w-4" />}
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </form>
        {note && <p className="mt-2 text-[11px] italic text-slate-500">{note}</p>}

        <div className="mt-4">
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : items.length === 0 ? (
            <EmptyState title="La lista está vacía" />
          ) : (
            <ul className="scrollbar-thin max-h-[360px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="truncate text-sm text-slate-700 dark:text-slate-200">{item.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(item)}
                    loading={deletingId === item.id}
                    className="text-slate-400 hover:!bg-rose-50 hover:!text-rose-600 dark:hover:!bg-rose-500/10"
                    aria-label={`Eliminar ${item.name}`}
                  >
                    {deletingId !== item.id && <Trash2 className="h-4 w-4" />}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ConfigPage() {
  const { categories, paymentMethods, loading, error, reload } = useConfigLists();
  const refresh = () => reload({ silent: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Configuración</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Administrá las categorías y los métodos de pago.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ConfigList
          title="Categorías"
          icon={Tag}
          items={categories}
          loading={loading}
          error={error}
          onRetry={() => reload()}
          endpoint="/config/categories"
          placeholder="Nueva categoría"
          addedMsg="Agregado a categorías"
          onChange={refresh}
        />
        <ConfigList
          title="Métodos de pago"
          icon={CreditCard}
          items={paymentMethods}
          loading={loading}
          error={error}
          onRetry={() => reload()}
          endpoint="/config/payment-methods"
          placeholder="Nuevo método de pago"
          addedMsg="Agregado a métodos de pago"
          note='* Si el nombre incluye "Crédito", se habilitarán las opciones de cuotas al usarlo.'
          onChange={refresh}
        />
      </div>
    </div>
  );
}
