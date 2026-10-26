
const request = require('supertest');
const app = require('../app');

const clientUser = {
  name: 'Test Client',
  email: 'client@example.com',
  password: 'SecurePass123!',
  role: 'client'
};

const freelancerUser = {
  name: 'Test Freelancer',
  email: 'freelancer@example.com',
  password: 'SecurePass123!',
  role: 'freelancer'
};

const gigData = {
  title: 'Build a REST API',
  description: 'Build a REST API using Node.js and Express.',
  budget: 2500,
  skills: ['Node.js', 'Express', 'MongoDB']
};

async function registerUser(user) {
  const response = await request(app)
    .post('/api/auth/register')
    .send(user);

  expect(response.status).toBe(201);

  return {
    token: response.body.token,
    user: response.body.user
  };
}

async function createGig(token) {
  const response = await request(app)
    .post('/api/gigs')
    .set('Authorization', `Bearer ${token}`)
    .send(gigData);

  expect(response.status).toBe(201);
  return response.body.gig;
}

async function applyToGig(gigId, token) {
  const response = await request(app)
    .post(`/api/gigs/${gigId}/apply`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      coverNote: 'I have relevant experience building REST APIs.'
    });

  expect(response.status).toBe(201);
  return response.body.application;
}

describe('Applications API', () => {
  describe('GET /api/applications/me', () => {
    it('allows a freelancer to view their own applications', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const gig = await createGig(client.token);

      await applyToGig(gig._id, freelancer.token);

      const response = await request(app)
        .get('/api/applications/me')
        .set('Authorization', `Bearer ${freelancer.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.applications).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            coverNote: 'I have relevant experience building REST APIs.'
          })
        ])
      );
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .get('/api/applications/me');

      expect(response.status).toBe(401);
    });

    it('prevents clients from viewing the freelancer application list', async () => {
      const client = await registerUser(clientUser);

      const response = await request(app)
        .get('/api/applications/me')
        .set('Authorization', `Bearer ${client.token}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/applications/gig/:gigId', () => {
    it('allows a client to view applications for their own gig', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const gig = await createGig(client.token);

      await applyToGig(gig._id, freelancer.token);

      const response = await request(app)
        .get(`/api/applications/gig/${gig._id}`)
        .set('Authorization', `Bearer ${client.token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.applications).toHaveLength(1);
    });

    it('prevents another client from viewing the applications', async () => {
      const owner = await registerUser(clientUser);
      const anotherClient = await registerUser({
        ...clientUser,
        email: 'another-client@example.com'
      });

      const freelancer = await registerUser(freelancerUser);
      const gig = await createGig(owner.token);

      await applyToGig(gig._id, freelancer.token);

      const response = await request(app)
        .get(`/api/applications/gig/${gig._id}`)
        .set('Authorization', `Bearer ${anotherClient.token}`);

      expect(response.status).toBe(403);
    });

    it('prevents freelancers from viewing a gig application list', async () => {
      const freelancer = await registerUser(freelancerUser);

      const response = await request(app)
        .get('/api/applications/gig/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${freelancer.token}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/applications/:id/status', () => {
    it('allows the gig owner to accept a pending application', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const gig = await createGig(client.token);
      const application = await applyToGig(gig._id, freelancer.token);

      const response = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${client.token}`)
        .send({ status: 'accepted' });

      expect(response.status).toBe(200);
      expect(response.body.data.application.status).toBe('accepted');
    });

    it('allows the gig owner to reject a pending application', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const gig = await createGig(client.token);
      const application = await applyToGig(gig._id, freelancer.token);

      const response = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${client.token}`)
        .send({ status: 'rejected' });

      expect(response.status).toBe(200);
      expect(response.body.data.application.status).toBe('rejected');
    });

    it('prevents freelancers from changing application status', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const gig = await createGig(client.token);
      const application = await applyToGig(gig._id, freelancer.token);

      const response = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${freelancer.token}`)
        .send({ status: 'accepted' });

      expect(response.status).toBe(403);
    });

    it('prevents another client from changing the application status', async () => {
      const owner = await registerUser(clientUser);
      const anotherClient = await registerUser({
        ...clientUser,
        email: 'another-client@example.com'
      });

      const freelancer = await registerUser(freelancerUser);
      const gig = await createGig(owner.token);
      const application = await applyToGig(gig._id, freelancer.token);

      const response = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${anotherClient.token}`)
        .send({ status: 'accepted' });

      expect(response.status).toBe(403);
    });

    it('rejects an invalid application status', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const gig = await createGig(client.token);
      const application = await applyToGig(gig._id, freelancer.token);

      const response = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${client.token}`)
        .send({ status: 'pending' });

      expect(response.status).toBe(400);
    });

    it('prevents changing an application that has already been processed', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const gig = await createGig(client.token);
      const application = await applyToGig(gig._id, freelancer.token);

      await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${client.token}`)
        .send({ status: 'accepted' })
        .expect(200);

      const response = await request(app)
        .patch(`/api/applications/${application._id}/status`)
        .set('Authorization', `Bearer ${client.token}`)
        .send({ status: 'rejected' });

      expect(response.status).toBe(400);
    });
  });
});
