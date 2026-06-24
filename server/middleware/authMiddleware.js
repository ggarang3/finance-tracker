const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Header format is "Bearer <token>" — grab the token part
    const token = authHeader.split(' ')[1];

    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user info to the request so routes can use it
    req.userId = decoded.userId;

    // Pass control to the next function (the actual route)
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;