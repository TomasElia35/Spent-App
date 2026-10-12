export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    return parseJson(raw);
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return parseJson(Buffer.concat(chunks).toString('utf8'));
}

function parseJson(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not object');
    return parsed;
  } catch {
    throw new HttpError(400, 'El cuerpo de la solicitud no es un JSON válido.');
  }
}

/**
 * Crea un handler con ruteo por método HTTP y manejo de errores uniforme ({ error }).
 * @param {Record<string, (req: any, res: any) => any>} methods
 */
export function route(methods) {
  return async function handler(req, res) {
    const fn = methods[req.method];
    try {
      if (!fn) {
        res.setHeader('Allow', Object.keys(methods).join(', '));
        throw new HttpError(405, 'Método no permitido.');
      }
      await fn(req, res);
    } catch (err) {
      if (err instanceof HttpError) {
        send(res, err.status, { error: err.message });
      } else {
        console.error('[api] error inesperado:', err);
        send(res, 500, { error: 'Error interno del servidor.' });
      }
    }
  };
}

/** Devuelve data o lanza HttpError si Supabase devolvió error. */
export function check(result, context = 'db') {
  if (result.error) {
    console.error(`[db] ${context}:`, result.error);
    if (result.error.code === '23505') throw new HttpError(409, 'El registro ya existe.');
    throw new HttpError(500, 'Error al acceder a la base de datos.');
  }
  return result.data;
}

/** Lee un parámetro de query como string (Vercel puede entregar arrays). */
export function q(req, name) {
  let v = req.query?.[name];
  if (v === undefined) {
    try {
      v = new URL(req.url, 'http://localhost').searchParams.get(name) ?? undefined;
    } catch {
      v = undefined;
    }
  }
  if (Array.isArray(v)) v = v[0];
  return v === undefined || v === null ? undefined : String(v);
}
