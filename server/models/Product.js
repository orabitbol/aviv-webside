const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  image: String,
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  inStock: { type: Boolean, default: true },
  weight: { type: String },
  stock_quantity: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 },
  base_weight: { type: Number, required: true },
  base_price: { type: Number, required: true },
  weight_step: { type: Number, required: true },
}, { timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' } });

module.exports = mongoose.model('Product', productSchema); 