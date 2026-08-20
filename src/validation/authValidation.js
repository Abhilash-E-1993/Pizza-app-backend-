const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/serverConfig');

function isLoggedIn(req, res, next) {
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'authentication required',
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'invalid or expired token',
    });
  }
}

function isAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'admin access required',
    });
  }
  next();
}

module.exports = {
  isLoggedIn,
  isAdmin,
};
