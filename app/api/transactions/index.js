import { route, readBody, send, check, q, HttpError } from '../_lib/http.js';
import { requireAuth } from '../_lib/auth.js';
import { db } from '../_lib/supabase.js';
import { logAudit } from '../_lib/audit.js';
import { isValidMonth, nextMonthStart } from '../_lib/validate.js';
import { toApi, parseTransaction, describeTx } from '../_lib/transactions.js';

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default route({
  async GET(req, res) {
    requireAuth(req);
    const month = q(req, 'month') || currentMonth();
    if (!isValidMonth(month)) throw new HttpError(400, 'El mes debe tener formato YYYY-MM.');
    const category = q(req, 'category');
    const payment = q(req, 'payment');

    const from = `${month}-01`;
    const to = nextMonthStart(month);

    let query = db()
      .from('transactions')
      .select('*')
      .gte('date', from)
      .lt('date', to)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5000);
    if (category && category !== 'ALL') query = query.eq('category', category);
    if (payment && payment !== 'ALL') query = query.eq('payment_method', payment);

    const [itemsRes, balanceRes] = await Promise.all([query, db().rpc('balance_before', { p_date: from })]);
    const rows = check(itemsRes, 'listar movimientos');
    const initialBalance = Number(check(balanceRes, 'saldo inicial') ?? 0);

    send(res, 200, { items: rows.map(toApi), initialBalance });
  },

  async POST(req, res) {
    requireAuth(req);
    const data = parseTransaction(await readBody(req));
    const row = check(await db().from('transactions').insert(data).select().single(), 'crear movimiento');
    await logAudit('CREATE', 'Finanzas', `Registrado: ${describeTx(row)}`);
    send(res, 201, { item: toApi(row) });
  },
});
