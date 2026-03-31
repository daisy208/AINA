const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || 'aina-api',
      audience: process.env.JWT_AUDIENCE || 'aina-mobile'
    });

    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    req.user = { id: decoded.sub };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
