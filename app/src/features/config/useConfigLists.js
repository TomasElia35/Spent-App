import { api } from '../../api/client.js';
import { useAsync } from '../../lib/hooks.js';

/** Carga categorías y métodos de pago (como objetos {id, name}). */
export function useConfigLists() {
  const { data, loading, error, reload } = useAsync(async () => {
    const [cats, pays] = await Promise.all([api.get('/config/categories'), api.get('/config/payment-methods')]);
    return { categories: cats.items, paymentMethods: pays.items };
  }, []);

  return {
    categories: data?.categories ?? [],
    paymentMethods: data?.paymentMethods ?? [],
    loading,
    error,
    reload,
  };
}
