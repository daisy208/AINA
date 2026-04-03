const Joi = require('joi');

const locationSchema = Joi.object({
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
});

const createIncidentSchema = Joi.object({
  body: Joi.object({
    type: Joi.string().required(),
    category: Joi.string().required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('low'),
    description: Joi.string().max(1000).optional(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    timestamp: Joi.date().optional(),
    riskScore: Joi.number().min(0).max(100).optional(),
  }),
});

const nearbyIncidentQuerySchema = Joi.object({
  query: Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    radiusKm: Joi.number().min(0.1).max(100).default(5),
    category: Joi.string().optional(),
  }),
});

module.exports = {
  createIncidentSchema,
  nearbyIncidentQuerySchema,
};
