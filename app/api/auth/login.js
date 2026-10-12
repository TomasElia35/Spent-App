import { route, readBody, send, HttpError } from '../_lib/http.js';
import { safeEqual, setSessionCookie } from '../_lib/auth.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default route({
  async POST(req, res) {
    const expectedUser = process.env.APP_USERNAME;
    const expectedPass = process.env.APP_PASSWORD;
    if (!expectedUser || !expectedPass) {
      console.error('[config] Faltan APP_USERNAME o APP_PASSWORD');
      throw new HttpError(500, 'El servidor no está configurado correctamente.');
    }

    const body = await readBody(req);
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    // Se evalúan ambas comparaciones siempre (sin cortocircuito).
    const userOk = safeEqual(username, expectedUser);
    const passOk = safeEqual(password, expectedPass);

    if (!(userOk & passOk)) {
      // Mitigación básica de fuerza bruta: demora artificial con jitter.
      await sleep(800 + Math.floor(Math.random() * 400));
      throw new HttpError(401, 'Usuario o contraseña incorrectos.');
    }

    setSessionCookie(res, expectedUser);
    send(res, 200, { authenticated: true, username: expectedUser });
  },
});
