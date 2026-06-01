const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/serverConfig');

function isLoggedIn(req, res, next) {

  console.log("========== AUTH CHECK ==========");
  console.log("Cookies:", req.cookies);

  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const token = cookieToken || bearerToken;

 

  if (!token) {
    console.log("TOKEN NOT FOUND");

    return res.status(401).json({
      message: "Authentication required"
    });
  }

  try {

    const decoded = jwt.verify(token, SECRET_KEY);

   

    req.user = decoded;

    next();

  } catch (error) {

    console.log("JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

module.exports = {
  isLoggedIn,
};
