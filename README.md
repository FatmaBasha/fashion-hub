# FashionHub Full-Stack Clothing Store

An English full-stack fashion e-commerce starter project with a clean storefront and a strong backend.

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
- SQLite database for quick local setup

## Project Structure

- `frontend/` → static storefront files
- `backend/` → API server and database logic
- `docs/` → optional notes / future expansion

## Run the Backend

```bash
cd backend
npm install
cp .env.example .env
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
- PostgreSQL migration
- Admin dashboard UI
- Arabic / English language switcher

## Notes
- The frontend currently uses a demo customer account automatically for easy testing.
- The backend seeds demo products automatically on first run.
- This is a strong starter project and can be turned into a production store with the upgrades above.


## Accounts
- Admin login is created automatically on first backend run:
  - Email: admin@fashionhub.com
  - Password: Admin123!
- Customers can create their own account from the Login modal using the new Create Account button.
