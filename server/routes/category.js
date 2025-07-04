const express = require('express');
const Category = require('../models/Category');
const { requireAdmin } = require('../auth/middleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const uploadCloud = multer({ storage: cloudinaryStorage });

// Get all categories
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 20;
    const skip = (page - 1) * limit;
    const total = await Category.countDocuments();
    const categories = await Category.find().skip(skip).limit(limit);
    res.json({ data: categories, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new category
router.post('/', [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('slug').isString().trim().notEmpty().withMessage('Slug is required'),
  body('description').optional().trim().escape(),
  body('image_url').optional().trim(),
], requireAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update category
router.put('/:id', [
  body('name').optional().isString().trim().notEmpty().withMessage('Name is required'),
  body('slug').optional().isString().trim().notEmpty().withMessage('Slug is required'),
  body('description').optional().trim().escape(),
  body('image_url').optional().trim(),
], requireAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// העלאת תמונה לקטגוריה
router.post('/upload-image', requireAdmin, (req, res, next) => {
  uploadCloud.single('image')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // מחזיר את ה-URL המלא של התמונה מ-Cloudinary
    const imageUrl = req.file.path;
    res.json({ imageUrl });
  });
});

module.exports = router; 