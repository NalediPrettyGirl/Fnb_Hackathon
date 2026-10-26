import { request, unwrap } from '../core/api.js';

export const skillMatchService = {
  /** @returns {{summary: {completedSimulations, evidenceTracks, eligibleGigs}, matches}} */
  async mine() { return unwrap(await request('/skillmatch/me')); }
};
