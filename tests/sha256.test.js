const request = require('supertest');
const app = require('../server');
const sequelize = require('../database/config');
const { Sha256 } = require('../database/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('SHA256 API Endpoints', () => {
  let createdId;

  describe('POST /api/sha256', () => {
    it('should create a new SHA256 hash', async () => {
      const newHash = {
        ioc_id: 'TEST001',
        ioc_value: 'a'.repeat(64),
        threat_type: 'payload',
        malware: 'test.malware',
        malware_printable: 'Test Malware',
        confidence_level: 95,
        first_seen_utc: new Date(),
        reporter: 'test_user'
      };

      const response = await request(app)
        .post('/api/sha256')
        .send(newHash)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.ioc_value).toBe(newHash.ioc_value);
      expect(response.body.confidence_level).toBe(95);
      createdId = response.body.id;
    });

    it('should return 400 for invalid SHA256 hash', async () => {
      const invalidHash = {
        ioc_id: 'TEST002',
        ioc_value: 'invalid',
        threat_type: 'payload',
        confidence_level: 95,
        first_seen_utc: new Date(),
        reporter: 'test_user'
      };

      await request(app)
        .post('/api/sha256')
        .send(invalidHash)
        .expect(400);
    });
  });

  describe('GET /api/sha256', () => {
    it('should get all SHA256 hashes', async () => {
      const response = await request(app)
        .get('/api/sha256')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by threat_type', async () => {
      const response = await request(app)
        .get('/api/sha256?threat_type=payload')
        .expect(200);

      expect(response.body.data.every(item => item.threat_type === 'payload')).toBe(true);
    });
  });

  describe('GET /api/sha256/:id', () => {
    it('should get a single SHA256 hash by ID', async () => {
      const response = await request(app)
        .get(`/api/sha256/${createdId}`)
        .expect(200);

      expect(response.body.id).toBe(createdId);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app)
        .get('/api/sha256/99999')
        .expect(404);
    });
  });

  describe('PUT /api/sha256/:id', () => {
    it('should update a SHA256 hash', async () => {
      const updates = {
        confidence_level: 100
      };

      const response = await request(app)
        .put(`/api/sha256/${createdId}`)
        .send(updates)
        .expect(200);

      expect(response.body.confidence_level).toBe(100);
    });
  });

  describe('DELETE /api/sha256/:id', () => {
    it('should delete a SHA256 hash', async () => {
      await request(app)
        .delete(`/api/sha256/${createdId}`)
        .expect(204);

      await request(app)
        .get(`/api/sha256/${createdId}`)
        .expect(404);
    });
  });
});
