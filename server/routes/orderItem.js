const express = require('express');
const OrderItem = require('../models/OrderItem');
const { requireAdmin } = require('../auth/middleware');
const mongoose = require('mongoose');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Get all order items
router.get('/', requireAdmin, async (req, res) => {
  try {
    const items = await OrderItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order items by order_id
router.get('/order/:orderId', async (req, res) => {
  try {
    const orderId = mongoose.Types.ObjectId.isValid(req.params.orderId)
      ? new mongoose.Types.ObjectId(req.params.orderId)
      : req.params.orderId;
    const items = await OrderItem.find({ order_id: orderId })
      .populate({
        path: 'product_id',
        select: 'name base_weight base_price weight_step price image',
      });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order item by id
router.get('/:id', async (req, res) => {
  try {
    const item = await OrderItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'OrderItem not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new order item
router.post('/', [
  body('product_id').isString().notEmpty().withMessage('Product ID is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('weight').isNumeric().withMessage('Weight must be a number'),
  body('unit_price').isNumeric().withMessage('Unit price must be a number'),
], requireAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { weight, unit_price } = req.body;
    if (typeof weight !== 'number' || typeof unit_price !== 'number') {
      return res.status(400).json({ error: 'weight and unit_price are required and must be numbers' });
    }
    const item = new OrderItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update order item
router.put('/:id', [
  body('product_id').optional().isString().notEmpty(),
  body('quantity').optional().isNumeric(),
  body('price').optional().isNumeric(),
  body('weight').optional().isNumeric(),
  body('unit_price').optional().isNumeric(),
], requireAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { weight, unit_price } = req.body;
    if (typeof weight !== 'number' || typeof unit_price !== 'number') {
      return res.status(400).json({ error: 'weight and unit_price are required and must be numbers' });
    }
    const item = await OrderItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'OrderItem not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete order item
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const item = await OrderItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'OrderItem not found' });
    res.json({ message: 'OrderItem deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 