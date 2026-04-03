const { createLogger, format, transports } = require('winston');
const { env, isProd } = require('../config');

const logger = createLogger({
  level: isProd ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [new transports.Console()],
  exitOnError: false,
});

module.exports = logger;
