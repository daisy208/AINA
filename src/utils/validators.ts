/**
 * Input Validation Schemas using Joi
 * Centralized validation for all request data
 */

import Joi from 'joi';

// Auth Validation
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
  }),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Incident Validation
export const createIncidentSchema = Joi.object({
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

// Contact Validation
export const createContactSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().optional(),
  priority: Joi.number().default(1),
});

// SOS Validation
export const createSOSSchema = Joi.object({
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  accuracy: Joi.number().optional(),
  encryptedAudioUrl: Joi.string().optional(),
  encryptionMeta: Joi.object().optional(),
  audioHash: Joi.string().optional(),
});

// Report Validation
export const createReportSchema = Joi.object({
  reportType: Joi.string().valid('legal_summary', 'investigation_report', 'pattern_analysis').required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  incidentId: Joi.string().optional(),
});

/**
 * Validate request data against schema
 */
export function validateRequest<T>(
  data: any,
  schema: Joi.Schema
): { value: T; error?: any } {
  const { value, error } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details: Record<string, string> = {};
    error.details.forEach((detail: any) => {
      details[detail.path.join('.')] = detail.message;
    });
    return { value, error: details };
  }

  return { value };
}
