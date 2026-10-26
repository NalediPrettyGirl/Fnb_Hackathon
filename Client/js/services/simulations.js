import { request } from '../core/api.js';

export const simulationService = {
  async list() {
    return (await request('/simulations', { auth: false })).simulations || [];
  },
  /** Freelancer: submit an answer. @returns {{xpAwarded, totalXp, submission}} */
  async submit(id, answer) {
    return request(`/simulations/${id}/submit`, { method: 'POST', body: { answer } });
  },
  async portfolio() {
    return (await request('/portfolio/me')).projects || [];
  }
};
