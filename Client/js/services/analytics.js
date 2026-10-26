import { request, unwrap } from '../core/api.js';

export const analyticsService = {
  /** @returns {{user, progress, recentSubmissions}} */
  async mine() { return unwrap(await request('/analytics/me')); }
};
