const { getState, persist, nextId } = require('../config/db');
const { slugify } = require('../utils/slugify');

function normalizeProductInput(payload) {
  const state = getState();
  const baseSlug = payload.slug ? slugify(payload.slug) : slugify(payload.name);
  let slug = baseSlug;
  let i = 2;
  while (state.products.some((p) => p.slug === slug && p.id !== payload.id)) {
    slug = `${baseSlug}-${i++}`;
  }

  return {
    id: payload.id,
    name: String(payload.name).trim(),
    slug,
    description: String(payload.description).trim(),
    category: String(payload.category).trim(),
    price: Number(payload.price),
    compare_at_price: payload.compareAtPrice !== undefined && payload.compareAtPrice !== null && payload.compareAtPrice !== ''
      ? Number(payload.compareAtPrice)
      : null,
    stock: Number(payload.stock ?? 0),
    sizes: Array.isArray(payload.sizes) ? payload.sizes : [],
    colors: Array.isArray(payload.colors) ? payload.colors : [],
    image_url: String(payload.imageUrl).trim(),
    featured: Boolean(payload.featured)
  };
}

function listProducts({ category, featured, q }) {
  const state = getState();
  let products = [...state.products];
  if (category) products = products.filter((p) => p.category === category);
  if (featured === 'true') products = products.filter((p) => p.featured);
  if (q) {
    const needle = q.toLowerCase();
    products = products.filter((p) =>
      p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle)
    );
  }
  return products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getProductBySlug(slug) {
  return getState().products.find((p) => p.slug === slug) || null;
}

function getProductById(id) {
  return getState().products.find((p) => p.id === Number(id)) || null;
}

function createProduct(payload) {
  const state = getState();
  const product = {
    ...normalizeProductInput(payload),
    id: nextId('products'),
    created_at: new Date().toISOString()
  };
  state.products.push(product);
  persist();
  return product;
}

function updateProduct(id, payload) {
  const state = getState();
  const index = state.products.findIndex((p) => p.id === Number(id));
  if (index === -1) return null;
  const existing = state.products[index];
  const merged = normalizeProductInput({
    id: existing.id,
    name: payload.name ?? existing.name,
    slug: payload.slug ?? existing.slug,
    description: payload.description ?? existing.description,
    category: payload.category ?? existing.category,
    price: payload.price ?? existing.price,
    compareAtPrice: payload.compareAtPrice ?? existing.compare_at_price,
    stock: payload.stock ?? existing.stock,
    sizes: payload.sizes ?? existing.sizes,
    colors: payload.colors ?? existing.colors,
    imageUrl: payload.imageUrl ?? existing.image_url,
    featured: payload.featured ?? existing.featured
  });
  state.products[index] = { ...existing, ...merged };
  persist();
  return state.products[index];
}

function deleteProduct(id) {
  const state = getState();
  const before = state.products.length;
  state.products = state.products.filter((p) => p.id !== Number(id));
  const deleted = state.products.length < before;
  if (deleted) persist();
  return { changes: deleted ? 1 : 0 };
}

function seedProducts() {
  const state = getState();
  if (state.products.length > 0) return;
  const demoProducts = [
    {
      name: 'Classic Beige Trench Coat',
      description: 'Elegant long trench coat with a clean silhouette for a polished daily look.',
      category: 'Women',
      price: 89.99,
      compareAtPrice: 109.99,
      stock: 12,
      sizes: ['S', 'M', 'L'],
      colors: ['Beige', 'Black'],
      imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
      featured: true
    },
    {
      name: 'Oversized Cotton Hoodie',
      description: 'Soft premium hoodie with a relaxed fit for modern casual styling.',
      category: 'Men',
      price: 44.99,
      compareAtPrice: 59.99,
      stock: 25,
      sizes: ['M', 'L', 'XL'],
      colors: ['Olive', 'White', 'Charcoal'],
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      featured: true
    },
    {
      name: 'Slim Fit Black Jeans',
      description: 'Stretch denim jeans with a sleek slim fit that pairs with everything.',
      category: 'Men',
      price: 39.99,
      stock: 18,
      sizes: ['30', '32', '34', '36'],
      colors: ['Black'],
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',
      featured: false
    },
    {
      name: 'Minimal Satin Dress',
      description: 'Flowing satin dress designed for special occasions and evening events.',
      category: 'Women',
      price: 74.99,
      stock: 9,
      sizes: ['S', 'M', 'L'],
      colors: ['Champagne', 'Emerald'],
      imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
      featured: true
    },
    {
      name: 'Kids Everyday Set',
      description: 'Comfortable two-piece outfit made for daily movement and all-day wear.',
      category: 'Kids',
      price: 29.99,
      stock: 30,
      sizes: ['4Y', '6Y', '8Y'],
      colors: ['Blue', 'Pink'],
      imageUrl: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80',
      featured: false
    }
  ];
  demoProducts.forEach(createProduct);
}

module.exports = {
  listProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts
};
