const express = require('express');
const { createUser, authenticateUser, getUserById } = require('../services/userService');
const { signToken } = require('../utils/auth');
const { requireAuth } = require('../middleware/auth');
const { assertValidRegistration, assertValidLogin } = require('../utils/validation');

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { name, email, password } = assertValidRegistration(req.body);
    const user = createUser({ name, email, password, role: 'customer' });
    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = assertValidLogin(req.body);
    const user = authenticateUser({ email, password });
    const token = signToken(user);
    return res.json({
      user: { id: user.id, name: user.name, role: user.role },
      token
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

router.get('/me', requireAuth, (req, res) => {
  const user = getUserById(req.user.id);
  return res.json({ user });
});

module.exports = router;
