const Cart = require('../schema/cartSchema');

function buildQuery(userId) {
  return typeof userId === 'object' && userId !== null ? userId : { userId };
}

// populated mongoose document (used when the cart will be mutated + saved)
async function findCart(userId) {
  return Cart.findOne(buildQuery(userId)).populate('items.product');
}

// plain mongoose document, no populate (used for add/remove mutations)
async function findCartDoc(userId) {
  return Cart.findOne(buildQuery(userId));
}

// populated plain JS object (fast read path for GET endpoints)
async function findCartLean(userId) {
  return Cart.findOne(buildQuery(userId)).populate('items.product').lean();
}

async function createCart(userId) {
  return Cart.create({ userId, items: [] });
}

module.exports = {
  findCart,
  findCartDoc,
  findCartLean,
  createCart,
};
