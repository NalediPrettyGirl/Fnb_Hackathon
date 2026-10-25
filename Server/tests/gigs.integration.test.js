
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

async function createGig(token, data = gigData) {
  return request(app)
    .post('/api/gigs')
    .set('Authorization', `Bearer ${token}`)
    .send(data);
}

describe('Gigs API', () => {
  describe('Public gig browsing', () => {
    it('allows anyone to browse gigs', async () => {
      const response = await request(app)
        .get('/api/gigs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('returns a newly created gig in the public listing', async () => {
      const client = await registerUser(clientUser);

      const created = await createGig(client.token);

      expect(created.status).toBe(201);

      const response = await request(app)
        .get('/api/gigs');

      expect(response.status).toBe(200);
      expect(response.body.data.gigs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: gigData.title
          })
        ])
      );
    });

    it('returns the details of an existing gig', async () => {
      const client = await registerUser(clientUser);
      const created = await createGig(client.token);

      expect(created.status).toBe(201);

      const gigId = created.body.gig._id;

      const response = await request(app)
        .get(`/api/gigs/${gigId}`);

      expect(response.status).toBe(200);
      expect(response.body.gig.title).toBe(gigData.title);
    });

    it('returns 404 for a nonexistent gig', async () => {
      const response = await request(app)
        .get('/api/gigs/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/gigs', () => {
    it('allows a client to create a gig', async () => {
      const client = await registerUser(clientUser);

      const response = await createGig(client.token);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.gig.title).toBe(gigData.title);
      expect(response.body.gig.status).toBe('open');
    });

    it('rejects requests without authentication', async () => {
      const response = await request(app)
        .post('/api/gigs')
        .send(gigData);

      expect(response.status).toBe(401);
    });

    it('prevents freelancers from creating gigs', async () => {
      const freelancer = await registerUser(freelancerUser);

      const response = await createGig(freelancer.token);

      expect(response.status).toBe(403);
    });

    it('rejects invalid gig data', async () => {
      const client = await registerUser(clientUser);

      const response = await createGig(client.token, {
        title: 'API',
        description: 'Too short',
        budget: -100
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Gig ownership and management', () => {
    it('allows the owner to close a gig', async () => {
      const client = await registerUser(clientUser);
      const created = await createGig(client.token);

      expect(created.status).toBe(201);

      const response = await request(app)
        .patch(`/api/gigs/${created.body.gig._id}/status`)
        .set('Authorization', `Bearer ${client.token}`)
        .send({ status: 'closed' });

      expect(response.status).toBe(200);
      expect(response.body.gig.status).toBe('closed');
    });

    it('prevents another client from modifying a gig', async () => {
      const owner = await registerUser(clientUser);
      const anotherClient = await registerUser({
        ...clientUser,
        email: 'another-client@example.com'
      });

      const created = await createGig(owner.token);

      expect(created.status).toBe(201);

      const response = await request(app)
        .patch(`/api/gigs/${created.body.gig._id}`)
        .set('Authorization', `Bearer ${anotherClient.token}`)
        .send({ title: 'Hijacked gig title' });

      expect(response.status).toBe(403);
    });

    it('prevents freelancers from deleting gigs', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const created = await createGig(client.token);

      expect(created.status).toBe(201);

      const response = await request(app)
        .delete(`/api/gigs/${created.body.gig._id}`)
        .set('Authorization', `Bearer ${freelancer.token}`);

      expect(response.status).toBe(403);
    });

    it('allows the owner to delete a gig without applications', async () => {
      const client = await registerUser(clientUser);
      const created = await createGig(client.token);

      expect(created.status).toBe(201);

      const response = await request(app)
        .delete(`/api/gigs/${created.body.gig._id}`)
        .set('Authorization', `Bearer ${client.token}`);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/gigs/:id/apply', () => {
    it('allows a freelancer to apply to an open gig', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const created = await createGig(client.token);

      expect(created.status).toBe(201);

      const response = await request(app)
        .post(`/api/gigs/${created.body.gig._id}/apply`)
        .set('Authorization', `Bearer ${freelancer.token}`)
        .send({ coverNote: 'I have relevant API development experience.' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.application.status).toBe('pending');
    });

    it('prevents a freelancer from applying twice', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const created = await createGig(client.token);
      const gigId = created.body.gig._id;

      await request(app)
        .post(`/api/gigs/${gigId}/apply`)
        .set('Authorization', `Bearer ${freelancer.token}`)
        .send({ coverNote: 'My first application.' })
        .expect(201);

      const response = await request(app)
        .post(`/api/gigs/${gigId}/apply`)
        .set('Authorization', `Bearer ${freelancer.token}`)
        .send({ coverNote: 'My second application.' });

      expect(response.status).toBe(409);
    });

    it('prevents applications to closed gigs', async () => {
      const client = await registerUser(clientUser);
      const freelancer = await registerUser(freelancerUser);
      const created = await createGig(client.token);
      const gigId = created.body.gig._id;

      await request(app)
        .patch(`/api/gigs/${gigId}/status`)
        .set('Authorization', `Bearer ${client.token}`)
        .send({ status: 'closed' })
        .expect(200);

      const response = await request(app)
        .post(`/api/gigs/${gigId}/apply`)
        .set('Authorization', `Bearer ${freelancer.token}`)
        .send({ coverNote: 'I would like to apply.' });

      expect(response.status).toBe(400);
    });
  });
});
