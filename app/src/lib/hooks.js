import { useCallback, useEffect, useRef, useState } from 'react';

/** true si la media query coincide (p. ej. '(min-width: 1024px)'). */
export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');

/**
 * Carga asíncrona con estados loading/error y recarga.
 * Ignora respuestas viejas si cambian las dependencias.
 */
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const reqId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);

  const reload = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++reqId.current;
      if (!silent) setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const data = await run();
        if (id === reqId.current) setState({ data, loading: false, error: null });
      } catch (err) {
        if (id === reqId.current) setState((s) => ({ ...s, loading: false, error: err.message || 'Error' }));
      }
    },
    [run],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}
