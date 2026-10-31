export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (error) {
    if (error.errors) {
      const details = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details
      });
    }
    return res.status(400).json({
      success: false,
      error: 'Invalid request data'
    });
  }
};

