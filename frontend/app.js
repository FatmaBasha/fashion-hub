const API_BASE = 'http://localhost:5000/api';

const state = {
  token: localStorage.getItem('fashionhub_token') || '',
  user: JSON.parse(localStorage.getItem('fashionhub_user') || 'null'),
  products: [],
  cart: { items: [], subtotal: 0 }
};

const $ = (id) => document.getElementById(id);
const refs = {
  productGrid: $('productGrid'),
  categoryFilter: $('categoryFilter'),
  searchInput: $('searchInput'),
  filterBtn: $('filterBtn'),

  welcomeText: $('welcomeText'),
  loginBtn: $('loginBtn'),
  logoutBtn: $('logoutBtn'),

  guestView: $('guestView'),
  customerSection: $('customerSection'),
  adminSection: $('adminSection'),
  accountHeading: $('accountHeading'),
  accountSubheading: $('accountSubheading'),

  customerProfile: $('customerProfile'),
  customerOrders: $('customerOrders'),
  customerOrdersCount: $('customerOrdersCount'),
  customerPendingCount: $('customerPendingCount'),
  customerCompletedCount: $('customerCompletedCount'),

  statSales: $('statSales'),
  statOrders: $('statOrders'),
  statProducts: $('statProducts'),
  statCustomers: $('statCustomers'),
  adminProducts: $('adminProducts'),
  adminOrders: $('adminOrders'),

  cartDrawer: $('cartDrawer'),
  cartItems: $('cartItems'),
  cartTotal: $('cartTotal'),
  cartCount: $('cartCount'),
  cartOpenBtn: $('cartOpenBtn'),
  closeCartBtn: $('closeCartBtn'),
  checkoutBtn: $('checkoutBtn'),

  authModal: $('authModal'),
  closeAuthModal: $('closeAuthModal'),
  guestLoginBtn: $('guestLoginBtn'),
  loginForm: $('loginForm'),
  email: $('email'),
  password: $('password'),
  authMessage: $('authMessage'),

  registerModal: $('registerModal'),
  closeRegisterModal: $('closeRegisterModal'),
  openRegisterModalBtn: $('openRegisterModalBtn'),
  registerForm: $('registerForm'),
  registerName: $('registerName'),
  registerEmail: $('registerEmail'),
  registerPassword: $('registerPassword'),
  registerMessage: $('registerMessage'),

  checkoutModal: $('checkoutModal'),
  closeCheckoutModal: $('closeCheckoutModal'),
  checkoutForm: $('checkoutForm'),
  checkoutName: $('checkoutName'),
  checkoutPhone: $('checkoutPhone'),
  checkoutAddress: $('checkoutAddress'),
  checkoutPaymentMethod: $('checkoutPaymentMethod'),
  checkoutMessage: $('checkoutMessage'),

  toggleProductFormBtn: $('toggleProductFormBtn'),
  productForm: $('productForm'),
  cancelProductEditBtn: $('cancelProductEditBtn'),
  productId: $('productId'),
  productName: $('productName'),
  productCategory: $('productCategory'),
  productPrice: $('productPrice'),
  productStock: $('productStock'),
  productImage: $('productImage'),
  productDescription: $('productDescription'),
  productFeatured: $('productFeatured')
};

function saveAuth() {
  if (state.token) localStorage.setItem('fashionhub_token', state.token);
  else localStorage.removeItem('fashionhub_token');

  if (state.user) localStorage.setItem('fashionhub_user', JSON.stringify(state.user));
  else localStorage.removeItem('fashionhub_user');
}

function setMessage(target, message = '', type = '') {
  target.textContent = message;
  target.className = type;
}

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

function currency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function openModal(modal) { modal.classList.remove('hidden'); }
function closeModal(modal) { modal.classList.add('hidden'); }

async function registerCustomer(name, email, password) {
  const result = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  state.token = result.token;
  state.user = result.user;
  saveAuth();
  refs.registerForm.reset();
  closeModal(refs.registerModal);
  renderAccountShell();
  await syncCart();
  await loadDashboard();
}

