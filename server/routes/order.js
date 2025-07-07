const express = require('express');
const Order = require('../models/Order');
const { requireAdmin } = require('../auth/middleware');
const router = express.Router();
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const { body, validationResult } = require('express-validator');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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
router.post('/', [
  body('customerName').isString().trim().notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Email is invalid').normalizeEmail(),
  body('address').isString().trim().notEmpty().withMessage('Address is required'),
  body('phone').isString().trim().notEmpty().withMessage('Phone is required'),
  body('total').isNumeric().withMessage('Total must be a number'),
  body('items').isArray({ min: 1 }).withMessage('Items must be an array with at least one item'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { items, ...orderData } = req.body;

    const lastOrder = await Order.findOne({}, {}, { sort: { order_number: -1 } });
    const nextOrderNumber = lastOrder && lastOrder.order_number ? lastOrder.order_number + 1 : 1;
    const order = new Order({ ...orderData, order_number: nextOrderNumber });
    await order.save();

    const orderHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f7fafc; padding: 0; margin: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f7fafc; padding: 0; margin: 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 18px; box-shadow: 0 4px 24px #0001; margin: 32px 0; padding: 0;">
                <tr>
                  <td align="center" style="padding: 32px 0 0 0;">
                    <img src="https://agalapitz.co.il/logo.png" alt="פיצוחי העגלה" width="80" style="border-radius: 50%; box-shadow: 0 2px 8px #0002; margin-bottom: 16px;" />
                    <h1 style="font-size: 2rem; color: #1a202c; margin: 0 0 8px 0;">אישור הזמנה</h1>
                    <div style="font-size: 1.1rem; color: #38a169; font-weight: bold; margin-bottom: 12px;">ההזמנה שלך התקבלה בהצלחה!</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 32px 24px 32px;">
                    <div style="background: #f0fff4; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: right;">
                      <div style="font-size: 1.1rem; color: #2d3748; margin-bottom: 4px;"><b>שלום ${order.customerName},</b></div>
                      <div style="color: #4a5568;">תודה שבחרת בפיצוחי העגלה! להלן פרטי ההזמנה שלך:</div>
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 8px 0; color: #718096; font-weight: bold;">מספר הזמנה:</td>
                        <td style="padding: 8px 0; color: #2d3748;">${order.order_number}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #718096; font-weight: bold;">כתובת:</td>
                        <td style="padding: 8px 0; color: #2d3748;">${order.address}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #718096; font-weight: bold;">טלפון:</td>
                        <td style="padding: 8px 0; color: #2d3748;">${order.phone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #718096; font-weight: bold;">דוא"ל:</td>
                        <td style="padding: 8px 0; color: #2d3748;">${order.customerEmail}</td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background: #f7fafc; border-radius: 12px; overflow: hidden;">
                      <thead>
                        <tr style="background: #38a169; color: #fff;">
                          <th style="padding: 12px; text-align: right;">מוצר</th>
                          <th style="padding: 12px; text-align: right;">כמות</th>
                          <th style="padding: 12px; text-align: right;">גרמים</th>
                          <th style="padding: 12px; text-align: right;">מחיר ל-100 גרם</th>
                          <th style="padding: 12px; text-align: right;">סה"כ</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${items.map(item => `
                          <tr style="background: #fff; border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px 8px; color: #2d3748; font-weight: 500;">${item.product_name || item.name}</td>
                            <td style="padding: 10px 8px; color: #2d3748;">${item.quantity}</td>
                            <td style="padding: 10px 8px; color: #2d3748;">${item.selectedWeight || item.weight || item.base_weight || 100} גרם</td>
                            <td style="padding: 10px 8px; color: #2d3748;">₪${item.price} / ${item.base_weight || 100} גרם</td>
                            <td style="padding: 10px 8px; color: #38a169; font-weight: bold;">₪${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        `).join('')}
                        <tr style="background: #f0fff4;">
                          <td colspan="4" style="padding: 12px 8px; text-align: left; font-weight: bold; color: #2d3748;">סה"כ לתשלום (כולל משלוח):</td>
                          <td style="padding: 12px 8px; color: #38a169; font-weight: bold; font-size: 1.1rem;">₪${order.total.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div style="margin-top: 24px; background: #e6fffa; border-radius: 8px; padding: 16px; color: #319795; text-align: right;">
                      <b>הערה:</b> מייל זה מהווה אישור הזמנה בלבד. נציג יחזור אליך לאישור סופי ותיאום משלוח.
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 24px 0 32px 0; color: #a0aec0; font-size: 0.95rem;">
                    פיצוחי העגלה | agalapitz.co.il
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;
    // שלח ללקוח
    try {
      console.log('Sending email to customer:', order.customerEmail);
      const customerRes = await resend.emails.send({
        from: 'פיצוחי העגלה <noreply@agalapitz.co.il>',
        to: order.customerEmail,
        subject: `אישור הזמנה  #${order.order_number}`,
        html: orderHtml,
      });
      console.log('Resend response (customer):', customerRes);
    } catch (err) {
      console.error('שגיאה בשליחת מייל ללקוח:', err);
    }
    // שלח למנהל
    try {
      console.log('Sending email to admin:', ADMIN_EMAIL);
      const adminRes = await resend.emails.send({
        from: 'פיצוחי העגלה <noreply@agalapitz.co.il>',
        to: ADMIN_EMAIL,
        subject: `התקבלה הזמנה חדשה #${order.order_number}`,
        html: orderHtml,
      });
      console.log('Resend response (admin):', adminRes);
    } catch (err) {
      console.error('שגיאה בשליחת מייל למנהל:', err);
    }
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
          const total_price = (item.quantity || 1) * ((weight / product.base_weight) * product.base_price);
          const orderItem = new OrderItem({
            ...item,
            order_id: order._id,
            weight: item.selectedWeight || item.weight || (item.quantity * product.base_weight),
            unit_price: item.base_price || product.base_price,
            price: item.price, // המחיר ליחידת משקל כפי שנשלח מה-Frontend
            product_name: item.product_name || product.name,
            total_price: item.subtotal || (item.price * item.quantity),
            selectedWeight: item.selectedWeight,
            base_weight: item.base_weight || product.base_weight,
            base_price: item.base_price || product.base_price,
            image: item.image || product.image
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
    const orderTotal = createdItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const shipping = 5.99;
    order.shipping = shipping;
    order.total = orderTotal + shipping;
    await order.save();
    res.status(201).json({ order, items: createdItems });
  } catch (err) {
    console.error('שגיאה ביצירת הזמנה:', err.message, req.body);
    res.status(400).json({ error: err.message });
  }
});

// Update order (admin)
router.put('/:id', [
  body('customerName').optional().isString().trim().notEmpty(),
  body('customerEmail').optional().isEmail().normalizeEmail(),
  body('address').optional().isString().trim().notEmpty(),
  body('phone').optional().isString().trim().notEmpty(),
  body('total').optional().isNumeric(),
  body('status').optional().isString().trim(),
], requireAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
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

// סטטיסטיקות למנהל
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = {};
    if (from && to) {
      match.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }
    // שלוף את כל ההזמנות בטווח
    const orders = await Order.find(match);
    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    // פילוח יומי
    const daily = {};
    orders.forEach(order => {
      const day = order.createdAt.toISOString().slice(0, 10);
      if (!daily[day]) daily[day] = { sales: 0, orders: 0 };
      daily[day].sales += order.total || 0;
      daily[day].orders += 1;
    });
    // פילוח חודשי
    const monthly = {};
    orders.forEach(order => {
      const month = order.createdAt.toISOString().slice(0, 7);
      if (!monthly[month]) monthly[month] = { sales: 0, orders: 0 };
      monthly[month].sales += order.total || 0;
      monthly[month].orders += 1;
    });
    // ממוצע הזמנה
    const avgOrder = totalOrders > 0 ? (totalSales / totalOrders) : 0;
    // הזמנה הכי גבוהה
    const maxOrder = orders.reduce((max, o) => o.total > max ? o.total : max, 0);
    // הזמנה הכי נמוכה
    const minOrder = orders.reduce((min, o) => (o.total < min ? o.total : min), totalOrders > 0 ? orders[0].total : 0);
    // הזמנה אחרונה
    const lastOrder = orders.sort((a, b) => b.createdAt - a.createdAt)[0];
    res.json({
      totalSales,
      totalOrders,
      avgOrder,
      maxOrder,
      minOrder,
      lastOrder,
      daily,
      monthly
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 