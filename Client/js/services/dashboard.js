import { request, unwrap } from '../core/api.js';

export const dashboardService = {
  /** Role-specific payload: check `data.role` ('freelancer' | 'client'). */
  async get() { return unwrap(await request('/dashboard')); }
};
