import { route, readBody, send, check, q, HttpError } from './http.js';
import { requireAuth } from './auth.js';
import { db } from './supabase.js';
import { logAudit } from './audit.js';
import { reqString } from './validate.js';

/**
 * Crea un handler CRUD (GET/POST/DELETE) para una lista de configuración simple.
 * @param {{ table: string, label: string, createMsg: (n: string) => string, deleteMsg: (n: string) => string }} opts
 */
export function configListHandler({ table, label, createMsg, deleteMsg }) {
  return route({
    async GET(req, res) {
      requireAuth(req);
      const rows = check(await db().from(table).select('id, name').order('id', { ascending: true }), `listar ${table}`);
      send(res, 200, { items: rows });
    },

    async POST(req, res) {
      requireAuth(req);
      const body = await readBody(req);
      const name = reqString(body.name, 'Nombre', 100);
      const existing = check(await db().from(table).select('id').ilike('name', name.replace(/[%_\\]/g, '\\$&')), `buscar ${table}`);
      if (existing.length) throw new HttpError(409, `Ya existe ${label} con ese nombre.`);
      const row = check(await db().from(table).insert({ name }).select('id, name').single(), `crear ${table}`);
      await logAudit('CREATE', 'Configuración', createMsg(name));
      send(res, 201, { item: row });
    },

    async DELETE(req, res) {
      requireAuth(req);
      let id = q(req, 'id');
      let name = q(req, 'name');
      if (!id && !name) {
        const body = await readBody(req).catch(() => ({}));
        id = body.id != null ? String(body.id) : undefined;
        name = typeof body.name === 'string' ? body.name : undefined;
      }
      let query = db().from(table).delete();
      if (id) {
        if (!/^\d+$/.test(id)) throw new HttpError(400, 'Identificador inválido.');
        query = query.eq('id', Number(id));
      } else if (name) {
        query = query.eq('name', name);
      } else {
        throw new HttpError(400, 'Indicá "id" o "name" para eliminar.');
      }
      const rows = check(await query.select('id, name'), `eliminar ${table}`);
      if (!rows.length) throw new HttpError(404, 'Elemento no encontrado.');
      await logAudit('DELETE', 'Configuración', deleteMsg(rows[0].name));
      send(res, 200, { ok: true });
    },
  });
}
