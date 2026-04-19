const express = require('express');
const {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../services/productService');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { assertValidProductInput } = require('../utils/validation');

const router = express.Router();

router.get('/', (req, res) => {
  const products = listProducts(req.query);
  return res.json(products);
});

router.get('/:slug', (req, res) => {
  const product = getProductBySlug(req.params.slug);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  return res.json(product);
});

router.post('/', requireAuth, requireAdmin, (req, res) => {
  try {
    const product = createProduct(assertValidProductInput(req.body));
    return res.status(201).json(product);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
});

router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  try {
    const product = updateProduct(Number(req.params.id), assertValidProductInput(req.body));
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.json(product);
  } catch (error) {
    return res.status(error.status || 400).json({ message: error.message });
  }
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const result = deleteProduct(Number(req.params.id));
  return res.json({ deleted: result.changes > 0 });
});

module.exports = router;
