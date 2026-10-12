import { db } from './supabase.js';

/**
 * Registra una entrada de auditoría. Si falla, no interrumpe la operación principal.
 * @param {'CREATE'|'UPDATE'|'DELETE'} action
 * @param {'Finanzas'|'Agenda'|'Configuración'} module
 * @param {string} details
 */
export async function logAudit(action, module, details) {
  try {
    const { error } = await db().from('audit_logs').insert({ action, module, details });
    if (error) console.error('[audit] no se pudo registrar:', error);
  } catch (err) {
    console.error('[audit] no se pudo registrar:', err);
  }
}
