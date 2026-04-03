/**
 * Main index file for barrel exports
 * Centralizes exports for easier imports
 */

export { default as prisma } from './lib/prisma';
export { default as logger } from './config/logger';
export { validateEnv, getEnv } from './config/env';
export { haversineDistance, findNearbyIncidents, clusterIncidents, getBoundingBox } from './lib/geo';
export * from './utils/errors';
export { asyncHandler, withErrorHandling } from './utils/asyncHandler';
export { validate } from './middleware/validationMiddleware';
export { requireAuth, optionalAuth } from './middleware/authMiddleware';
export { errorHandler, notFoundHandler } from './middleware/errorHandler';
export { securityHeaders, createRateLimiter, sanitizeInput } from './middleware/securityMiddleware';
