const express = require('express');

const {
  createOrderController,
  getUserOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
} = require('../controlller/orderController');

const {
  isLoggedIn
} = require('../validation/authValidation');

const orderrouter = express.Router();

// ================= CREATE ORDER =================

orderrouter.post(
  '/',
  isLoggedIn,
  createOrderController
);

// ================= GET USER ORDERS =================

orderrouter.get(
  '/',
  isLoggedIn,
  getUserOrdersController
);

// ================= GET ORDER DETAILS =================

orderrouter.get(
  '/details/:orderId',
  isLoggedIn,
  getOrderByIdController
);

// ================= UPDATE ORDER STATUS =================

orderrouter.patch(
  '/:orderId/status',
  isLoggedIn,
  updateOrderStatusController
);

module.exports = orderrouter;