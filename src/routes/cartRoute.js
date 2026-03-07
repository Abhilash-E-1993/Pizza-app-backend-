const express = require('express');
const { createCart } = require('../controllers/cartController');

const cartRouter = express.Router();

cartRouter.post('/', createCart);



module.exports = cartRouter;