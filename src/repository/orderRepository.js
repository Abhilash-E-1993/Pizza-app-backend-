const Order = require('../schema/orderSchema');

async function createOrder(orderData) {
  return Order.create(orderData);
}

async function getOrderByUserId(userId) {
  return Order.find({ userId }).populate('items.product');
}

async function getOrderdetails(orderId) {
  return Order.findById(orderId).populate('items.product');
}

async function UpdateOrderstatus(orderId, status) {
  return Order.findByIdAndUpdate(orderId, { status }, { new: true });
}

module.exports = {
  createOrder,
  getOrderByUserId,
  getOrderdetails,
  UpdateOrderstatus,
};
