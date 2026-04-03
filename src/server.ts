/**
 * Server Entry Point
 * Initializes Express app and starts HTTP server
 */

import 'dotenv/config';
import http from 'http';
import prisma from './lib/prisma';
import logger from './config/logger';
import { validateEnv, getEnv } from './config/env';
import { createApp } from './app';

async function main() {
  try {
    // Validate environment
    validateEnv();
    const env = getEnv();

    logger.info('application_start', { nodeEnv: env.NODE_ENV });

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Start server
    server.listen(env.PORT, () => {
      logger.info('server_listening', { port: env.PORT });
    });

    // Graceful shutdown
    async function shutdown(signal: string) {
      logger.info('shutdown_signal', { signal });

      server.close(async () => {
        logger.info('server_closed');

        try {
          await prisma.$disconnect();
          logger.info('database_disconnected');
        } catch (error) {
          logger.error('database_disconnect_failed', {
            error: (error as Error).message,
          });
        }

        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('forced_shutdown', { reason: 'timeout' });
        process.exit(1);
      }, 30000);
    }

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason: any) => {
      logger.error('unhandled_rejection', {
        reason: reason?.message || String(reason),
      });
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('uncaught_exception', {
        message: error.message,
        stack: error.stack,
      });
      process.exit(1);
    });
  } catch (error) {
    logger.error('application_startup_failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    process.exit(1);
  }
}

main();