async function loadProducts() {
  const params = new URLSearchParams();
  if (refs.categoryFilter.value) params.set('category', refs.categoryFilter.value);
  if (refs.searchInput.value.trim()) params.set('q', refs.searchInput.value.trim());
  state.products = await apiFetch(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  renderProducts();
}

function renderProducts() {
  refs.productGrid.innerHTML = state.products.map((product) => `
    <article class="product-card">
      <img src="${product.image_url}" alt="${product.name}" />
      <div class="product-body">
        <div class="product-meta">${product.category}</div>
        <h3>${product.name}</h3>
        <p class="product-meta">${product.description}</p>
        <div class="product-row">
          <strong class="price">${currency(product.price)}</strong>
          <button class="dark-btn" data-add-cart="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join('');
}

async function syncCart() {
  if (!state.token) {
    state.cart = { items: [], subtotal: 0 };
    renderCart();
    return;
  }
  state.cart = await apiFetch('/cart');
  renderCart();
}

function renderCart() {
  refs.cartCount.textContent = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  refs.cartTotal.textContent = currency(state.cart.subtotal);

  if (!state.cart.items.length) {
    refs.cartItems.innerHTML = '<p class="muted">Your cart is empty.</p>';
    return;
  }

  refs.cartItems.innerHTML = state.cart.items.map((item) => `
    <div class="drawer-item">
      <img src="${item.image_url}" alt="${item.name}" />
      <div>
        <strong>${item.name}</strong>
        <div class="product-meta">${currency(item.price)} × ${item.quantity}</div>
        <div class="drawer-actions">
          <button class="mini-btn" data-qty="${item.id}:-1">-</button>
          <button class="mini-btn" data-qty="${item.id}:1">+</button>
          <button class="mini-btn danger-btn" data-remove="${item.id}">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function addToCart(productId) {
  if (!state.token) {
    openModal(refs.authModal);
    setMessage(refs.authMessage, 'Please login first.', 'error');
    return;
  }
  await apiFetch('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity: 1 })
  });
  await syncCart();
  refs.cartDrawer.classList.add('open');
}

async function updateCartItem(itemId, quantity) {
  await apiFetch(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity })
  });
  await syncCart();
}

function renderAccountShell() {
  const loggedIn = Boolean(state.user);
  refs.loginBtn.classList.toggle('hidden', loggedIn);
  refs.logoutBtn.classList.toggle('hidden', !loggedIn);
  refs.welcomeText.classList.toggle('hidden', !loggedIn);
  refs.welcomeText.textContent = loggedIn ? `Hi, ${state.user.name}` : '';

  refs.guestView.classList.toggle('hidden', loggedIn);
  refs.customerSection.classList.add('hidden');
  refs.adminSection.classList.add('hidden');

  if (!loggedIn) {
    refs.accountHeading.textContent = 'My Account';
    refs.accountSubheading.textContent = 'Login to see your account area.';
    return;
  }

  if (state.user.role === 'admin') {
    refs.accountHeading.textContent = 'Admin Dashboard';
    refs.accountSubheading.textContent = 'Manage products and orders.';
    refs.adminSection.classList.remove('hidden');
  } else {
    refs.accountHeading.textContent = 'Customer Dashboard';
    refs.accountSubheading.textContent = 'View your orders and place new ones.';
    refs.customerSection.classList.remove('hidden');
  }
}

function renderCustomerProfile() {
  refs.customerProfile.innerHTML = `
    <div class="profile-list">
      <div><strong>Name:</strong> ${state.user.name}</div>
      <div><strong>Role:</strong> Customer</div>
      <div><strong>Status:</strong> Active account</div>
    </div>
  `;
}

function renderCustomerOrders(orders) {
  const pending = orders.filter((o) => o.status === 'pending').length;
  const completed = orders.filter((o) => ['completed', 'delivered'].includes(o.status)).length;

  refs.customerOrdersCount.textContent = orders.length;
  refs.customerPendingCount.textContent = pending;
  refs.customerCompletedCount.textContent = completed;

  refs.customerOrders.innerHTML = orders.length ? orders.map((order) => `
    <div class="data-item">
      <div class="data-item-head">
        <div>
          <strong>Order #${order.id}</strong>
          <div class="product-meta">${new Date(order.created_at).toLocaleString()}</div>
        </div>
        <span class="status-pill ${order.status}">${order.status}</span>
      </div>
      <div class="order-summary">
        <div><strong>Total:</strong> ${currency(order.total)}</div>
        <div><strong>Phone:</strong> ${order.phone || '-'}</div>
        <div><strong>Address:</strong> ${order.address || '-'}</div>
        <div><strong>Payment:</strong> ${order.payment_method || '-'}</div>
      </div>
    </div>
  `).join('') : '<p class="muted">No orders yet.</p>';
}

async function loadCustomerDashboard() {
  if (!state.user || state.user.role !== 'customer') return;
  renderCustomerProfile();
  const orders = await apiFetch('/orders/mine');
  renderCustomerOrders(orders);
}

