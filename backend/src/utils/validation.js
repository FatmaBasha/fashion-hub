const validator = require('validator');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}

function assertValidRegistration({ name, email, password }) {
  const cleanName = sanitizeName(name);
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || '');

  if (!cleanName || cleanName.length < 2 || cleanName.length > 80) {
    const error = new Error('Name must be between 2 and 80 characters.');
    error.status = 400;
    throw error;
  }

  if (!validator.isEmail(cleanEmail)) {
    const error = new Error('Please enter a valid email address.');
    error.status = 400;
    throw error;
  }

  if (!validator.isStrongPassword(cleanPassword, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  })) {
    const error = new Error('Password must be at least 8 characters and include upper-case, lower-case, and a number.');
    error.status = 400;
    throw error;
  }

  return { name: cleanName, email: cleanEmail, password: cleanPassword };
}

function assertValidLogin({ email, password }) {
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || '');

  if (!validator.isEmail(cleanEmail) || !cleanPassword) {
    const error = new Error('Email and password are required.');
    error.status = 400;
    throw error;
  }

  return { email: cleanEmail, password: cleanPassword };
}

function parseDelimitedArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function assertValidProductInput(payload) {
  const name = String(payload.name || '').trim();
  const description = String(payload.description || '').trim();
  const category = String(payload.category || '').trim();
  const imageUrl = String(payload.imageUrl || '').trim();
  const price = Number(payload.price);
  const stock = Number(payload.stock);
  const compareAtPrice = payload.compareAtPrice === '' || payload.compareAtPrice === undefined || payload.compareAtPrice === null
    ? null
    : Number(payload.compareAtPrice);

  if (!name || name.length < 3) {
    const error = new Error('Product name must be at least 3 characters.');
    error.status = 400;
    throw error;
  }
  if (!description || description.length < 10) {
    const error = new Error('Product description must be at least 10 characters.');
    error.status = 400;
    throw error;
  }
  if (!category) {
    const error = new Error('Category is required.');
    error.status = 400;
    throw error;
  }
  if (!Number.isFinite(price) || price <= 0) {
    const error = new Error('Price must be a positive number.');
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(stock) || stock < 0) {
    const error = new Error('Stock must be a whole number greater than or equal to 0.');
    error.status = 400;
    throw error;
  }
  if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice <= 0)) {
    const error = new Error('Compare-at price must be a positive number.');
    error.status = 400;
    throw error;
  }
  if (!validator.isURL(imageUrl, { require_protocol: true })) {
    const error = new Error('Image URL must be a valid absolute URL.');
    error.status = 400;
    throw error;
  }

  return {
    name,
    description,
    category,
    price,
    stock,
    compareAtPrice,
    imageUrl,
    sizes: parseDelimitedArray(payload.sizes),
    colors: parseDelimitedArray(payload.colors),
    featured: Boolean(payload.featured)
  };
}

function assertValidCartItem({ productId, quantity, size, color }) {
  const cleanProductId = Number(productId);
  const cleanQuantity = Number(quantity || 1);

  if (!Number.isInteger(cleanProductId) || cleanProductId <= 0) {
    const error = new Error('A valid productId is required.');
    error.status = 400;
    throw error;
  }
  if (!Number.isInteger(cleanQuantity) || cleanQuantity <= 0 || cleanQuantity > 20) {
    const error = new Error('Quantity must be between 1 and 20.');
    error.status = 400;
    throw error;
  }

  return {
    productId: cleanProductId,
    quantity: cleanQuantity,
    size: String(size || '').trim(),
    color: String(color || '').trim()
  };
}

function assertValidCheckout(payload) {
  const customerName = sanitizeName(payload.customerName);
  const address = String(payload.address || '').trim();
  const phone = String(payload.phone || '').trim();
  const paymentMethod = String(payload.paymentMethod || '').trim();
  const allowedMethods = ['Cash on Delivery', 'InstaPay', 'Vodafone Cash'];

  if (!customerName || customerName.length < 2) {
    const error = new Error('Customer name is required.');
    error.status = 400;
    throw error;
  }
  if (!address || address.length < 10) {
    const error = new Error('Please enter a complete delivery address.');
    error.status = 400;
    throw error;
  }
  if (!validator.isMobilePhone(phone, 'any')) {
    const error = new Error('Please enter a valid phone number.');
    error.status = 400;
    throw error;
  }
  if (!allowedMethods.includes(paymentMethod)) {
    const error = new Error('Please select a valid payment method.');
    error.status = 400;
    throw error;
  }

  return { customerName, address, phone, paymentMethod };
}

function assertValidStatus(status) {
  const cleanStatus = String(status || '').trim().toLowerCase();
  const allowed = ['pending', 'completed', 'cancelled'];
  if (!allowed.includes(cleanStatus)) {
    const error = new Error('Invalid order status.');
    error.status = 400;
    throw error;
  }
  return cleanStatus;
}

module.exports = {
  normalizeEmail,
  assertValidRegistration,
  assertValidLogin,
  assertValidProductInput,
  assertValidCartItem,
  assertValidCheckout,
  assertValidStatus
};
