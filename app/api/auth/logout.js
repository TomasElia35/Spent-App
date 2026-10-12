import { route, send } from '../_lib/http.js';
import { clearSessionCookie } from '../_lib/auth.js';

export default route({
  async POST(req, res) {
    clearSessionCookie(res);
    send(res, 200, { authenticated: false });
  },
});
