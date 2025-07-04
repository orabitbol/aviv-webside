const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image_url: { type: String },
  slug: { type: String, required: true, unique: true },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' } });

module.exports = mongoose.model('Category', categorySchema); 