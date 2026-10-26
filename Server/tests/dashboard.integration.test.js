
const request = require('supertest');
const app = require('../app');

const clientUser = {
  name: 'Dashboard Client',
  email: 'dashboard-client@example.com',
  password: 'SecurePass123!',
  role: 'client'
};

const freelancerUser = {
  name: 'Dashboard Freelancer',
  email: 'dashboard-freelancer@example.com',
  password: 'SecurePass123!',
  role: 'freelancer'
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

describe('Dashboard API', () => {
  describe('GET /api/dashboard', () => {
    it('requires authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard');

      expect(response.status).toBe(401);
    });

    it('returns dashboard data for an authenticated freelancer', async () => {
      const freelancer = await registerUser(freelancerUser);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${freelancer.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toEqual(expect.any(Object));
    });

    it('returns dashboard data for an authenticated client', async () => {
      const client = await registerUser(clientUser);

      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${client.token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data).toEqual(expect.any(Object));
    });

    it('returns different dashboard data according to the user role', async () => {
      const freelancer = await registerUser(freelancerUser);
      const client = await registerUser(clientUser);

      const freelancerResponse = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${freelancer.token}`);

      const clientResponse = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${client.token}`);

      expect(freelancerResponse.status).toBe(200);
      expect(clientResponse.status).toBe(200);

      expect(freelancerResponse.body.data).not.toEqual(
        clientResponse.body.data
      );
    });
  });
});
