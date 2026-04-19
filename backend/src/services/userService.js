const bcrypt = require('bcryptjs');
const { getState, persist, nextId } = require('../config/db');
const { normalizeEmail } = require('../utils/validation');

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    created_at: user.created_at
  };
}

function getUserById(id) {
  const user = getState().users.find((entry) => entry.id === Number(id));
  return user ? sanitizeUser(user) : null;
}

function createUser({ name, email, password, role = 'customer' }) {
  const state = getState();
  const normalizedEmail = normalizeEmail(email);
  const safeRole = role === 'admin' ? 'admin' : 'customer';
  const existing = state.users.find((u) => u.email === normalizedEmail);
  if (existing) {
    const error = new Error('Email already in use.');
    error.status = 409;
    throw error;
  }

  const user = {
    id: nextId('users'),
    name,
    email: normalizedEmail,
    password_hash: bcrypt.hashSync(password, 12),
    role: safeRole,
    created_at: new Date().toISOString()
  };
  state.users.push(user);

  const cartExists = state.carts.some((c) => c.user_id === user.id);
  if (!cartExists) {
    state.carts.push({ id: nextId('carts'), user_id: user.id, created_at: new Date().toISOString() });
  }

  persist();
  return sanitizeUser(user);
}

function authenticateUser({ email, password }) {
  const state = getState();
  const user = state.users.find((u) => u.email === normalizeEmail(email));
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }
  return user;
}

function ensureAdminUser() {
  const state = getState();
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@fashionhub.com');
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const existing = state.users.find((u) => u.email === adminEmail);
  if (!existing) {
    createUser({ name: 'Store Admin', email: adminEmail, password: adminPassword, role: 'admin' });
  }
}

module.exports = { createUser, authenticateUser, ensureAdminUser, getUserById };
