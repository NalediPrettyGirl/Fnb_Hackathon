import { request, unwrap } from '../core/api.js';
import { session } from '../core/session.js';

export const profileService = {
  async get() { return unwrap(await request('/profile/me')).user; },
  async update(fields) {
    const user = unwrap(await request('/profile/me', { method: 'PATCH', body: fields })).user;
    session.updateUser({ name: user.name });
    return user;
  }
};
