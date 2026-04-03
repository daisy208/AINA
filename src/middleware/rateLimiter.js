const rateLimit = require('express-rate-limit');
const { env } = require('../config');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(env.RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TooManyRequests', message: 'Too many requests, please try again later.' },
});

module.exports = rateLimiter;
