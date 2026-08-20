const express = require('express');
const { login, logout, verify } = require('../controller/authController');
const { isLoggedIn } = require('../validation/authValidation');

const authroute = express.Router();

authroute.post('/login', login);
authroute.post('/logout', logout);
authroute.get('/verify', isLoggedIn, verify);

module.exports = authroute;
