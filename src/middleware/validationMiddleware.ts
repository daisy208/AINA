/**
 * Validation Middleware
 * Validates request data against schemas
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/errors';
import logger from '../config/logger';

export interface ValidationOptions {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
}

/**
 * Create validation middleware for request data
 */
export function validate(options: ValidationOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: Record<string, any> = {};

      // Validate body
      if (options.body) {
        const { error, value } = options.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          error.details.forEach((detail: any) => {
            errors[detail.path.join('.')] = detail.message;
          });
        }
        req.body = value;
      }

      // Validate query parameters
      if (options.query) {
        const { error, value } = options.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          error.details.forEach((detail: any) => {
            errors['query.' + detail.path.join('.')] = detail.message;
          });
        }
        req.query = value;
      }

      // Validate URL parameters
      if (options.params) {
        const { error, value } = options.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          error.details.forEach((detail: any) => {
            errors['params.' + detail.path.join('.')] = detail.message;
          });
        }
        req.params = value;
      }

      // If there are validation errors, throw
      if (Object.keys(errors).length > 0) {
        logger.warn('validation_error', {
          url: req.originalUrl,
          errors,
        });
        throw new ValidationError('Validation failed', errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
