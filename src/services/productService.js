const cloudinary = require('../config/cloudinaryConfig');
const ProductRepository = require('../repositories/productRepository');
const fs = require('fs/promises');
const mongoose = require('mongoose');

const InternalServerError = require('../utils/internalServerError');
const NotFoundError = require('../utils/notFoundError');
const AppError = require('../utils/appError');

async function createProduct(productDetails) {

    let productImage;

    // ✅ FIX: correct field name
    const imagePath = productDetails.productImage;

    if (imagePath) {
        try {
            const cloudinaryResponse = await cloudinary.uploader.upload(imagePath);
            productImage = cloudinaryResponse.secure_url;

            // delete local file
            await fs.unlink(imagePath);

        } catch (error) {
            console.log(error);
            throw new InternalServerError();
        }
    }

    const product = await ProductRepository.createProduct({
        ...productDetails,
        productImage: productImage || productDetails.productImage // ✅ safe fallback
    });

    return product;
}

async function getProductById(productId) {

    // ✅ prevent crash
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product id", 400);
    }

    // ✅ use lean inside repo OR here
    const response = await ProductRepository.getProductById(productId);

    if (!response) {
        throw new NotFoundError('Product');
    }

    return response;
}

async function deleteProductById(productId) {

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError("Invalid product id", 400);
    }

    const response = await ProductRepository.deleteProductById(productId);

    if (!response) {
        throw new NotFoundError('Product');
    }

    return response;
}

module.exports = {
    createProduct,
    getProductById,
    deleteProductById
};