require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { validateEnv } = require('./config/env');
const logger = require('./services/logger');
const { setIO } = require('./services/realtimeService');

const PORT = process.env.PORT || 5000;

try {
  validateEnv();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: (process.env.CORS_ORIGIN || '').split(',').map((x) => x.trim()),
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    logger.info('socket_connected', { id: socket.id });
    socket.on('disconnect', () => logger.info('socket_disconnected', { id: socket.id }));
  });

  setIO(io);

  server.listen(PORT, () => {
    logger.info('server_started', { port: PORT });
  });
} catch (error) {
  logger.error('server_start_failed', { message: error.message });
  process.exit(1);
}
