const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// יצירת משתמש admin ראשוני (seed)
router.post('/seed-admin', [
  body('email').isEmail().withMessage('Email is invalid').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
  body('displayName').optional().trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password, displayName } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'User already exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, displayName, isAdmin: true });
  res.json({ message: 'Admin user created', user: { email: user.email, isAdmin: user.isAdmin } });
});

// התחברות
router.post('/login', [
  body('email').isEmail().withMessage('Email is invalid').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });
  req.session.userId = user._id;
  res.json({ message: 'Login successful', user: { email: user.email, isAdmin: user.isAdmin, displayName: user.displayName } });
});

// התנתקות
router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ message: 'Logged out' });
});

// בדיקת סטטוס התחברות
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ email: user.email, isAdmin: user.isAdmin, displayName: user.displayName });
});

module.exports = router; 