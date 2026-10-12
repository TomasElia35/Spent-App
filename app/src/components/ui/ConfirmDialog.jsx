import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

const ConfirmContext = createContext(null);

/**
 * Reemplazo de window.confirm(). Uso:
 *   const confirm = useConfirm();
 *   if (await confirm({ title, message, confirmText })) { ... }
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({
        title: '¿Confirmar acción?',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        danger: true,
        ...opts,
      });
    });
  }, []);

  const close = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={!!state} onClose={() => close(false)} size="sm">
        {state && (
          <div className="pt-2 text-center sm:pt-4">
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
                state.danger
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
              }`}
            >
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{state.title}</h3>
            {state.message && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{state.message}</p>}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => close(false)}>
                {state.cancelText}
              </Button>
              <Button variant={state.danger ? 'danger' : 'primary'} onClick={() => close(true)} autoFocus>
                {state.confirmText}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  return ctx;
}
