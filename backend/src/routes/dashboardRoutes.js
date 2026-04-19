const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getState } = require('../config/db');

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/stats', (_req, res) => {
  const state = getState();
  const totalSales = state.orders
    .filter((order) => order.status !== 'cancelled')
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalOrders = state.orders.length;
  const totalProducts = state.products.length;
  const totalCustomers = state.users.filter((user) => user.role === 'customer').length;

  return res.json({ totalSales, totalOrders, totalProducts, totalCustomers });
});

module.exports = router;
