const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/store.json');

const defaultState = {
  counters: {
    users: 0,
    products: 0,
    carts: 0,
    cartItems: 0,
    orders: 0,
    orderItems: 0
  },
  users: [],
  products: [],
  carts: [],
  cart_items: [],
  orders: [],
  order_items: []
};

let state = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function initDb() {
  if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultState, null, 2));
  }
  try {
    state = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch {
    state = clone(defaultState);
    persist();
  }
}

function persist() {
  fs.writeFileSync(dbPath, JSON.stringify(state, null, 2));
}

function getState() {
  if (!state) initDb();
  return state;
}

function nextId(counterName) {
  const current = getState();
  current.counters[counterName] = (current.counters[counterName] || 0) + 1;
  persist();
  return current.counters[counterName];
}

module.exports = { initDb, getState, persist, nextId, dbPath };
