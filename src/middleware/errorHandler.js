const logger = require('../lib/logger');

const notFound = (req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
};

const errorHandler = (err, req, res, next) => {
  logger.error('unhandled_error', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  const status = err.status || 500;
  const payload = {
    error: err.name || 'ServerError',
    message: status === 500 ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  };

  res.status(status).json(payload);
};

module.exports = {
  notFound,
  errorHandler,
};
