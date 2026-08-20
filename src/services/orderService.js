const { findCart } = require('../repository/cartRepository');
const { createOrder, getOrderByUserId, getOrderdetails, UpdateOrderstatus } = require('../repository/orderRepository');
const { findUser } = require('../repository/userRepository');

const ALLOWED_STATUS = ['ORDERED', 'CANCELLED', 'DELIVERD', 'PROCESSING', 'OUT_OF_DELIVERY'];
const ALLOWED_PAYMENT_METHODS = ['CASH_ON_DELIVERY', 'ONLINE'];

async function Createorder(userId, paymentMethod, address) {
  if (paymentMethod && !ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
    throw { reason: 'invalid payment method', statuscode: 400 };
  }

  const cart = await findCart(userId);

  if (!cart) {
    throw { reason: 'cart not found for this user', statuscode: 404 };
  }

  // ignore cart items whose product was deleted from the store
  const validItems = (cart.items || []).filter((item) => item.product);

  if (validItems.length === 0) {
    throw { reason: 'cart is empty. please add some products', statuscode: 400 };
  }

  // only hit the users collection if the frontend didn't send an address
  let deliveryAddress = address;
  if (!deliveryAddress) {
    const user = await findUser({ _id: userId });
    deliveryAddress = user?.address;
  }

  if (!deliveryAddress || deliveryAddress.trim().length < 10) {
    throw {
      reason: 'delivery address is required (minimum 10 characters). please update your address before ordering',
      statuscode: 400,
    };
  }

  const totalPrice = validItems.reduce((total, cartItem) => {
    const price = cartItem.product?.price || 0;
    return total + cartItem.quantity * price;
  }, 0);

  const order = await createOrder({
    userId: cart.userId,
    items: validItems.map((item) => ({ product: item.product._id, quantity: item.quantity })),
    TotalPrice: totalPrice,
    address: deliveryAddress,
    status: 'ORDERED',
    paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
  });

  if (!order) {
    throw { reason: 'order is not placed', statuscode: 500 };
  }

  // clear the cart once the order is placed (old code left items behind -> duplicate orders)
  cart.items = [];
  await cart.save();

  return order;
}

async function getallOrders(userid) {
  // an empty list is a valid state, not an error — returning 404 here made the
  // frontend show an error toast every time a user with no orders opened the page
  const orders = await getOrderByUserId(userid);
  return orders || [];
}

async function getOrderByid(orderId) {
  let order;
  try {
    order = await getOrderdetails(orderId);
  } catch (err) {
    if (err && err.name === 'CastError') {
      throw { reason: 'invalid order id', statuscode: 400 };
    }
    throw err;
  }

  if (!order) {
    throw { reason: 'no order found with this id', statuscode: 404 };
  }

  return order;
}

async function updateOrderstatus(orderId, status) {
  if (!ALLOWED_STATUS.includes(status)) {
    throw {
      reason: `invalid status. allowed values: ${ALLOWED_STATUS.join(', ')}`,
      statuscode: 400,
    };
  }

  const order = await UpdateOrderstatus(orderId, status);

  if (!order) {
    throw { reason: 'order not found. not able to update the order status', statuscode: 404 };
  }

  return order;
}

module.exports = {
  Createorder,
  getallOrders,
  getOrderByid,
  updateOrderstatus,
};