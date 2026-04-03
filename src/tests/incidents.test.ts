/**
 * Incidents Module Tests
 * Tests for incident service and controller
 */

import request from 'supertest';
import { createApp } from '../../src/app';
import prisma from '../../src/lib/prisma';
import * as authService from '../../src/modules/auth/authService';
import * as incidentService from '../../src/modules/incidents/incidentService';

const app = createApp();

describe('Incidents Module', () => {
  let userId: string;
  let token: string;

  beforeEach(async () => {
    const result = await authService.register({
      email: `incident-test-${Date.now()}@example.com`,
      password: 'password123456',
    });
    userId = result.user.id;
    token = result.accessToken;
  });

  afterEach(async () => {
    await prisma.incident.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/incidents', () => {
    it('should create an incident', async () => {
      const response = await request(app)
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'theft',
          description: 'Test incident',
          severity: 'high',
          latitude: 51.5074,
          longitude: -0.1278,
          evidenceHash: 'abc123def456',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('theft');
      expect(response.body.data.severity).toBe('high');
    });

    it('should reject request without auth token', async () => {
      const response = await request(app).post('/api/v1/incidents').send({
        type: 'theft',
        evidenceHash: 'abc123',
      });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'theft',
          // Missing evidenceHash
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/incidents', () => {
    beforeEach(async () => {
      await incidentService.createIncident(userId, {
        type: 'theft',
        severity: 'high',
        evidenceHash: 'hash1',
      });
      await incidentService.createIncident(userId, {
        type: 'assault',
        severity: 'critical',
        evidenceHash: 'hash2',
      });
    });

    it('should list user incidents', async () => {
      const response = await request(app)
        .get('/api/v1/incidents')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data.length).toBe(2);
    });

    it('should filter incidents by severity', async () => {
      const response = await request(app)
        .get('/api/v1/incidents?severity=critical')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.data[0].severity).toBe('critical');
    });
  });

  describe('GET /api/v1/incidents/:id', () => {
    let incidentId: string;

    beforeEach(async () => {
      const incident = await incidentService.createIncident(userId, {
        type: 'accident',
        evidenceHash: 'hash123',
      });
      incidentId = incident.id;
    });

    it('should get incident details', async () => {
      const response = await request(app)
        .get(`/api/v1/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(incidentId);
      expect(response.body.data.type).toBe('accident');
    });

    it('should return 404 for nonexistent incident', async () => {
      const response = await request(app)
        .get('/api/v1/incidents/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
