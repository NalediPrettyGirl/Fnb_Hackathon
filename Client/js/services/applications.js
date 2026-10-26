import { request, unwrap } from '../core/api.js';

export const applicationService = {
  /** Freelancer: own applications. */
  async mine() {
    return unwrap(await request('/applications/me')).applications || [];
  },
  /** Client: applicants for one of their gigs. @returns {{gig, count, applications}} */
  async forGig(gigId) {
    return unwrap(await request(`/applications/gig/${gigId}`));
  },
  /** Client: accept or reject a pending application. */
  async setStatus(applicationId, status) {
    return unwrap(await request(`/applications/${applicationId}/status`, { method: 'PATCH', body: { status } })).application;
  }
};
