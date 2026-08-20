const Order = require('../schema/orderSchema');

async function createOrder(orderData) {
  return Order.create(orderData);
}

async function getOrderByUserId(userId) {
  return Order.find({ userId })
    .populate('items.product')
    .sort({ createdAt: -1 }) // newest orders first
    .lean();
}

async function getOrderdetails(orderId) {
  return Order.findById(orderId).populate('items.product').lean();
}

async function UpdateOrderstatus(orderId, status) {
  return Order.findByIdAndUpdate(orderId, { status }, { new: true }).lean();
}

module.exports = {
  createOrder,
  getOrderByUserId,
  getOrderdetails,
  UpdateOrderstatus,
};
