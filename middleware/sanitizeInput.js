function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value
      .replace(/<[^>]*>?/gm, '')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    const cleaned = {};
    Object.keys(value).forEach((key) => {
      cleaned[key] = sanitizeValue(value[key]);
    });
    return cleaned;
  }

  return value;
}

module.exports = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  next();
};
