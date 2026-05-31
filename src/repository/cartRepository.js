const Cart = require('../schema/cartSchema');

async function findCart(userId) {
  const query = typeof userId === 'object' && userId !== null ? userId : { userId };
  return Cart.findOne(query).populate('items.product');
}

async function createCart(userId) {
  return Cart.create({ userId, items: [] });
}

module.exports = {
  findCart,
  createCart,
};
