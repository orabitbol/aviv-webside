const express = require('express');
const OrderItem = require('../models/OrderItem');
const { requireAdmin } = require('../auth/middleware');
const router = express.Router();

// Get all order items
router.get('/', async (req, res) => {
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
    const items = await OrderItem.find({ order_id: req.params.orderId });
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
router.post('/', requireAdmin, async (req, res) => {
  try {
    const item = new OrderItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update order item
router.put('/:id', requireAdmin, async (req, res) => {
  try {
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