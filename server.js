require('dotenv').config();
const app = require('./app');
const { validateEnv } = require('./config/env');
const logger = require('./services/logger');

const PORT = process.env.PORT || 5000;

try {
  validateEnv();
  app.listen(PORT, () => {
    logger.info('server_started', { port: PORT });
  });
} catch (error) {
  logger.error('server_start_failed', { message: error.message });
  process.exit(1);
}
