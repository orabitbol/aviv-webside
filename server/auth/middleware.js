const User = require('../models/User');

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  User.findById(req.session.userId).then(user => {
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  }).catch(() => res.status(500).json({ error: 'Server error' }));
}

module.exports = { requireAuth, requireAdmin }; 