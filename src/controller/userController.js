const registerUser = require('../services/userService');

async function register(req, res) {
  try {
    const user = await registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'user registered successfully',
      user,
    });
  } catch (error) {
    return res.status(error.statuscode || 500).json({
      success: false,
      message: error.reason || error.message || 'user registration failed',
    });
  }
}

module.exports = {
  register,
};
