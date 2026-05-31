const express = require('express');

const {
  getCartController,
  addToCartController,
  removeFromCartController,
  clearCartController,
} = require('../controlller/cartController');

const {
  isLoggedIn
} = require('../validation/authValidation');

const cartrouter = express.Router();

// ================= GET CART =================

cartrouter.get(
  '/',
  isLoggedIn,
  getCartController
);

// ================= ADD TO CART =================

cartrouter.post(
  '/add/:productId',
  isLoggedIn,
  addToCartController
);

// ================= REMOVE FROM CART =================

cartrouter.post(
  '/remove/:productId',
  isLoggedIn,
  removeFromCartController
);

// ================= CLEAR CART =================

cartrouter.delete(
  '/clear',
  isLoggedIn,
  clearCartController
);

module.exports = cartrouter;