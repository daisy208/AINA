/**
 * Environment Configuration & Validation
 * Validates required env vars at startup using Zod schema
 */

import { z } from 'zod';
import logger from './logger';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('5000').transform(Number),
  
  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),
  
  // Redis
  REDIS_URL: z.string().url('Invalid REDIS_URL'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_ISSUER: z.string().default('aina-api'),
  JWT_AUDIENCE: z.string().default('aina-mobile'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:8081,http://localhost:19006'),
  
  // Sentry
  SENTRY_DSN: z.string().url().optional().or(z.literal('')).default(''),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.string().default('300').transform(Number),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  
  // AWS/Cloudinary (optional for file upload)
  CLOUDINARY_URL: z.string().optional().or(z.literal('')).default(''),
  
  // Twilio (optional for SMS)
  TWILIO_ACCOUNT_SID: z.string().optional().or(z.literal('')).default(''),
  TWILIO_AUTH_TOKEN: z.string().optional().or(z.literal('')).default(''),
  TWILIO_PHONE_NUMBER: z.string().optional().or(z.literal('')).default(''),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env;

export function validateEnv(): Env {
  try {
    validatedEnv = envSchema.parse(process.env);
    logger.info('Environment validation successful');
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors
        .map((err) => `${err.path.join('.')} - ${err.message}`)
        .join('; ');
      logger.error(`Invalid environment configuration: ${missing}`);
    }
    throw error;
  }
}

export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error('Environment not validated. Call validateEnv() first.');
  }
  return validatedEnv;
}
