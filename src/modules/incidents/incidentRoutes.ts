/**
 * Incidents Routes
 */

import { Router } from 'express';
import * as incidentController from './incidentController';
import { requireAuth } from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validationMiddleware';
import Joi from 'joi';

const router = Router();
router.use(requireAuth); // All incident routes require auth

// Validation schemas
const createIncidentSchema = Joi.object({
  type: Joi.string().required(),
  description: Joi.string().optional(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  category: Joi.string().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  encryptedText: Joi.string().optional(),
  encryptedFileUrl: Joi.string().optional(),
  evidenceHash: Joi.string().required(),
  evidenceMimeType: Joi.string().optional(),
  encryptionMeta: Joi.object().optional(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('reported', 'investigating', 'resolved').required(),
});

// Routes
router.post('/', validate({ body: createIncidentSchema }), incidentController.createIncident);
router.get('/nearby', incidentController.getNearbyIncidents);
router.get('/hotspots', incidentController.getHotspots);
router.get('/:id/insights', incidentController.getIncidentInsights);
router.get('/:id', incidentController.getIncident);
router.get('/', incidentController.listIncidents);
router.patch('/:id/status', validate({ body: updateStatusSchema }), incidentController.updateIncidentStatus);

export default router;
