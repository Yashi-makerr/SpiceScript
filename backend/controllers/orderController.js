const Order = require('../models/Order');

const createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      items,
      totalAmount,
      userId,
      paymentMethod,
      paymentStatus,
      cardDetails,
      transactionId
    } = req.body;

    // validation
    if (!customerName || !customerPhone || !address || !items || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (including payment method)'
      });
    }

    const order = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      address,
      items,
      totalAmount,
      user: userId || null,
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      cardDetails: paymentMethod === 'card' ? cardDetails : undefined,
      transactionId: paymentMethod === 'upi' ? transactionId : undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });

  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('items.menuItem');

    res.json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
};
