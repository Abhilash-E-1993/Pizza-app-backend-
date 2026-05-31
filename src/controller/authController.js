const loginUser = require('../services/authService');

async function login(req, res) {

  try {

    const result = await loginUser(req.body);

    return res
      .cookie('token', result.token, {
        httpOnly: true,
        sameSite: 'none',
      })
      .status(200)
      .json({
        success: true,
        message: 'login successful',

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

  return res
    .clearCookie('token')
    .status(200)
    
    .json({
      success: true,
      message: 'logout successful'
    });
}

module.exports = {
  login,
  logout,
};