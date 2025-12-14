const request = require('supertest');
const app = require('../server');
const sequelize = require('../database/config');
const { IpPort } = require('../database/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('IP:Port API Endpoints', () => {
  let createdId;

  describe('POST /api/ipports', () => {
    it('should create a new IP:Port combination', async () => {
      const newIpPort = {
        ioc_id: 'TEST_IP001',
        ioc_value: '192.168.1.1:8080',
        threat_type: 'botnet_cc',
        malware: 'test.malware',
        malware_printable: 'Test Malware',
        confidence_level: 85,
        first_seen_utc: new Date(),
        reporter: 'test_user'
      };

      const response = await request(app)
        .post('/api/ipports')
        .send(newIpPort)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.ioc_value).toBe(newIpPort.ioc_value);
      createdId = response.body.id;
    });

    it('should return 400 for invalid IP:Port format', async () => {
      const invalidIpPort = {
        ioc_id: 'TEST_IP002',
        ioc_value: 'invalid-ip-port',
        threat_type: 'botnet_cc',
        confidence_level: 85,
        first_seen_utc: new Date(),
        reporter: 'test_user'
      };

      await request(app)
        .post('/api/ipports')
        .send(invalidIpPort)
        .expect(400);
    });
  });

  describe('GET /api/ipports', () => {
    it('should get all IP:Port combinations', async () => {
      const response = await request(app)
        .get('/api/ipports')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/ipports/:id', () => {
    it('should get a single IP:Port by ID', async () => {
      const response = await request(app)
        .get(`/api/ipports/${createdId}`)
        .expect(200);

      expect(response.body.id).toBe(createdId);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app)
        .get('/api/ipports/99999')
        .expect(404);
    });
  });

  describe('PUT /api/ipports/:id', () => {
    it('should update an IP:Port', async () => {
      const updates = {
        confidence_level: 95
      };

      const response = await request(app)
        .put(`/api/ipports/${createdId}`)
        .send(updates)
        .expect(200);

      expect(response.body.confidence_level).toBe(95);
    });
  });

  describe('DELETE /api/ipports/:id', () => {
    it('should delete an IP:Port', async () => {
      await request(app)
        .delete(`/api/ipports/${createdId}`)
        .expect(204);

      await request(app)
        .get(`/api/ipports/${createdId}`)
        .expect(404);
    });
  });
});
