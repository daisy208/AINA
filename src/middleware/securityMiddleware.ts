/**
 * Security Middleware
 * Implements security best practices
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getEnv } from '../config/env';

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

/**
 * Rate limiting middleware
 */
export function createRateLimiter(
  windowMs?: number,
  max?: number
) {
  const env = getEnv();
  return rateLimit({
    windowMs: windowMs || env.RATE_LIMIT_WINDOW_MS,
    max: max || env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === 'test',
    message: {
      success: false,
      error: {
        message: 'Too many requests, please try again later.',
        code: 429,
      },
    },
  });
}

/**
 * Input sanitization middleware
 * Prevents common injection attacks
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Trim whitespace from all string fields
  const sanitizeObject = (obj: any) => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  next();
}
