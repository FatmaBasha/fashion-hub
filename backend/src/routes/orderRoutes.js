const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  placeOrder,
  listOrders,
  listUserOrders,
  updateOrderStatus
} = require('../services/orderService');
const { assertValidCheckout, assertValidStatus } = require('../utils/validation');

const router = express.Router();

router.post('/', requireAuth, (req, res) => {
  try {
    const payload = assertValidCheckout(req.body);
    const order = placeOrder(req.user.id, payload);
    return res.status(201).json(order);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

router.get('/mine', requireAuth, (req, res) => {
  return res.json(listUserOrders(req.user.id));
});

router.get('/', requireAuth, requireAdmin, (req, res) => {
  return res.json(listOrders());
});

router.patch('/:id/status', requireAuth, requireAdmin, (req, res) => {
  try {
    const status = assertValidStatus(req.body.status);
    const updated = updateOrderStatus(Number(req.params.id), status);
    if (!updated) return res.status(404).json({ message: 'Order not found.' });
    return res.json(updated);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

module.exports = router;
