import { request, unwrap } from '../core/api.js';

export const gigService = {
  /** @returns {{gigs, total, page, totalPages, count}} */
  async list({ search, status = 'open', page = 1, limit = 20 } = {}) {
    return unwrap(await request('/gigs', { auth: false, query: { search, status, page, limit } }));
  },
  async get(id) {
    return (await request(`/gigs/${id}`, { auth: false })).gig;
  },
  async create(data) {
    return (await request('/gigs', { method: 'POST', body: data })).gig;
  },
  async update(id, data) {
    return (await request(`/gigs/${id}`, { method: 'PATCH', body: data })).gig;
  },
  async setStatus(id, status) {
    return (await request(`/gigs/${id}/status`, { method: 'PATCH', body: { status } })).gig;
  },
  async remove(id) {
    return request(`/gigs/${id}`, { method: 'DELETE' });
  },
  async apply(id, coverNote) {
    return (await request(`/gigs/${id}/apply`, { method: 'POST', body: { coverNote } })).application;
  },
  /**
   * The API has no "my gigs" endpoint, so we page through all gigs and keep the ones posted by this client.
   */
  async listMine(userId) {
    const mine = [];
    let page = 1;
    let totalPages = 1;
    do {
      const result = await this.list({ status: 'all', page, limit: 100 });
      mine.push(...result.gigs.filter(gig => String(gig.postedBy?._id) === String(userId)));
      totalPages = result.totalPages || 1;
      page += 1;
    } while (page <= totalPages);
    return mine;
  }
};
