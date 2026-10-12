import { HttpError, check } from './http.js';
import { db } from './supabase.js';
import { bad, reqString, optString, isValidDate, isValidTime, timeToMins, formatDateShort } from './validate.js';

const hhmm = (t) => (t ? String(t).slice(0, 5) : '');

export function toApi(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    start: hhmm(row.start_time),
    end: hhmm(row.end_time),
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}

export function parseAgendaItem(body) {
  const title = reqString(body.title, 'Título', 200);
  if (!isValidDate(body.date)) throw bad('La fecha no es válida.');
  if (!isValidTime(body.start) || !isValidTime(body.end)) throw bad('Las horas deben tener formato HH:MM.');
  const start = hhmm(body.start);
  const end = hhmm(body.end);
  if (timeToMins(start) >= timeToMins(end)) throw bad('La hora de inicio debe ser anterior a la de fin.');
  const notes = optString(body.notes, 'Notas', 1000);
  return { title, date: body.date, start_time: start, end_time: end, notes };
}

/** Lanza 409 si el horario se superpone con otro compromiso del mismo día. */
export async function assertNoOverlap(data, excludeId = null) {
  let query = db().from('agenda_items').select('id, start_time, end_time').eq('date', data.date);
  if (excludeId) query = query.neq('id', excludeId);
  const rows = check(await query, 'verificar superposición');
  const s = timeToMins(data.start_time);
  const e = timeToMins(data.end_time);
  const overlap = rows.some((r) => s < timeToMins(r.end_time) && e > timeToMins(r.start_time));
  if (overlap) throw new HttpError(409, 'El horario se superpone con otro compromiso.');
}

export const describeItem = (row) =>
  `Tarea '${row.title}' el ${formatDateShort(row.date)} (${hhmm(row.start_time)}-${hhmm(row.end_time)})`;
