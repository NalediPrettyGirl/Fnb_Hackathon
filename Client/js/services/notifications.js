import { request, unwrap } from '../core/api.js';

export const notificationService = {
  /** @returns {{notifications, unreadCount, total, page, totalPages}} */
  async list({ unread, page = 1, limit = 20 } = {}) {
    return unwrap(await request('/notifications/me', { query: { unread: unread ? 'true' : undefined, page, limit } }));
  },
  async markRead(id) { return request(`/notifications/${id}/read`, { method: 'PATCH' }); },
  async markAllRead() { return request('/notifications/read-all', { method: 'PATCH' }); }
};
