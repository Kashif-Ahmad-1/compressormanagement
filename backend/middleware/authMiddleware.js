
const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('../utils/tokenManager'); // Adjust the path as needed

exports.authMiddleware = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const tokenValue = token.split(' ')[1]; // Extract the actual token
  if (isTokenBlacklisted(tokenValue)) {
    return res.status(401).json({ error: 'Token has been blacklisted' });
  }

  try {
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

