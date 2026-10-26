import { request, unwrap } from '../core/api.js';

export const adminService = {
  async overview() { return unwrap(await request('/admin/overview')); },
  /** @returns {{users, pagination}} */
  async users({ search, role, page = 1, limit = 20 } = {}) {
    return unwrap(await request('/admin/users', { query: { search, role, page, limit } }));
  },
  async setRole(id, role) {
    return unwrap(await request(`/admin/users/${id}/role`, { method: 'PATCH', body: { role } })).user;
  }
};
