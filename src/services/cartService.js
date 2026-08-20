const { findCartDoc, findCartLean, createCart } = require("../repository/cartRepository");
const { getProduct } = require("../repository/productRepository");

// create a cart exactly once per user; if two requests race, the unique
// index on userId makes the loser refetch instead of crashing
async function createCartSafe(userId) {
  try {
    return await createCart(userId);
  } catch (err) {
    if (err && err.code === 11000) return findCartDoc(userId);
    throw err;
  }
}

// fast read path: lean + auto-create a cart if the user doesn't have one yet
async function getcart(userId) {
  let cart = await findCartLean(userId);

  if (!cart) {
    await createCartSafe(userId);
    cart = await findCartLean(userId);
  }

  // hide items whose product was deleted from the store
  if (cart && Array.isArray(cart.items)) {
    cart.items = cart.items.filter((item) => item.product);
  }

  return cart;
}

async function getCartDocForUser(userId) {
  let cart = await findCartDoc(userId);
  if (!cart) cart = await createCartSafe(userId);
  return cart;
}

async function addTocartOrRemove(userId, productId, shouldadd) {
  const isAdd = shouldadd === 'add';
  const quantityval = isAdd ? 1 : -1;

  const cart = await getCartDocForUser(userId);

  let product = null;
  try {
    product = await getProduct(productId);
  } catch (err) {
    product = null; // invalid ObjectId etc.
  }

  if (isAdd) {
    if (!product) {
      throw { reason: 'product is not found', statuscode: 404 };
    }
    // old code used && so out-of-stock products could still be added
    if (!product.inStock || product.quantity <= 0) {
      throw { reason: 'product is not in stock', statuscode: 400 };
    }
  }

  const pid = String(productId);
  const itemIndex = cart.items.findIndex(
    (item) => item.product && String(item.product) === pid
  );

  if (itemIndex === -1) {
    if (isAdd) {
      cart.items.push({ product: product._id, quantity: 1 });
    }
    // removing an item that isn't in the cart is a safe no-op (idempotent)
  } else {
    const newQuantity = cart.items[itemIndex].quantity + quantityval;

    if (newQuantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (isAdd && product && newQuantity > product.quantity) {
        throw { reason: 'requested item quantity not available', statuscode: 400 };
      }
      cart.items[itemIndex].quantity = newQuantity;
    }
  }

  await cart.save();

  // return the populated cart so the frontend can render it directly
  return getcart(userId);
}

async function ClearCart(userId) {
  const cart = await getCartDocForUser(userId);
  cart.items = [];
  await cart.save();
  return getcart(userId);
}

module.exports = {
  getcart,
  addTocartOrRemove,
  ClearCart,
};