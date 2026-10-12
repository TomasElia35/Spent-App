// Wrapper de fetch para la API propia. La sesión viaja en una cookie httpOnly.

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let unauthorizedHandler = null;

/** Registra el callback a ejecutar ante un 401 (p. ej. volver al login). */
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn;
}

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión.', 0);
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (res.status === 401 && !path.startsWith('/auth/')) {
    unauthorizedHandler?.();
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Error inesperado (${res.status}).`, res.status);
  }
  return data;
}

const qs = (params) => {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const api = {
  get: (path, params) => request('GET', path + qs(params)),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body ?? {}),
  del: (path, params) => request('DELETE', path + qs(params)),
};
