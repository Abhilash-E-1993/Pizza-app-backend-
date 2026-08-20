const loginUser = require('../services/authService');

const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// cookie options shared by login + logout (must match exactly or the browser won't clear it)
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  path: '/',
};

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days, matches JWT_EXPIRY

async function login(req, res) {

  try {

    const result = await loginUser(req.body);

    return res
      .cookie('token', result.token, { ...COOKIE_OPTIONS, maxAge: COOKIE_MAX_AGE })
      .status(200)
      .json({
        success: true,
        message: 'login successful',
        token: result.token,
        data: {
          role: result.Role,
          userData: result.userData,
        }
      });

  } catch (error) {

    return res.status(error.statuscode || 500).json({
      success: false,
      message: error.message || error.reason || 'login failed',
    });
  }
}

function logout(req, res) {

  // clearCookie must receive the same sameSite/secure/path attributes
  // used when the cookie was set, otherwise the browser keeps it
  return res
    .clearCookie('token', COOKIE_OPTIONS)
    .status(200)
    .json({
      success: true,
      message: 'logout successful'
    });
}

// lets the frontend restore the session on refresh (cookie is httpOnly, JS can't read it)
function verify(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
}

module.exports = {
  login,
  logout,
  verify,
};