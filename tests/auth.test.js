const request = require('supertest');
const app = require('../server');
const sequelize = require('../database/config');
const { User } = require('../database/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Authentication API Endpoints', () => {
  let authToken;
  let userId;

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.role).toBe('analyst'); // default role
      
      authToken = response.body.token;
      userId = response.body.user.id;
    });

    it('should not register user with duplicate email', async () => {
      const duplicateUser = {
        username: 'anotheruser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(409);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidUser = {
        username: 'testuser2'
        // missing email and password
      };

      await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(credentials.email);
    });

    it('should not login with invalid password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);
    });

    it('should not login with non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PUT /api/auth/me', () => {
    it('should update user profile', async () => {
      const updates = {
        username: 'updateduser'
      };

      const response = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.user.username).toBe('updateduser');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const passwordChange = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordChange)
        .expect(200);
    });

    it('should not change password with wrong current password', async () => {
      const passwordChange = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordChange)
        .expect(401);
    });
  });
});

describe('Authorization Tests', () => {
  let analystToken;
  let researcherToken;
  let adminToken;

  beforeAll(async () => {
    // Create users with different roles
    const analyst = await User.create({
      username: 'analyst',
      email: 'analyst@example.com',
      password: 'password123',
      role: 'analyst'
    });

    const researcher = await User.create({
      username: 'researcher',
      email: 'researcher@example.com',
      password: 'password123',
      role: 'researcher'
    });

    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'test-secret';
    
    analystToken = jwt.sign({ id: analyst.id, role: analyst.role }, secret);
    researcherToken = jwt.sign({ id: researcher.id, role: researcher.role }, secret);
    adminToken = jwt.sign({ id: admin.id, role: admin.role }, secret);
  });

  describe('Role-based access control', () => {
    it('analyst should NOT be able to create SHA256', async () => {
      const newHash = {
        ioc_id: 'TEST001',
        ioc_value: 'a'.repeat(64),
        threat_type: 'payload',
        confidence_level: 95,
        first_seen_utc: new Date(),
        reporter: 'test'
      };

      await request(app)
        .post('/api/sha256')
        .set('Authorization', `Bearer ${analystToken}`)
        .send(newHash)
        .expect(403);
    });

    it('researcher should be able to create SHA256', async () => {
      const newHash = {
        ioc_id: 'TEST002',
        ioc_value: 'b'.repeat(64),
        threat_type: 'payload',
        confidence_level: 95,
        first_seen_utc: new Date(),
        reporter: 'test'
      };

      await request(app)
        .post('/api/sha256')
        .set('Authorization', `Bearer ${researcherToken}`)
        .send(newHash)
        .expect(201);
    });

    it('researcher should NOT be able to delete SHA256', async () => {
      await request(app)
        .delete('/api/sha256/1')
        .set('Authorization', `Bearer ${researcherToken}`)
        .expect(403);
    });

    it('admin should be able to delete SHA256', async () => {
      await request(app)
        .delete('/api/sha256/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });

    it('unauthenticated user should NOT access protected routes', async () => {
      const newHash = {
        ioc_id: 'TEST003',
        ioc_value: 'c'.repeat(64),
        threat_type: 'payload',
        confidence_level: 95,
        first_seen_utc: new Date(),
        reporter: 'test'
      };

      await request(app)
        .post('/api/sha256')
        .send(newHash)
        .expect(401);
    });
  });
});
