/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user information
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors';
import { getEnv } from '../config/env';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AuthenticationError('No authentication token provided');
    }

    const env = getEnv();
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    }) as any;

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token');
    }
    throw error;
  }
}

/**
 * Optional authentication - doesn't fail if token is missing
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (token) {
      const env = getEnv();
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      }) as any;

      req.user = {
        id: decoded.sub,
        email: decoded.email,
      };
    }
  } catch (error) {
    // Silently ignore token errors in optional auth
  }
  next();
}

/**
 * Extract JWT token from request
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check cookie if header not present
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
}
