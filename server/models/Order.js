const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  address: { type: String, required: true },
  phone: String,
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  order_number: { type: Number, required: true, unique: true, index: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema); 