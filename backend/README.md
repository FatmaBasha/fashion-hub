# FashionHub Full-Stack Clothing Store

An English full-stack fashion e-commerce starter project with a clean storefront and a strong backend that works smoothly on Node 24.

## Included

### Frontend
- Modern homepage for a clothing brand
- Product grid with category and search filters
- Cart drawer
- Login modal
- Checkout flow connected to the backend APIs

### Backend
- Express.js REST API
- JWT authentication
- Customer registration/login
- Admin role support
- Product CRUD
- Cart management
- Order placement
- Order status updates
- Dashboard statistics
- JSON file storage for quick local setup with zero native build issues

## Project Structure

- `frontend/` → static storefront files
- `backend/` → API server and storage logic
- `docs/` → optional notes / future expansion

## Run the Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

The API will run at:

```bash
http://localhost:5000
```

### Default Admin Account

```text
Email: admin@fashionhub.com
Password: Admin123!
```

### Data Storage

The backend stores data in:

```text
backend/data/store.json
```

This file is created automatically on first run.

## Run the Frontend

Open `frontend/index.html` directly in your browser,
or serve it with a simple local server.

Example using VS Code Live Server or:

```bash
cd frontend
python -m http.server 5500
```

Then open:

```bash
http://localhost:5500
```

## Main API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Products
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Cart
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:itemId`

### Orders
- `POST /api/orders`
- `GET /api/orders/mine`
- `GET /api/orders` (admin)
- `PATCH /api/orders/:id/status` (admin)

### Dashboard
- `GET /api/dashboard/stats` (admin)

## Suggested Next Upgrades
- Stripe payment integration
- Image upload with Cloudinary
- Coupon system
- Wishlist
- Product reviews
- PostgreSQL or MongoDB migration
- Admin dashboard UI
- Arabic / English language switcher

## Notes
- The frontend currently uses a demo customer account automatically for easy testing.
- The backend seeds demo products automatically on first run.
- This version avoids native SQLite build failures on Windows and Node 24.
