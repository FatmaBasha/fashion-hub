const { getState, persist, nextId } = require('../config/db');
const { getProductById } = require('./productService');

function ensureCart(userId) {
  const state = getState();
  let cart = state.carts.find((c) => c.user_id === userId);
  if (!cart) {
    cart = { id: nextId('carts'), user_id: userId, created_at: new Date().toISOString() };
    state.carts.push(cart);
    persist();
  }
  return cart;
}

function getCart(userId) {
  const state = getState();
  const cart = ensureCart(userId);
  const items = state.cart_items
    .filter((ci) => ci.cart_id === cart.id)
    .map((ci) => {
      const product = getProductById(ci.product_id);
      return product
        ? {
            id: ci.id,
            quantity: ci.quantity,
            size: ci.size,
            color: ci.color,
            product_id: product.id,
            name: product.name,
            slug: product.slug,
            price: Number(product.price),
            image_url: product.image_url,
            stock: Number(product.stock)
          }
        : null;
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { id: cart.id, items, subtotal: Number(subtotal.toFixed(2)) };
}

function addToCart(userId, { productId, quantity = 1, size = '', color = '' }) {
  const state = getState();
  const product = getProductById(productId);
  if (!product) {
    const error = new Error('Product not found.');
    error.status = 404;
    throw error;
  }
  if (Number(product.stock) < Number(quantity)) {
    const error = new Error('Requested quantity is not available in stock.');
    error.status = 400;
    throw error;
  }

  const cart = ensureCart(userId);
  const existing = state.cart_items.find((item) =>
    item.cart_id === cart.id && item.product_id === product.id && item.size === size && item.color === color
  );

  if (existing) {
    const newQty = Number(existing.quantity) + Number(quantity);
    if (newQty > Number(product.stock)) {
      const error = new Error('Requested quantity exceeds available stock.');
      error.status = 400;
      throw error;
    }
    existing.quantity = newQty;
  } else {
    state.cart_items.push({
      id: nextId('cartItems'),
      cart_id: cart.id,
      product_id: product.id,
      quantity: Number(quantity),
      size,
      color
    });
  }

  persist();
  return getCart(userId);
}

function updateCartItem(userId, itemId, quantity) {
  const state = getState();
  const cart = ensureCart(userId);
  const item = state.cart_items.find((entry) => entry.id === Number(itemId) && entry.cart_id === cart.id);
  if (!item) {
    const error = new Error('Cart item not found.');
    error.status = 404;
    throw error;
  }

  if (quantity <= 0) {
    state.cart_items = state.cart_items.filter((entry) => entry.id !== item.id);
    persist();
    return getCart(userId);
  }

  const product = getProductById(item.product_id);
  if (!product || Number(product.stock) < Number(quantity)) {
    const error = new Error('Requested quantity is not available in stock.');
    error.status = 400;
    throw error;
  }

  item.quantity = Number(quantity);
  persist();
  return getCart(userId);
}

function clearCart(userId) {
  const state = getState();
  const cart = ensureCart(userId);
  state.cart_items = state.cart_items.filter((entry) => entry.cart_id !== cart.id);
  persist();
}

module.exports = { getCart, addToCart, updateCartItem, clearCart };
