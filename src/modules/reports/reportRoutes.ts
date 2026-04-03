/**
 * Reports Routes
 */

import { Router } from 'express';
import * as reportController from './reportController';
import { requireAuth } from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validationMiddleware';
import Joi from 'joi';

const router = Router();
router.use(requireAuth); // All report routes require auth

// Validation schemas
const createReportSchema = Joi.object({
  reportType: Joi.string()
    .valid('legal_summary', 'investigation_report', 'pattern_analysis')
    .required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  incidentId: Joi.string().optional(),
});

const updateReportSchema = Joi.object({
  title: Joi.string().optional(),
  content: Joi.string().optional(),
  status: Joi.string().valid('draft', 'submitted', 'reviewed').optional(),
});

// Routes
router.post('/', validate({ body: createReportSchema }), reportController.createReport);
router.get('/:id', reportController.getReport);
router.get('/', reportController.listReports);
router.patch(
  '/:id',
  validate({ body: updateReportSchema }),
  reportController.updateReport
);
router.post('/:id/submit', reportController.submitReport);
router.delete('/:id', reportController.deleteReport);

export default router;
