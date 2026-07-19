const express = require('express');
const { createOrder, getOrders } = require('../controllers/orderController');

const router = express.Router();

// POST /api/orders (order now)
router.post('/', createOrder);

// GET /api/orders (see all orders) – useful for admin
router.get('/', getOrders);

module.exports = router;
