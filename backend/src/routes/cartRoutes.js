const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getCart, addToCart, updateCartItem } = require('../services/cartService');
const { assertValidCartItem } = require('../utils/validation');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  return res.json(getCart(req.user.id));
});

router.post('/items', (req, res) => {
  try {
    const item = assertValidCartItem(req.body);
    return res.status(201).json(addToCart(req.user.id, item));
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

router.patch('/items/:itemId', (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 20) {
      return res.status(400).json({ message: 'Quantity must be between 0 and 20.' });
    }
    const cart = updateCartItem(req.user.id, Number(req.params.itemId), quantity);
    return res.json(cart);
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

module.exports = router;
