const Product = require('../schema/productSchema');
const BadRequestError = require('../utils/badRequestError');
const InternalServerError = require('../utils/internalServerError');

async function createProduct(productDetails) {
    try {
        const response = await Product.create(productDetails);
        return response;
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errorMessageList = Object.keys(error.errors).map((property) => {
                return error.errors[property].message;
            });
            throw new BadRequestError(errorMessageList);
        }

        console.log(error);
        throw new InternalServerError();
    }
}

async function getProductById(productId) {
    try {
        // ✅ FIX: lean added
        const product = await Product.findById(productId).lean();
        
        return product;
    } catch (error) {
        console.log(error);
        throw new InternalServerError();
    }
}

async function deleteProductById(productId) {
    try {
        // ✅ FIX: lean added
        const response = await Product.findByIdAndDelete(productId).lean();
        return response;
    } catch (error) {
        console.log(error);
        throw new InternalServerError();
    }
}

module.exports = {
    createProduct,
    getProductById,
    deleteProductById
};