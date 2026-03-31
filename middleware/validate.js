module.exports = function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 400,
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        }
      });
    }

    req.body = parsed.data;
    next();
  };
};
