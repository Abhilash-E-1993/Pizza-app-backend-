const Product = require('../schema/productSchema');

async function createProduct(productData) {
  return Product.create(productData);
}

async function getProduct(productId) {
  return Product.findById(productId);
}

async function deleteProduct(productId) {
  return Product.findByIdAndDelete(productId);
}

async function getAllProducts() {
  return Product.find({});
}

module.exports = {
  createProduct,
  getProduct,
  deleteProduct,
  getAllProducts,
};
