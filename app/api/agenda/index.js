import { route, readBody, send, check, q, HttpError } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/supabase.js';
import { logAudit } from '../_lib/audit.js';
import { isValidDate } from '../_lib/validate.js';
import { toApi, parseAgendaItem, assertNoOverlap, describeItem } from '../_lib/agenda.js';

export default route({
  async GET(req, res) {
    requireAuth(req);
    const from = q(req, 'from');
    const to = q(req, 'to');
    if ((from && !isValidDate(from)) || (to && !isValidDate(to))) {
      throw new HttpError(400, 'Las fechas deben tener formato YYYY-MM-DD.');
    }
    let query = db()
      .from('agenda_items')
      .select('*')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(2000);
    if (from) query = query.gte('date', from);
    if (to) query = query.lte('date', to);
    const rows = check(await query, 'listar agenda');
    send(res, 200, { items: rows.map(toApi) });
  },

  async POST(req, res) {
    requireAuth(req);
    const data = parseAgendaItem(await readBody(req));
    await assertNoOverlap(data);
    const row = check(await db().from('agenda_items').insert(data).select().single(), 'crear compromiso');
    await logAudit('CREATE', 'Agenda', `Agendada: ${describeItem(row)}`);
    send(res, 201, { item: toApi(row) });
  },
});
