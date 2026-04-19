require('dotenv').config();
const { initDb } = require('./config/db');
const { ensureAdminUser } = require('./services/userService');
const { seedProducts } = require('./services/productService');

initDb();
ensureAdminUser();
seedProducts();
console.log('Database seeded successfully.');