function renderAdminProducts(products) {
  refs.adminProducts.innerHTML = products.map((product) => `
    <div class="data-item">
      <div class="data-item-head">
        <div>
          <strong>${product.name}</strong>
          <div class="product-meta">${product.category} · Stock: ${product.stock}</div>
        </div>
        <span class="status-pill ${product.featured ? 'completed' : ''}">${product.featured ? 'featured' : 'standard'}</span>
      </div>
      <div class="order-summary">
        <div><strong>Price:</strong> ${currency(product.price)}</div>
        <div class="product-meta">${product.description}</div>
      </div>
      <div class="data-actions">
        <button class="ghost-btn" data-edit-product="${product.id}">Edit</button>
        <button class="ghost-btn" data-delete-product="${product.id}">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderAdminOrders(orders) {
  refs.adminOrders.innerHTML = orders.length ? orders.map((order) => `
    <div class="data-item">
      <div class="data-item-head">
        <div>
          <strong>Order #${order.id}</strong>
          <div class="product-meta">${new Date(order.created_at).toLocaleString()}</div>
        </div>
        <span class="status-pill ${order.status}">${order.status}</span>
      </div>
      <div class="order-summary">
        <div><strong>Customer:</strong> ${order.customer_name || '-'}</div>
        <div><strong>Total:</strong> ${currency(order.total)}</div>
        <div><strong>Phone:</strong> ${order.phone || '-'}</div>
        <div><strong>Address:</strong> ${order.address || '-'}</div>
        <div><strong>Payment:</strong> ${order.payment_method || '-'}</div>
      </div>
      <div class="data-actions">
        <button class="ghost-btn" data-order-status="${order.id}:pending">Pending</button>
        <button class="ghost-btn" data-order-status="${order.id}:completed">Completed</button>
        <button class="ghost-btn" data-order-status="${order.id}:cancelled">Cancelled</button>
      </div>
    </div>
  `).join('') : '<p class="muted">No orders found.</p>';
}

function fillProductForm(product) {
  refs.productId.value = product.id;
  refs.productName.value = product.name;
  refs.productCategory.value = product.category;
  refs.productPrice.value = product.price;
  refs.productStock.value = product.stock;
  refs.productImage.value = product.image_url;
  refs.productDescription.value = product.description;
  refs.productFeatured.checked = Boolean(product.featured);
  refs.productForm.classList.remove('hidden');
}

function resetProductForm() {
  refs.productForm.reset();
  refs.productId.value = '';
  refs.productForm.classList.add('hidden');
}

async function loadAdminDashboard() {
  if (!state.user || state.user.role !== 'admin') return;
  const [stats, products, orders] = await Promise.all([
    apiFetch('/dashboard/stats'),
    apiFetch('/products'),
    apiFetch('/orders')
  ]);

  refs.statSales.textContent = currency(stats.totalSales);
  refs.statOrders.textContent = stats.totalOrders;
  refs.statProducts.textContent = stats.totalProducts;
  refs.statCustomers.textContent = stats.totalCustomers;
  renderAdminProducts(products);
  renderAdminOrders(orders);
}

async function login(email, password) {
  const result = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  state.token = result.token;
  state.user = result.user;
  saveAuth();
  closeModal(refs.authModal);
  refs.loginForm.reset();
  renderAccountShell();
  await syncCart();
  await loadDashboard();
}

function logout() {
  state.token = '';
  state.user = null;
  state.cart = { items: [], subtotal: 0 };
  saveAuth();
  renderCart();
  renderAccountShell();
}

async function placeOrder(event) {
  event.preventDefault();
  try {
    setMessage(refs.checkoutMessage, '', '');
    await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        customerName: refs.checkoutName.value.trim(),
        phone: refs.checkoutPhone.value.trim(),
        address: refs.checkoutAddress.value.trim(),
        paymentMethod: refs.checkoutPaymentMethod.value
      })
    });
    refs.checkoutForm.reset();
    setMessage(refs.checkoutMessage, 'Order placed successfully.', 'notice');
    await syncCart();
    await loadDashboard();
    setTimeout(() => closeModal(refs.checkoutModal), 900);
  } catch (error) {
    setMessage(refs.checkoutMessage, error.message, 'error');
  }
}

async function loadDashboard() {
  renderAccountShell();
  if (!state.user) return;
  if (state.user.role === 'admin') await loadAdminDashboard();
  else await loadCustomerDashboard();
}

document.addEventListener('click', async (event) => {
  const addBtn = event.target.closest('[data-add-cart]');
  if (addBtn) return addToCart(Number(addBtn.dataset.addCart));

  const qtyBtn = event.target.closest('[data-qty]');
  if (qtyBtn) {
    const [itemId, delta] = qtyBtn.dataset.qty.split(':').map(Number);
    const item = state.cart.items.find((i) => i.id === itemId);
    if (!item) return;
    return updateCartItem(itemId, item.quantity + delta);
  }

  const removeBtn = event.target.closest('[data-remove]');
  if (removeBtn) return updateCartItem(Number(removeBtn.dataset.remove), 0);

  const editBtn = event.target.closest('[data-edit-product]');
  if (editBtn) {
    const product = state.products.find((p) => p.id === Number(editBtn.dataset.editProduct));
    if (product) fillProductForm(product);
    return;
  }

  const deleteBtn = event.target.closest('[data-delete-product]');
  if (deleteBtn) {
    await apiFetch(`/products/${Number(deleteBtn.dataset.deleteProduct)}`, { method: 'DELETE' });
    await loadProducts();
    await loadAdminDashboard();
    return;
  }

  const statusBtn = event.target.closest('[data-order-status]');
  if (statusBtn) {
    const [orderId, status] = statusBtn.dataset.orderStatus.split(':');
    await apiFetch(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    await loadAdminDashboard();
  }
});

refs.filterBtn.addEventListener('click', loadProducts);
refs.loginBtn.addEventListener('click', () => openModal(refs.authModal));
refs.guestLoginBtn.addEventListener('click', () => openModal(refs.authModal));
refs.closeAuthModal.addEventListener('click', () => closeModal(refs.authModal));
refs.openRegisterModalBtn?.addEventListener('click', () => {
  setMessage(refs.authMessage, '', '');
  closeModal(refs.authModal);
  openModal(refs.registerModal);
});
refs.closeRegisterModal?.addEventListener('click', () => closeModal(refs.registerModal));
refs.logoutBtn.addEventListener('click', logout);
refs.cartOpenBtn.addEventListener('click', () => refs.cartDrawer.classList.add('open'));
refs.closeCartBtn.addEventListener('click', () => refs.cartDrawer.classList.remove('open'));
refs.checkoutBtn.addEventListener('click', () => {
  if (!state.user) {
    openModal(refs.authModal);
    setMessage(refs.authMessage, 'Please login first.', 'error');
    return;
  }
  if (state.user.role !== 'customer') {
    return alert('Admins cannot place customer orders.');
  }
  if (!state.cart.items.length) {
    return alert('Cart is empty.');
  }
  refs.checkoutName.value = state.user.name || '';
  setMessage(refs.checkoutMessage, '', '');
  openModal(refs.checkoutModal);
});
refs.closeCheckoutModal.addEventListener('click', () => closeModal(refs.checkoutModal));
refs.checkoutForm.addEventListener('submit', placeOrder);

refs.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    setMessage(refs.authMessage, '', '');
    await login(refs.email.value.trim(), refs.password.value.trim());
  } catch (error) {
    setMessage(refs.authMessage, error.message, 'error');
  }
});

refs.registerForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    setMessage(refs.registerMessage, '', '');
    await registerCustomer(
      refs.registerName.value.trim(),
      refs.registerEmail.value.trim(),
      refs.registerPassword.value.trim()
    );
  } catch (error) {
    setMessage(refs.registerMessage, error.message, 'error');
  }
});

refs.toggleProductFormBtn?.addEventListener('click', () => {
  refs.productForm.classList.toggle('hidden');
});

refs.cancelProductEditBtn?.addEventListener('click', resetProductForm);

refs.productForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const payload = {
    name: refs.productName.value.trim(),
    category: refs.productCategory.value.trim(),
    price: Number(refs.productPrice.value),
    stock: Number(refs.productStock.value),
    imageUrl: refs.productImage.value.trim(),
    description: refs.productDescription.value.trim(),
    featured: refs.productFeatured.checked,
    sizes: [],
    colors: []
  };

  if (refs.productId.value) {
    await apiFetch(`/products/${refs.productId.value}`, { method: 'PUT', body: JSON.stringify(payload) });
  } else {
    await apiFetch('/products', { method: 'POST', body: JSON.stringify(payload) });
  }

  resetProductForm();
  await loadProducts();
  await loadAdminDashboard();
});

window.addEventListener('click', (event) => {
  if (event.target === refs.authModal) closeModal(refs.authModal);
  if (event.target === refs.checkoutModal) closeModal(refs.checkoutModal);
  if (event.target === refs.registerModal) closeModal(refs.registerModal);
});

window.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  if (state.user && state.token) {
    await syncCart();
  } else {
    renderCart();
  }
  await loadDashboard();
});
