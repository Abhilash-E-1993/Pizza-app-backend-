const express = require('express');
const { register } = require('../controlller/userController');

const userrouter = express.Router();

userrouter.post('/register', register);

module.exports = userrouter;
