const { findCart } = require('../repository/cartRepository');
const { createOrder, getOrderByUserId, getOrderdetails, UpdateOrderstatus } = require('../repository/orderRepository');
const { findUser } = require('../repository/userRepository');

async function Createorder(userId, paymentMethod) {
  const cart = await findCart(userId);
  const user = await findUser({ _id: userId });

  if (!cart) {
    throw { reason: 'Cart not found for this User', statuscode: 404 };
  }

  if (!cart.items || cart.items.length === 0) {
    throw { reason: 'cart is empty.Please add some products', statuscode: 400 };
  }

  const orderObj = {
    userId: cart.userId,
    items: cart.items,
    TotalPrice: 0,
    address: user?.address,
    status: 'ORDERED',
    paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
  };

  orderObj.TotalPrice = cart.items.reduce((total, cartItem) => {
    const price = cartItem.product?.price || 0;
    return total + cartItem.quantity * price;
  }, 0);

  const order = await createOrder(orderObj);

  if (!order) {
    throw { reason: 'order is not placed', statuscode: 500 };
  }

  return order;
}

async function getallOrders(userid) {
  const orders = await getOrderByUserId(userid);

  if (!orders || orders.length === 0) {
    throw { reason: 'NO oders found', statuscode: 404 };
  }

  return orders;
}

async function getOrderByid(orderId) {
  const order = await getOrderdetails(orderId);

  if (!order) {
    throw { reason: 'NO oders found', statuscode: 404 };
  }

  return order;
}

async function updateOrderstatus(orderId, status) {
  const order = await UpdateOrderstatus(orderId, status);

  if (!order) {
    throw { reason: 'Not able to update the order status', statuscode: 400 };
  }

  return order;
}

module.exports = {
  Createorder,
  getallOrders,
  getOrderByid,
  updateOrderstatus,
};