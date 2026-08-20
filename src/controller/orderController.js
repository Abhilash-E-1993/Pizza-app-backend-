const {
  Createorder,
  getallOrders,
  getOrderByid,
  updateOrderstatus
} = require('../services/orderService');

// ================= CREATE ORDER =================

async function createOrderController(req, res) {

  try {

    // GET USER ID FROM JWT

    const userId = req.user.id;

    const order = await Createorder(
      userId,
      req.body.paymentMethod || 'CASH_ON_DELIVERY',
      req.body.address // optional: lets the frontend collect a delivery address at checkout
    );

    return res.status(201).json({
      success: true,
      message: 'order created successfully',
      data: order,
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
        'unable to create order',
    });
  }
}

// ================= GET USER ORDERS =================

async function getUserOrdersController(req, res) {

  try {

    // GET USER ID FROM JWT

    const userId = req.user.id;

    const orders = await getallOrders(userId);

    return res.status(200).json({
      success: true,
      message: 'orders fetched successfully',
      data: orders,
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
        'unable to fetch orders',
    });
  }
}

// ================= GET ORDER BY ID =================

async function getOrderByIdController(req, res) {

  try {

    const order = await getOrderByid(
      req.params.orderId
    );

    return res.status(200).json({
      success: true,
      message: 'order fetched successfully',
      data: order,
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
        'unable to fetch order',
    });
  }
}

// ================= UPDATE ORDER STATUS =================

async function updateOrderStatusController(req, res) {

  try {

    const order = await updateOrderstatus(
      req.params.orderId,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: 'order updated successfully',
      data: order,
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
        'unable to update order status',
    });
  }
}

module.exports = {
  createOrderController,
  getUserOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
};