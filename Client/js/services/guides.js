import { request } from '../core/api.js';

export const guideService = {
  /** Public. @returns [{ id, title, steps: string[] }] */
  async list() { return (await request('/guides', { auth: false })).guides || []; }
};
