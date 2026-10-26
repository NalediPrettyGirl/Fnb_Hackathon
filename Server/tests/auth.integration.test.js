
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken');

const validUser = {
  name: 'Test Freelancer',
  email: 'freelancer@example.com',
  password: 'SecurePass123!',
  role: 'freelancer'
};

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('registers a freelancer and returns a JWT', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body.user).toMatchObject({
        name: validUser.name,
        email: validUser.email,
        role: 'freelancer',
        xp: 0
      });
      expect(response.body.token).toEqual(expect.any(String));
      expect(response.body.user.passwordHash).toBeUndefined();

      const savedUser = await User.findOne({
        email: validUser.email
      }).select('+passwordHash');

      expect(savedUser).not.toBeNull();
      expect(savedUser.passwordHash).not.toBe(validUser.password);
    });

    it('normalizes email addresses', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUser,
          email: '  FREELANCER@EXAMPLE.COM  '
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe(
        'freelancer@example.com'
      );
    });

    it('rejects missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test Freelancer' });

      expect(response.status).toBe(400);
    });

    it('rejects passwords shorter than eight characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, password: 'short' });

      expect(response.status).toBe(400);
    });

    it('rejects unsupported roles', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUser, role: 'admin' });

      expect(response.status).toBe(400);
    });

    it('rejects duplicate email addresses', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);
    });

    it('logs in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toEqual(expect.any(String));
      expect(response.body.user.email).toBe(validUser.email);
    });

    it('rejects an incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: validUser.email,
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
    });

    it('rejects a nonexistent account', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'missing@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Protected routes and logout', () => {
    it('rejects requests without a token', async () => {
      const response = await request(app).get('/api/dashboard');

      expect(response.status).toBe(401);
    });

    it('rejects an invalid token', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer invalid.token.value');

      expect(response.status).toBe(401);
    });

    it('logs out and revokes the current token', async () => {
      const registration = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      const token = registration.body.token;

      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logoutResponse.status).toBe(200);

      const revokedTokens = await RevokedToken.countDocuments();
      expect(revokedTokens).toBe(1);

      const protectedResponse = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(protectedResponse.status).toBe(401);
    });
  });
});
