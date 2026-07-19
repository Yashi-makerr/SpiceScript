const express = require('express');
const { getMenuItems, createMenuItem, deleteMenuItem } = require('../controllers/menuController');

const router = express.Router();

// GET all items or filter by category
// /api/menu
// /api/menu?category=pizza
// /api/menu?category=burger
router.get('/', getMenuItems);

// POST new menu item
router.post('/', createMenuItem);

// DELETE menu item
router.delete('/:id', deleteMenuItem);

module.exports = router;
