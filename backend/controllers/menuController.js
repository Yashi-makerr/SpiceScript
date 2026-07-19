const MenuItem = require('../models/MenuItem');

// GET /api/menu  or /api/menu?category=pizza
const getMenuItems = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const items = await MenuItem.find(filter);

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/menu
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price and category',
      });
    }

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/menu/:id
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  createMenuItem,
  deleteMenuItem,
};
