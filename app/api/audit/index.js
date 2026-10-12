import { route, send, check, q } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/supabase.js';

export default route({
  async GET(req, res) {
    requireAuth(req);
    const limit = Math.min(Math.max(parseInt(q(req, 'limit') || '50', 10) || 50, 1), 200);
    const offset = Math.max(parseInt(q(req, 'offset') || '0', 10) || 0, 0);
    const result = await db()
      .from('audit_logs')
      .select('id, created_at, action, module, details', { count: 'exact' })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);
    const rows = check(result, 'listar auditoría');
    send(res, 200, {
      items: rows.map((r) => ({ id: r.id, createdAt: r.created_at, action: r.action, module: r.module, details: r.details })),
      total: result.count ?? rows.length,
      limit,
      offset,
    });
  },

  async DELETE(req, res) {
    requireAuth(req);
    check(await db().from('audit_logs').delete().gte('id', 0), 'limpiar auditoría');
    send(res, 200, { ok: true });
  },
});
