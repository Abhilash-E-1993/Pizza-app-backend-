const Product = require('../schema/productSchema');

async function createProduct(productData) {
  return Product.create(productData);
}

async function getProduct(productId) {
  return Product.findById(productId).lean();
}

async function deleteProduct(productId) {
  return Product.findByIdAndDelete(productId).lean();
}

async function getAllProducts() {
  return Product.find({}).lean();
}

module.exports = {
  createProduct,
  getProduct,
  deleteProduct,
  getAllProducts,
};
