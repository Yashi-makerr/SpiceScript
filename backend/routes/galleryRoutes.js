const express = require('express');
const { getGalleryItems, createGalleryItem } = require('../controllers/galleryController');

const router = express.Router();

router.get('/', getGalleryItems);     // GET all gallery items
router.post('/', createGalleryItem);  // Add new gallery item

module.exports = router;
