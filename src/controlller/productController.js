const {
  productservice,
  getProductById,
  getProductsdata,
  deleteProductById,
} = require('../services/productService');

async function createProduct(req, res) {

  try {

    const product = await productservice(
      req.body,
      req.file
    );

    return res.status(201).json({
      success: true,
      message: 'product created successfully',
      data: product,
    });

  } catch (error) {

    return res.status(error.statuscode || 500).json({
      success: false,
      message:
        error.reason ||
        error.message ||
        'product creation failed',
    });
  }
}

async function getAllProducts(req, res) {

  try {

    const products = await getProductsdata();

    return res.status(200).json({
      success: true,
      message: 'products fetched successfully',
      data: products,
    });

  } catch (error) {

    return res.status(error.statuscode || 500).json({
      success: false,
      message:
        error.reason ||
        error.message ||
        'unable to fetch products',
    });
  }
}

async function getProductByIdController(req, res) {

  try {

    const product = await getProductById(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'product fetched successfully',
      data: product,
    });

  } catch (error) {

    return res.status(error.statuscode || 500).json({
      success: false,
      message:
        error.reason ||
        error.message ||
        'unable to fetch product',
    });
  }
}

async function deleteProductController(req, res) {

  try {

    const deleted = await deleteProductById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: 'product deleted successfully',
      data: deleted,
    });

  } catch (error) {

    return res.status(error.statuscode || 500).json({
      success: false,
      message:
        error.reason ||
        error.message ||
        'unable to delete product',
    });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductByIdController,
  deleteProductController,
};