const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  inStock: { type: Boolean, default: true },
  weight: { type: String },
  stock_quantity: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' } });

module.exports = mongoose.model('Product', productSchema); 