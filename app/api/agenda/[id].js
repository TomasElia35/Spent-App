import { route, readBody, send, check, q, HttpError } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/supabase.js';
import { logAudit } from '../_lib/audit.js';
import { requireUuid, formatDateShort } from '../_lib/validate.js';
import { toApi, parseAgendaItem, assertNoOverlap, describeItem } from '../_lib/agenda.js';

const notFound = () => new HttpError(404, 'Compromiso no encontrado.');

export default route({
  async PUT(req, res) {
    requireAuth(req);
    const id = requireUuid(q(req, 'id'));
    const data = parseAgendaItem(await readBody(req));
    await assertNoOverlap(data, id);
    const row = check(
      await db().from('agenda_items').update(data).eq('id', id).select().maybeSingle(),
      'editar compromiso',
    );
    if (!row) throw notFound();
    await logAudit('UPDATE', 'Agenda', `Actualizada: ${describeItem(row)}`);
    send(res, 200, { item: toApi(row) });
  },

  async DELETE(req, res) {
    requireAuth(req);
    const id = requireUuid(q(req, 'id'));
    const row = check(
      await db().from('agenda_items').delete().eq('id', id).select().maybeSingle(),
      'eliminar compromiso',
    );
    if (!row) throw notFound();
    await logAudit('DELETE', 'Agenda', `Eliminada Tarea '${row.title}' (${formatDateShort(row.date)})`);
    send(res, 200, { ok: true });
  },
});
