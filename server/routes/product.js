const express = require('express');
const Product = require('../models/Product');
const { requireAdmin } = require('../auth/middleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');

// הגדרת multer לשמירת קבצים בתיקיית uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
    }
    cb(null, true);
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 20;
    const skip = (page - 1) * limit;
    const total = await Product.countDocuments();
    const products = await Product.find().skip(skip).limit(limit);
    res.json({ data: products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new product
router.post('/', [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('base_weight').isNumeric().withMessage('Base weight must be a number'),
  body('base_price').isNumeric().withMessage('Base price must be a number'),
  body('weight_step').isNumeric().withMessage('Weight step must be a number'),
  body('description').optional().trim().escape(),
  body('image').optional().trim(),
], requireAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const productData = { ...req.body };
    if (req.body.image) {
      productData.image = req.body.image;
    }
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update product
router.put('/:id', [
  body('name').optional().isString().trim().notEmpty().withMessage('Name is required'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('base_weight').optional().isNumeric().withMessage('Base weight must be a number'),
  body('base_price').optional().isNumeric().withMessage('Base price must be a number'),
  body('weight_step').optional().isNumeric().withMessage('Weight step must be a number'),
  body('description').optional().trim().escape(),
  body('image').optional().trim(),
], requireAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete product
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// העלאת תמונה
router.post('/upload-image', requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // מחזיר את הנתיב היחסי של התמונה
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });
});

module.exports = router; 