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

  // Handle cases where token string might be empty or literal "null"/"undefined"
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Normalize user ID format so req.user.id and req.user._id both work smoothly
    const userId = decoded.id || decoded._id;

    req.user = {
      ...decoded,
      id: userId,
      _id: userId,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired, please log in again' });
    }
    return res.status(401).json({ message: 'Token is not valid' });
  }
};
