const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(5000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  RATE_LIMIT_MAX: Joi.number().integer().positive().default(300),
  CORS_ORIGIN: Joi.string().default('http://localhost:8081,http://localhost:19006'),
  SENTRY_DSN: Joi.string().uri().optional().allow(''),
  REDIS_URL: Joi.string().uri().optional().allow(''),
  SOCKET_IO_PATH: Joi.string().default('/socket.io'),
}).unknown();

const { value: envVars, error } = envSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
});

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

module.exports = {
  env: envVars,
  isProd: envVars.NODE_ENV === 'production',
};
