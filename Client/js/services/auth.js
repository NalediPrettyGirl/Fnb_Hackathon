import { request } from '../core/api.js';
import { session } from '../core/session.js';

export const authService = {
  async login(email, password) {
    const result = await request('/auth/login', { method: 'POST', auth: false, body: { email, password } });
    session.save(result);
    return result;
  },
  async register({ name, email, password, role }) {
    const result = await request('/auth/register', { method: 'POST', auth: false, body: { name, email, password, role } });
    session.save(result);
    return result;
  },
  /** Revokes the token on the server; the local session is always cleared, even if the call fails. */
  async logout() {
    try { await request('/auth/logout', { method: 'POST' }); }
    catch { /* token may already be expired */ }
    finally { session.clear(); }
  }
};
