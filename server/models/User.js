const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  displayName: String,
  isAdmin: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' } });

module.exports = mongoose.model('User', userSchema); 