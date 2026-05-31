const express = require('express');
const { register } = require('../controller/userController');

const userrouter = express.Router();

userrouter.post('/register', register);

module.exports = userrouter;
