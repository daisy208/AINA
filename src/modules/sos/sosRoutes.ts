/**
 * SOS Routes
 */

import { Router } from 'express';
import * as sosController from './sosController';
import { requireAuth } from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validationMiddleware';
import Joi from 'joi';

const router = Router();
router.use(requireAuth); // All SOS routes require auth

// Validation schemas
const triggerSOSSchema = Joi.object({
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  accuracy: Joi.number().optional(),
  encryptedAudioUrl: Joi.string().optional(),
  encryptionMeta: Joi.object().optional(),
  audioHash: Joi.string().optional(),
});

// Routes
router.post('/', validate({ body: triggerSOSSchema }), sosController.triggerSOS);
router.get('/:id', sosController.getSOS);
router.get('/', sosController.listSOS);
router.patch('/:id/resolve', sosController.resolveSOS);

export default router;
