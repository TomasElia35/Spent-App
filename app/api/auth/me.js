import { route, send } from '../_lib/http.js';
import { getSession } from '../_lib/auth.js';

export default route({
  async GET(req, res) {
    const session = getSession(req);
    send(res, 200, session ? { authenticated: true, username: session.sub } : { authenticated: false });
  },
});
