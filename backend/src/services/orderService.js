const { getState, persist, nextId } = require('../config/db');
const { getCart, clearCart } = require('./cartService');
const { getProductById } = require('./productService');

function placeOrder(userId, payload) {
  const state = getState();
  const cart = getCart(userId);
  if (!cart.items.length) {
    const error = new Error('Cart is empty.');
    error.status = 400;
    throw error;
  }

  let verifiedTotal = 0;
  cart.items.forEach((item) => {
    const product = getProductById(item.product_id);
    if (!product) {
      const error = new Error(`Product ${item.product_id} no longer exists.`);
      error.status = 400;
      throw error;
    }
    if (Number(product.stock) < Number(item.quantity)) {
      const error = new Error(`Not enough stock for ${product.name}.`);
      error.status = 400;
      throw error;
    }
    verifiedTotal += Number(product.price) * Number(item.quantity);
  });

  const order = {
    id: nextId('orders'),
    user_id: userId,
    customer_name: payload.customerName,
    phone: payload.phone,
    address: payload.address,
    payment_method: payload.paymentMethod,
    total: Number(verifiedTotal.toFixed(2)),
    status: 'pending',
    created_at: new Date().toISOString()
  };
  state.orders.push(order);

  cart.items.forEach((item) => {
    const product = getProductById(item.product_id);
    state.order_items.push({
      id: nextId('orderItems'),
      order_id: order.id,
      product_id: item.product_id,
      product_name: product.name,
      unit_price: Number(product.price),
      quantity: item.quantity,
      size: item.size,
      color: item.color
    });
    product.stock = Math.max(0, Number(product.stock) - Number(item.quantity));
  });

  persist();
  clearCart(userId);
  return getOrderById(order.id);
}

function getOrderById(id) {
  const state = getState();
  const order = state.orders.find((o) => o.id === Number(id));
  if (!order) return null;
  const items = state.order_items.filter((item) => item.order_id === Number(id));
  return { ...order, items };
}

function listOrders() {
  return [...getState().orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((order) => getOrderById(order.id));
}

function listUserOrders(userId) {
  return getState().orders
    .filter((o) => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((order) => getOrderById(order.id));
}

function updateOrderStatus(id, status) {
  const state = getState();
  const order = state.orders.find((o) => o.id === Number(id));
  if (!order) return null;
  order.status = status;
  persist();
  return getOrderById(id);
}

module.exports = { placeOrder, getOrderById, listOrders, listUserOrders, updateOrderStatus };
