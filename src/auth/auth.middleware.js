const jwt = require('jsonwebtoken');
const config = require('../config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Access token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid access token' });
    } else {
      console.error('JWT verification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded;
    next();
  } catch (error) {
    // For optional auth, we don't fail on invalid tokens
    req.user = null;
    next();
  }
};

module.exports = authMiddleware;
module.exports.optional = optionalAuthMiddleware;