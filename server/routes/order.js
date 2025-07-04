const express = require('express');
const Order = require('../models/Order');
const { requireAdmin } = require('../auth/middleware');
const router = express.Router();
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');

// Get all orders (with pagination)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.from && req.query.to) {
      filter.createdAt = {
        $gte: new Date(req.query.from),
        $lte: new Date(req.query.to)
      };
    }
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ data: orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new order (public)
router.post('/', async (req, res) => {
  try {
    const { items, ...orderData } = req.body;
    // הפקת order_number רץ
    const lastOrder = await Order.findOne({}, {}, { sort: { order_number: -1 } });
    const nextOrderNumber = lastOrder && lastOrder.order_number ? lastOrder.order_number + 1 : 1;
    const order = new Order({ ...orderData, order_number: nextOrderNumber });
    await order.save();
    let createdItems = [];
    if (Array.isArray(items) && items.length > 0) {
      createdItems = await Promise.all(items.map(async (item, idx) => {
        try {
          // Fetch product to get base_weight and base_price
          const product = await Product.findById(item.product_id);
          if (!product) throw new Error('Product not found');
          // Calculate weight and unit_price
          // If item.weight is provided, use it; else calculate from quantity * base_weight
          const weight = item.weight ? item.weight : (item.quantity * product.base_weight);
          const unit_price = product.base_price; // מחיר ליחידת משקל (למשל ל-100 גרם)
          // Calculate total price for this item
          const price = (weight / product.base_weight) * product.base_price;
          const orderItem = new OrderItem({
            ...item,
            order_id: order._id,
            weight,
            unit_price,
            price
          });
          await orderItem.save();
          return orderItem;
        } catch (err) {
          console.error(`שגיאה בשמירת OrderItem (${idx}):`, err.message, item);
          return null;
        }
      }));
      createdItems = createdItems.filter(Boolean);
    }
    res.status(201).json({ order, items: createdItems });
  } catch (err) {
    console.error('שגיאה ביצירת הזמנה:', err.message, req.body);
    res.status(400).json({ error: err.message });
  }
});

// Update order (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete order (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 