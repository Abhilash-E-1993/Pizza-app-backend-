const { getCart, modifyCart, clearProductsFromCart } = require("../services/cartService");
const AppError = require("../utils/appError");


// GET USER CART
async function getCartByUser(req, res) {

    try {

        const cart = await getCart(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Successfully fetched the cart",
            error: {},
            data: cart
        });

    } catch (error) {

        console.log(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error: error,
                data: {}
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error,
            data: {}
        });
    }
}


// ADD / REMOVE PRODUCT FROM CART
async function modifyProductTocart(req, res) {

    try {

        const operation = req.params.operation;
        const shouldAdd = operation === "add";

        const cart = await modifyCart(
            req.user.id,
            req.params.productId,
            shouldAdd
        );

        const message = shouldAdd
            ? "Product successfully added to cart"
            : "Product successfully removed from cart";

        return res.status(200).json({
            success: true,
            message: message,
            error: {},
            data: cart
        });

    } catch (error) {

        console.log(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error: error,
                data: {}
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error,
            data: {}
        });
    }
}


// CLEAR CART
async function clearCartbyId(req, res) {

    try {

        const cart = await clearProductsFromCart(req.user.id);

        return res.status(200).json({
            success: true,
            message: "Successfully cleared all products from the cart",
            error: {},
            data: cart
        });

    } catch (error) {

        console.log(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error: error,
                data: {}
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error,
            data: {}
        });
    }
}


module.exports = {
    getCartByUser,
    modifyProductTocart,
    clearCartbyId
};