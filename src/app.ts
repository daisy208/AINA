/**
 * Express Application Setup
 * Central configuration and middleware integration
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import Sentry from '@sentry/node';
import Tracing from '@sentry/tracing';
import { collectDefaultMetrics, register } from 'prom-client';

// Config
import { getEnv } from './config/env';
import logger from './config/logger';

// Middleware
import {
  securityHeaders,
  createRateLimiter,
  sanitizeInput,
} from './middleware/securityMiddleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Module routes
import authRoutes from './modules/auth/authRoutes';
import incidentRoutes from './modules/incidents/incidentRoutes';
import sosRoutes from './modules/sos/sosRoutes';
import notificationRoutes from './modules/notifications/notificationRoutes';
import reportRoutes from './modules/reports/reportRoutes';

export function createApp(): Express {
  const app = express();
  const env = getEnv();

  // Sentry error tracking initialization
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: 0.2,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app }),
      ],
    });

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }

  // Trust proxy
  app.set('trust proxy', 1);

  // Metrics
  collectDefaultMetrics();

  // Security middleware
  app.use(securityHeaders);
  app.use(helmet.contentSecurityPolicy());
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(cookieParser());

  // CORS
  const corsOptions = {
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // Request sanitization
  app.use(sanitizeInput);

  // Rate limiting
  const limiter = createRateLimiter();
  app.use('/api/v1/', limiter);

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.http('request_received', {
      method: req.method,
      path: req.path,
      ip: req.ip,
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Metrics endpoint
  app.get('/metrics', async (req: Request, res: Response) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  // API v1 routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/incidents', incidentRoutes);
  app.use('/api/v1/sos', sosRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/reports', reportRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handling middleware
  app.use(errorHandler);

  return app;
}

export default createApp;
