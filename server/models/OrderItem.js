const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  weight: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  product_name: { type: String },
  total_price: { type: Number }
});

module.exports = mongoose.model('OrderItem', orderItemSchema); 