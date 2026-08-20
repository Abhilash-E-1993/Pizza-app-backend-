const express = require('express');
const uploader = require('../middlewares/multerMiddleware');
const {
  createProduct,
  getAllProducts,
  getProductByIdController,
  deleteProductController,
} = require('../controller/productController');
const { isLoggedIn, isAdmin } = require('../validation/authValidation');

const productroute = express.Router();

// create/delete were public before — anyone could modify the store. now admin-only.
productroute.post('/create', isLoggedIn, isAdmin, uploader.single('image'), createProduct);
productroute.get('/', getAllProducts);
productroute.get('/:id', getProductByIdController);
productroute.delete('/delete/:id', isLoggedIn, isAdmin, deleteProductController);

module.exports = productroute;
