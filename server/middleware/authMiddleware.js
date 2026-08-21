const jwt = require('jsonwebtoken');

/**
 * Protect a route by verifying the JWT in the Authorization header.
 * Expects:  Authorization: Bearer <token>
 * On success, sets req.user = { id, email } and calls next().
 * On failure, responds with 401.
 */
module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
