const {
  getcart,
  addTocartOrRemove,
  ClearCart
} = require('../services/cartService');

// ================= GET CART =================

async function getCartController(req, res) {

  try {

    // GET LOGGED IN USER ID FROM JWT

    const userId = req.user.id;

    const cart = await getcart(userId);

    return res.status(200).json({
      success: true,
      message: 'cart fetched successfully',
      data: cart,
    });

  } catch (error) {

    console.log(error);

    return res.status(
      error.statuscode || 500
    ).json({
      success: false,
      message:
        error.reason ||
        error.message ||
        'unable to fetch cart',
    });
  }
}

// ================= ADD TO CART =================

async function addToCartController(req, res) {

  try {

    // GET USER ID FROM JWT

    const userId = req.user.id;

    const productId = req.params.productId;

    const cart = await addTocartOrRemove(
      userId,
      productId,
      'add'
    );

    return res.status(200).json({
      success: true,
      message: 'product added to cart',
      data: cart,
    });

  } catch (error) {

    console.log(error);

    return res.status(
      error.statuscode || 500
    ).json({
      success: false,
      message:
        error.reason ||
        error.message ||
        'unable to add product to cart',
    });
  }
}

// ================= REMOVE FROM CART =================

async function removeFromCartController(req, res) {

  try {

    // GET USER ID FROM JWT

    const userId = req.user.id;

    const productId = req.params.productId;

    const cart = await addTocartOrRemove(
      userId,
      productId,
      'remove'
    );

    return res.status(200).json({
      success: true,
      message: 'product removed from cart',
      data: cart,
    });

  } catch (error) {

    console.log(error);

    return res.status(
      error.statuscode || 500
    ).json({
      success: false,
      message:
        error.reason ||
        error.message ||
        'unable to remove product from cart',
    });
  }
}

// ================= CLEAR CART =================

async function clearCartController(req, res) {

  try {

    // GET USER ID FROM JWT

    const userId = req.user.id;

    const cart = await ClearCart(userId);

    return res.status(200).json({
      success: true,
      message: 'cart cleared successfully',
      data: cart,
    });

  } catch (error) {

    console.log(error);

    return res.status(
      error.statuscode || 500
    ).json({
      success: false,
      message:
        error.reason ||
        error.message ||
        'unable to clear cart',
    });
  }
}

module.exports = {
  getCartController,
  addToCartController,
  removeFromCartController,
  clearCartController,
};