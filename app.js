const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./services/logger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8081,http://localhost:19006')
  .split(',')
  .map((item) => item.trim());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

app.use(helmet());
app.use(compression());
app.use(apiLimiter);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked for this origin'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  logger.info('incoming_request', { method: req.method, url: req.originalUrl, ip: req.ip });
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'aina-api' });
});

app.use('/auth', require('./routes/authRoutes'));
app.use('/incident', require('./routes/incidentRoutes'));
app.use('/contacts', require('./routes/contactRoutes'));
app.use('/sos', require('./routes/sosRoutes'));
app.use('/report', require('./routes/reportRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
