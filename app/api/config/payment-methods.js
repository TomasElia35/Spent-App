import { configListHandler } from '../_lib/configList.js';

export default configListHandler({
  table: 'payment_methods',
  label: 'un método de pago',
  createMsg: (n) => `Agregado nuevo método pago: ${n}`,
  deleteMsg: (n) => `Eliminado método pago: ${n}`,
});
