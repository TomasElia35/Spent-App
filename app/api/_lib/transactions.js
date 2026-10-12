import { bad, reqString, optString, isValidDate, isCreditMethod, formatCurrency } from './validate.js';

/** Fila DB -> objeto API (camelCase). */
export function toApi(row) {
  return {
    id: row.id,
    type: row.type,
    date: row.date,
    title: row.title,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    category: row.category,
    location: row.location || '',
    obs: row.obs || '',
    installments: row.installments,
    expiration: row.expiration,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Valida el cuerpo y devuelve la fila lista para la DB (snake_case). */
export function parseTransaction(body) {
  const type = body.type;
  if (type !== 'income' && type !== 'expense') throw bad('El tipo debe ser "income" o "expense".');

  if (!isValidDate(body.date)) throw bad('La fecha no es válida.');

  const title = reqString(body.title, 'Título', 200);

  const amount = typeof body.amount === 'string' ? Number(body.amount) : body.amount;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    throw bad('El monto debe ser un número mayor a 0.');
  }
  if (amount >= 1e12) throw bad('El monto es demasiado grande.');

  const paymentMethod = reqString(body.paymentMethod, 'Método de Pago', 100);
  const category = reqString(body.category, 'Categoría', 100);
  const location = optString(body.location, 'Ubicación', 200);
  const obs = optString(body.obs, 'Observación', 500);

  let installments = null;
  let expiration = null;
  if (type === 'expense' && isCreditMethod(paymentMethod)) {
    const n = Number(body.installments ?? 1);
    if (!Number.isInteger(n) || n < 1 || n > 120) throw bad('Las cuotas deben ser un número entero entre 1 y 120.');
    if (!isValidDate(body.expiration)) throw bad('El vencimiento es obligatorio para pagos con tarjeta de crédito.');
    installments = n;
    expiration = body.expiration;
  }

  return {
    type,
    date: body.date,
    title,
    amount: Math.round(amount * 100) / 100,
    payment_method: paymentMethod,
    category,
    location,
    obs,
    installments,
    expiration,
  };
}

export const describeTx = (t) =>
  `${t.type === 'income' ? 'Ingreso' : 'Gasto'} '${t.title}' (${formatCurrency(t.amount)})`;
