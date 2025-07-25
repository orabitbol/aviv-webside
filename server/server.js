const express = require('express');
const mongoose = require('mongoose');
const session = require('cookie-session');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieSession = require('cookie-session');
const fetch = require('node-fetch');
const path = require('path');
dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Helmet for security headers
const helmetCspDirectives = {
  ...helmet.contentSecurityPolicy.getDefaultDirectives(),
  "img-src": [
    "'self'",
    process.env.FRONTEND_URL_PROD,
    process.env.FRONTEND_URL_DEV,
    "data:"
  ].filter(Boolean),
};
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: helmetCspDirectives,
    },
  })
);

// Rate limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS - allow only your domain and localhost (adjust as needed)
const allowedOrigins = [
  process.env.FRONTEND_URL_DEV,
  process.env.FRONTEND_URL_PROD,
  process.env.FRONTEND_URL_PROD2,
  // הוסף כאן דומיינים נוספים אם צריך
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS request from:', origin);
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw Error('Invalid JSON');
    }
  }
}));
app.use(cookieSession({
  name: "session",
  keys: [process.env.SESSION_SECRET],
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
}));

// הגשת קבצים סטטיים מתיקיית uploads (רק תמונות)
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  const allowedExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(req.path).toLowerCase();
  if (!allowedExt.includes(ext)) {
    return res.status(403).send('Access denied');
  }
  next();
}, express.static(__dirname + '/uploads'));

// Routes
app.use('/api/categories', require('./routes/category'));
app.use('/api/products', require('./routes/product'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/order-items', require('./routes/orderItem'));
app.use('/api/auth', require('./routes/auth'));

// Endpoint לקריאת APISign מול Hypay (חייב להיות לפני הגשת SPA)
app.get('/api/hypay-sign', async (req, res) => {
  try {
    console.log('Hypay /api/hypay-sign params:', req.query); // דיבאג
    const params = new URLSearchParams(req.query).toString();
    const hypayRes = await fetch(`https://pay.hyp.co.il/p/?${params}`);
    const text = await hypayRes.text();
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Hypay', details: err.message });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Session cookie config:', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    app.listen(process.env.PORT || 5000, () => {
      console.log('Server running on port', process.env.PORT || 5000);
    });
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });

app.get('/', (req, res) => {
  res.send('NutHub backend is running!');
}); 