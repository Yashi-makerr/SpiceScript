const GalleryItem = require('../models/GalleryItem');

const getGalleryItems = async (req, res, next) => {
  try {
    const items = await GalleryItem.find();
    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    next(error);
  }
};

const createGalleryItem = async (req, res, next) => {
  try {
    const { title, imageUrl, description } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and imageUrl"
      });
    }

    const item = await GalleryItem.create({
      title,
      imageUrl,
      description
    });

    res.status(201).json({
      success: true,
      message: "Gallery item added",
      item
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGalleryItems,
  createGalleryItem
};
