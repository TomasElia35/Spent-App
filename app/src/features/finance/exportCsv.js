/** Exporta movimientos a CSV (con BOM para que Excel respete los acentos). Mismas columnas que el original. */
export function exportTransactionsCsv(items, month) {
  const rows = [...items].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;

  let csv = '﻿' + 'Fecha,Tipo,Título,Monto,Método Pago,Categoría,Ubicación,Observaciones,Cuotas,Vto. Cuota\n';
  rows.forEach((t) => {
    const tipo = t.type === 'income' ? 'Ingreso' : 'Gasto';
    csv +=
      [
        t.date,
        tipo,
        q(t.title),
        t.amount,
        q(t.paymentMethod),
        q(t.category),
        q(t.location),
        q(t.obs),
        t.installments || '',
        t.expiration || '',
      ].join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Movimientos_${month}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
