import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { HttpError } from './http.js';

export const COOKIE_NAME = 'gp_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) {
    console.error('[config] Falta JWT_SECRET');
    throw new HttpError(500, 'El servidor no está configurado correctamente.');
  }
  return s;
}

function isSecureEnv() {
  const env = process.env.VERCEL_ENV;
  if (env) return env !== 'development';
  return process.env.NODE_ENV === 'production';
}

export function parseCookies(req) {
  const header = req.headers?.cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (!k) continue;
    try {
      out[k] = decodeURIComponent(v);
    } catch {
      out[k] = v;
    }
  }
  return out;
}

function cookieString(value, maxAge) {
  const parts = [`${COOKIE_NAME}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`];
  if (isSecureEnv()) parts.push('Secure');
  return parts.join('; ');
}

export function setSessionCookie(res, username) {
  const token = jwt.sign({ sub: username }, secret(), { expiresIn: '7d', algorithm: 'HS256' });
  res.setHeader('Set-Cookie', cookieString(token, MAX_AGE_SECONDS));
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', cookieString('', 0));
}

/** Devuelve el payload de la sesión válida o null. */
export function getSession(req) {
  const key = secret();
  const token = parseCookies(req)[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, key, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}

/** Lanza 401 si no hay sesión válida. */
export function requireAuth(req) {
  const session = getSession(req);
  if (!session) throw new HttpError(401, 'No autorizado. Iniciá sesión nuevamente.');
  return session;
}

/** Comparación en tiempo constante (hashea ambos lados para igualar longitudes). */
export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a ?? ''), 'utf8').digest();
  const hb = crypto.createHash('sha256').update(String(b ?? ''), 'utf8').digest();
  return crypto.timingSafeEqual(ha, hb);
}
