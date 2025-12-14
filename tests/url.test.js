const request = require('supertest');
const app = require('../server');
const sequelize = require('../database/config');
const { Url } = require('../database/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('URL API Endpoints', () => {
  let createdId;

  describe('POST /api/urls', () => {
    it('should create a new URL', async () => {
      const newUrl = {
        ioc_id: 'TEST_URL001',
        ioc_value: 'http://malicious-site.com/payload',
        threat_type: 'payload_delivery',
        malware: 'test.malware',
        malware_printable: 'Test Malware',
        confidence_level: 90,
        first_seen_utc: new Date(),
        reporter: 'test_user'
      };

      const response = await request(app)
        .post('/api/urls')
        .send(newUrl)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.ioc_value).toBe(newUrl.ioc_value);
      createdId = response.body.id;
    });
  });

  describe('GET /api/urls', () => {
    it('should get all URLs', async () => {
      const response = await request(app)
        .get('/api/urls')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/urls/:id', () => {
    it('should get a single URL by ID', async () => {
      const response = await request(app)
        .get(`/api/urls/${createdId}`)
        .expect(200);

      expect(response.body.id).toBe(createdId);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app)
        .get('/api/urls/99999')
        .expect(404);
    });
  });

  describe('PUT /api/urls/:id', () => {
    it('should update a URL', async () => {
      const updates = {
        confidence_level: 100
      };

      const response = await request(app)
        .put(`/api/urls/${createdId}`)
        .send(updates)
        .expect(200);

      expect(response.body.confidence_level).toBe(100);
    });
  });

  describe('DELETE /api/urls/:id', () => {
    it('should delete a URL', async () => {
      await request(app)
        .delete(`/api/urls/${createdId}`)
        .expect(204);

      await request(app)
        .get(`/api/urls/${createdId}`)
        .expect(404);
    });
  });
});
