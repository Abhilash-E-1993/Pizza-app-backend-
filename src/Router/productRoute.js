const express = require('express');
const uploader = require('../middlewares/multerMiddleware');
const {
  createProduct,
  getAllProducts,
  getProductByIdController,
  deleteProductController,
} = require('../controlller/productController');

const productroute = express.Router();

productroute.post('/create', uploader.single('image'), createProduct);
productroute.get('/', getAllProducts);
productroute.get('/:id', getProductByIdController);
productroute.delete('/delete/:id', deleteProductController);

module.exports = productroute;
