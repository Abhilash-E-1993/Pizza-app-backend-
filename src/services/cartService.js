const { getCartByUserId, createcart, clearCart } = require("../repositories/cartRepository");
const { getProductById } = require("../repositories/productRepository");

const AppError = require("../utils/appError");
const BadRequestError = require("../utils/badRequestError");
const NotFoundError = require("../utils/notFoundError");


// GET CART
async function getCart(userId) {

    let cart = await getCartByUserId(userId);

    // ⭐ If cart does not exist → create it
    if (!cart) {
        cart = await createcart(userId);
    }

    return cart;
}


// MODIFY CART
async function modifyCart(userId, productId, shouldAdd = true) {

    const quantityValue = shouldAdd ? 1 : -1;

    const cart = await getCart(userId);

    const product = await getProductById(productId);

    if (!product) {
        throw new NotFoundError("Product");
    }

    if (!product.inStock) {
        throw new BadRequestError(["Product not in stock"]);
    }

    let foundProduct = false;

    cart.items.forEach((item) => {

        if (item.product._id == productId) {

            if (shouldAdd) {
                item.quantity += quantityValue;
            } else {

                item.quantity += quantityValue;

                if (item.quantity <= 0) {
                    cart.items = cart.items.filter(
                        (item) => item.product._id != productId
                    );
                }
            }

            foundProduct = true;
        }
    });

    if (!foundProduct && shouldAdd) {
        cart.items.push({
            product: productId,
            quantity: 1
        });
    }

    await cart.save();

    return cart;
}


// CLEAR CART
async function clearProductsFromCart(userId) {

    const response = await clearCart(userId);

    return response;
}


module.exports = {
    getCart,
    modifyCart,
    clearProductsFromCart
};