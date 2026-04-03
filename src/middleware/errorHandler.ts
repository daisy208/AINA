/**
 * Error Handling Middleware
 * Centralized error handling for all routes
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal server error';
  const isOperational = err instanceof AppError ? err.isOperational : false;

  // Log error
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  };

  if (statusCode >= 500) {
    logger.error('request_error', logData);
  } else {
    logger.warn('request_error', logData);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: statusCode,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.originalUrl}`,
      code: 404,
    },
  });
}
