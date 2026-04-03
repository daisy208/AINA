const Joi = require('joi');

module.exports = (schema) => async (req, res, next) => {
  try {
    const obj = {
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
    };

    const result = await schema.validateAsync(obj, {
      abortEarly: false,
      stripUnknown: true,
    });

    req.validated = result;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'ValidationError', message: err.details.map((d) => d.message).join(', ') });
  }
};
