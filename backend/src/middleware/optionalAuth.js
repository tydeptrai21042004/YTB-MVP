// src/middleware/optionalAuth.js
const jwt = require('jsonwebtoken');

module.exports = function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      const token = auth.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
    } catch (err) {
      // invalid token → ignore
    }
  }
  next();
};
