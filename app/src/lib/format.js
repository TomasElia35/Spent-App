// Helpers de formato portados del HTML original.
// IMPORTANTE: las fechas se manejan como strings locales YYYY-MM-DD.
// Nunca usar toISOString() para obtener "hoy" (desplaza el día según la zona horaria).

const currencyFmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

export const formatCurrency = (amount) => currencyFmt.format(Number(amount) || 0);

export const timeToMins = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
};

/** "2025-03-07" -> "07/03/25" */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y.substring(2)}`;
};

const pad = (n) => String(n).padStart(2, '0');

/** Date -> "YYYY-MM-DD" usando la hora local. */
export const toDateStr = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** "YYYY-MM-DD" -> Date local (medianoche local). */
export const parseDateStr = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayStr = () => toDateStr(new Date());
export const currentMonthStr = () => todayStr().substring(0, 7);

export const addDays = (date, n) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + n);
  return d;
};

/** Lunes de la semana de la fecha dada (semana Lun-Dom). */
export const getMonday = (date) => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return d;
};

export const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const monthYearLabel = (date) => date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

export const monthLabel = (monthStr) => {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
};

export const longDayLabel = (dateStr) =>
  parseDateStr(dateStr).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

/** ISO timestamp -> "dd/mm/yy HH:MM" en hora local (formato del original). */
export const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).substring(2)} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
};

export const isCreditMethod = (name) => {
  const s = String(name || '').toLowerCase();
  return s.includes('crédito') || s.includes('credito');
};
