const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret'; // ensure same secret as used for signing

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ result: false, message: 'No token provided' });
  }

  // Expect format "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ result: false, message: 'Invalid token format' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log('JWT decoded payload:', decoded);

    req.user = decoded;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token expired'
      : 'Invalid token';
    console.error('JWT error:', err.message);
    return res.status(401).json({ result: false, message });
  }
}

module.exports = authMiddleware;