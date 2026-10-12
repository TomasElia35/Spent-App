import { route, readBody, send, check, q, HttpError } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/supabase.js';
import { logAudit } from '../_lib/audit.js';
import { requireUuid } from '../_lib/validate.js';
import { toApi, parseTransaction, describeTx } from '../_lib/transactions.js';

const notFound = () => new HttpError(404, 'Movimiento no encontrado.');

export default route({
  async PUT(req, res) {
    requireAuth(req);
    const id = requireUuid(q(req, 'id'));
    const data = parseTransaction(await readBody(req));
    const row = check(
      await db().from('transactions').update(data).eq('id', id).select().maybeSingle(),
      'editar movimiento',
    );
    if (!row) throw notFound();
    await logAudit('UPDATE', 'Finanzas', `Editado: ${describeTx(row)}`);
    send(res, 200, { item: toApi(row) });
  },

  async DELETE(req, res) {
    requireAuth(req);
    const id = requireUuid(q(req, 'id'));
    const row = check(
      await db().from('transactions').delete().eq('id', id).select().maybeSingle(),
      'eliminar movimiento',
    );
    if (!row) throw notFound();
    await logAudit('DELETE', 'Finanzas', `Eliminado: ${describeTx(row)}`);
    send(res, 200, { ok: true });
  },
});
