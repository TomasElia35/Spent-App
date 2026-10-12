import { HttpError } from './http.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const bad = (msg) => new HttpError(400, msg);

const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
export const formatCurrency = (amount) => currency.format(Number(amount) || 0);

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = String(dateStr).split('-');
  return `${d}/${m}/${y.substring(2)}`;
};

export const isCreditMethod = (name) => {
  const s = String(name || '').toLowerCase();
  return s.includes('crédito') || s.includes('credito');
};

export function isValidDate(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export const isValidMonth = (s) => typeof s === 'string' && MONTH_RE.test(s);
export const isValidTime = (s) => typeof s === 'string' && TIME_RE.test(s);

export function requireUuid(id) {
  if (typeof id !== 'string' || !UUID_RE.test(id)) throw new HttpError(404, 'Registro no encontrado.');
  return id;
}

/** String requerido, recortado, con longitud máxima. */
export function reqString(value, field, max = 200) {
  if (typeof value !== 'string' || !value.trim()) throw bad(`El campo "${field}" es obligatorio.`);
  const v = value.trim();
  if (v.length > max) throw bad(`El campo "${field}" supera los ${max} caracteres.`);
  return v;
}

/** String opcional: devuelve null si está vacío. */
export function optString(value, field, max = 500) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw bad(`El campo "${field}" no es válido.`);
  const v = value.trim();
  if (v.length > max) throw bad(`El campo "${field}" supera los ${max} caracteres.`);
  return v || null;
}

export const timeToMins = (t) => {
  const [h, m] = String(t).split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
};

/** Primer día del mes siguiente (YYYY-MM-01). */
export function nextMonthStart(month) {
  let [y, m] = month.split('-').map(Number);
  m += 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, '0')}-01`;
}
