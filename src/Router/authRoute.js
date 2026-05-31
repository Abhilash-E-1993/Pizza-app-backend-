const express = require('express');
const { login, logout } = require('../controlller/authController');

const authroute = express.Router();

authroute.post('/login', login);
authroute.post('/logout', logout);

module.exports = authroute;
