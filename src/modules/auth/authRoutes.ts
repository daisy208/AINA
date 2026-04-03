/**
 * Authentication Routes
 */

import { Router } from 'express';
import * as authController from './authController';
import { validate } from '../../middleware/validationMiddleware';
import { requireAuth } from '../../middleware/authMiddleware';
import Joi from 'joi';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
});

// Routes
router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/refresh', validate({ body: refreshSchema }), authController.refreshToken);
router.post('/logout', requireAuth, validate({ body: refreshSchema }), authController.logout);
router.get('/profile', requireAuth, authController.getProfile);
router.patch('/profile', requireAuth, validate({ body: updateProfileSchema }), authController.updateProfile);

export default router;
