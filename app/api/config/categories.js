import { configListHandler } from '../_lib/configList.js';

export default configListHandler({
  table: 'categories',
  label: 'una categoría',
  createMsg: (n) => `Agregada nueva categoría: ${n}`,
  deleteMsg: (n) => `Eliminada categoría: ${n}`,
});
