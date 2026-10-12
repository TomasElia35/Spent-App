import { createClient } from '@supabase/supabase-js';
import { HttpError } from './http.js';

let client = null;

/** Cliente Supabase con service role (solo backend). */
export function db() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('[config] Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    throw new HttpError(500, 'El servidor no está configurado correctamente.');
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'GestorGastos' },
  });
  return client;
}
