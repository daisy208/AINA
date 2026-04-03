/**
 * Winston Logger Configuration
 * Centralized structured logging for the application
 */

import { createLogger, format, transports } from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

format.combine.colorize = function () {
  // Custom colorize for console
  return format.colorize();
};

const logLevel = process.env.LOG_LEVEL || 'info';

const logger = createLogger({
  level: logLevel,
  levels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    format.errors({ stack: true }),
    format.splat()
  ),
  defaultMeta: { service: 'aina-api', environment: process.env.NODE_ENV },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ colors }),
        format.printf(
          (info) =>
            `${info.timestamp} [${info.level}] [${info.service}] ${info.message}`
        )
      ),
    }),
    // Log errors to separate file
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(format.json()),
    }),
    // Log all messages to combined file
    new transports.File({
      filename: 'logs/combined.log',
      format: format.combine(format.json()),
    }),
  ],
});

// Override console methods when not in test
if (process.env.NODE_ENV !== 'test') {
  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new transports.Console({
        format: format.combine(
          format.colorize({ colors }),
          format.printf(
            (info) =>
              `${info.timestamp} [${info.level}] [${info.service}] ${info.message}`
          )
        ),
      })
    );
  }
}

export default logger;
