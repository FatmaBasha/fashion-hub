const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./config/db');
const { ensureAdminUser } = require('./services/userService');
const { seedProducts } = require('./services/productService');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

initDb();
ensureAdminUser();
seedProducts();

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: [/^http:\/\/localhost(:\d+)?$/], credentials: false }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Fashion store backend is running.' });
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

module.exports = app;
