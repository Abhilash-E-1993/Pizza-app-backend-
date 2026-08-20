# Pizza App Backend

## Project Overview

This repository contains the backend for a Pizza ordering application built with Node.js, Express, MongoDB, and Cloudinary for image uploads. It exposes REST APIs for user registration, login/logout, product management, cart operations, and order management.

The backend is designed to support a frontend that can:
- register and login users
- fetch and display pizzas/products
- upload new products with images
- add/remove items from a user cart
- create and view orders
- update order status

> The frontend must include cookie-based authentication because the login flow sets a `token` cookie used for protected endpoints.

---

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with the environment variables listed below.

4. Start the backend server:

```bash
npm start
```

---

## Required Environment Variables

The backend uses `dotenv` to load the following variables:

- `PORT` - port for the Express server
- `DB_URL` - MongoDB connection string
- `JWT_SECRET` or `SECRET_KEY` - secret for signing JWT tokens
- `JWT_EXPIRY` - JWT expiration value (e.g. `1d`, `7d`)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

Example `.env`:

```env
PORT=5000
DB_URL=mongodb://localhost:27017/pizza-app
JWT_SECRET=supersecret
JWT_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## Server Base URL

Assuming the server is running locally on the configured port, the base URL is:

```
http://localhost:<PORT>
```

The current backend allows CORS from the `FRONTEND_URL` env variable plus `http://localhost:5173`, `http://localhost:4173` and `http://localhost:3000` for local development, and sends cookies, so the frontend should use `credentials: 'include'` for protected routes.

---

## API Endpoints

### Health Check

- `GET /ping`
- Response:
  - `200 OK`
  - `{ message: 'pong' }`

---

## Authentication

### Login

- `POST /auth/login`
- Content-Type: `application/json`
- Body:
  - `email` (string, required)
  - `password` (string, required)

- Behavior:
  - Verifies email and password
  - On success, returns a cookie named `token`
  - Response contains user role and basic user data

- Success response:
  - `200 OK`
  - `{ success: true, message: 'login successful', data: { role, userData: { email, firstName } } }`

- Error responses:
  - `404` if email not found
  - `401` if password invalid

### Logout

- `POST /auth/logout`
- Behavior:
  - Clears the `token` cookie (using the same cookie attributes it was set with)
- Success response:
  - `200 OK`
  - `{ success: true, message: 'logout successful' }`

### Verify Session

- `GET /auth/verify`
- Auth: required (`token` cookie or `Authorization: Bearer <token>`)
- Behavior:
  - Validates the current JWT and returns the logged-in user's basic data
  - Use it on app load to restore the session (the cookie is httpOnly, so JS cannot read it)
- Success response:
  - `200 OK`
  - `{ success: true, data: { id, email, role } }`
- Error responses:
  - `401` if the token is missing, invalid or expired

---

## User Routes

### Register User

- `POST /users/register`
- Content-Type: `application/json`
- Body:
  - `firstName` (string, required)
  - `lastName` (string, optional)
  - `email` (string, required, unique)
  - `password` (string, required)
  - `mobileNumber` (string, required, unique)
  - `address` (string, optional)
  - `role` (string, optional, defaults to `USER`)

- Behavior:
  - Creates a new user
  - Creates an empty cart for that user

- Success response:
  - `201 Created`
  - `{ success: true, message: 'user registered successfully', user }`
  - `user` never contains the password hash

- Notes:
  - The `role` field is ignored on public registration — every new user is created as `USER`. To create an admin, set `role: 'ADMIN'` directly in the database.

- Error responses:
  - `400` if user email/mobile already exists (message says which one)
  - `400` if required fields are missing or password is shorter than 6 characters

---

## Product Routes

### Create Product

- `POST /products/create`
- Auth: required + `ADMIN` role (`401` if not logged in, `403` if not admin)
- Content-Type: `multipart/form-data`
- Form fields:
  - `productName` (string, required, unique, min length 5)
  - `description` (string, optional, min length 5)
  - `price` (number, required)
  - `inStock` (boolean, required)
  - `category` (string, required, one of `Veg`, `Non-Veg`, `drinks`, `sides`)
  - `quantity` (number, required)
  - `image` (file, required)

- Behavior:
  - Uploads the image to Cloudinary
  - Saves product data with the Cloudinary URL

- Success response:
  - `201 Created`
  - `{ success: true, message: 'product created successfully', data: product }`

- Error responses:
  - `400` if image missing or required fields invalid

### Get All Products

- `GET /products`
- Returns all products
- Success response:
  - `200 OK`
  - `{ success: true, message: 'products fetched successfully', data: [ products ] }`

### Get Product by ID

- `GET /products/:id`
- Parameters:
  - `id` - product MongoDB `_id`
- Success response:
  - `200 OK`
  - `{ success: true, message: 'product fetched successfully', data: product }`

### Delete Product

- `DELETE /products/delete/:id`
- Auth: required + `ADMIN` role (`401` if not logged in, `403` if not admin)
- Parameters:
  - `id` - product MongoDB `_id`
- Success response:
  - `200 OK`
  - `{ success: true, message: 'product deleted successfully', data: deletedProduct }`

---

## Cart Routes

> All cart routes require authentication via the `token` cookie.

### Get Cart

- `GET /user/cart/`
- Returns the authenticated user's cart
- Success response:
  - `200 OK`
  - `{ success: true, message: 'cart fetched successfully', data: cart }`

### Add Product to Cart

- `POST /user/cart/add/:productId`
- Parameters:
  - `productId` - product MongoDB `_id`
- Behavior:
  - Adds the product to the user cart if not present
  - If present, increments quantity by 1
- Success response:
  - `200 OK`
  - `{ success: true, message: 'product added to cart', data: cart }`

### Remove Product from Cart

- `POST /user/cart/remove/:productId`
- Parameters:
  - `productId` - product MongoDB `_id`
- Behavior:
  - Decreases quantity by 1
  - If quantity reaches 0, removes the product from cart
- Success response:
  - `200 OK`
  - `{ success: true, message: 'product removed from cart', data: cart }`

### Clear Cart

- `DELETE /user/cart/clear`
- Behavior:
  - Removes every item from the user cart
- Success response:
  - `200 OK`
  - `{ success: true, message: 'cart cleared successfully', data: cart }`

---

## Order Routes

> All order routes require authentication via the `token` cookie.

### Create Order

- `POST /user/`
- Content-Type: `application/json`
- Body:
  - `paymentMethod` (string, optional, defaults to `CASH_ON_DELIVERY`, must be either `CASH_ON_DELIVERY` or `ONLINE`)
  - `address` (string, optional, min 10 characters — overrides the address saved on the user profile)
- Behavior:
  - Generates an order from the authenticated user's cart
  - Uses the cart items and the address from the body (falling back to the user profile address)
  - Calculates `TotalPrice` automatically
  - Clears the cart after the order is placed

- Success response:
  - `201 Created`
  - `{ success: true, message: 'order created successfully', data: order }`

- Error responses:
  - `400` if the cart is empty, the address is missing/too short, or the payment method is invalid

### Get User Orders

- `GET /user/`
- Returns all orders for the authenticated user, newest first
- Success response:
  - `200 OK`
  - `{ success: true, message: 'orders fetched successfully', data: [ orders ] }`
  - `data` is an empty array `[]` when the user has no orders (this is NOT an error)

### Get Order Details

- `GET /user/details/:orderId`
- Parameters:
  - `orderId` - order MongoDB `_id`
- Success response:
  - `200 OK`
  - `{ success: true, message: 'order fetched successfully', data: order }`

### Update Order Status

- `PATCH /user/:orderId/status`
- Content-Type: `application/json`
- Body:
  - `status` (string, required)
- Allowed status values:
  - `ORDERED`
  - `CANCELLED`
  - `DELIVERD`
  - `PROCESSING`
  - `OUT_OF_DELIVERY`
- Success response:
  - `200 OK`
  - `{ success: true, message: 'order updated successfully', data: order }`
- Error responses:
  - `400` if the status value is not one of the allowed values
  - `404` if the order does not exist

---

## Authentication Details

- Login stores a JWT in a cookie named `token`. The cookie is `httpOnly` and persists for 7 days (matches `JWT_EXPIRY`).
- In production the cookie is set with `sameSite: 'none'` + `secure: true` (cross-site frontend), in development with `sameSite: 'lax'`.
- The middleware also accepts an `Authorization: Bearer <token>` header as a fallback to the cookie.
- Protected routes use `isLoggedIn` middleware; admin-only routes additionally use `isAdmin`.
- If the token is missing or invalid, the request returns `401 Unauthorized` with `{ success: false, message }`.
- All error responses across the API use the shape `{ success: false, message }`.
- Frontend must send requests with credentials enabled:

```js
fetch(url, {
  method: 'GET',
  credentials: 'include',
});
```

---

## Data Models

### User

Properties:
- `firstName`: string
- `lastName`: string
- `email`: string
- `password`: string (stored hashed)
- `mobileNumber`: string
- `address`: string
- `role`: `USER` or `ADMIN`

### Product

Properties:
- `productName`: string
- `description`: string
- `image`: string (Cloudinary URL)
- `category`: one of `Veg`, `Non-Veg`, `drinks`, `sides`
- `quantity`: number
- `price`: number
- `inStock`: boolean

### Cart

Properties:
- `userId`: ObjectId reference to `User`
- `items`: array of:
  - `product`: ObjectId reference to `product`
  - `quantity`: number

### Order

Properties:
- `userId`: ObjectId reference to `User`
- `items`: array of:
  - `product`: ObjectId reference to `product`
  - `quantity`: number
- `TotalPrice`: number
- `status`: `ORDERED`, `CANCELLED`, `DELIVERD`, `PROCESSING`, `OUT_OF_DELIVERY`
- `address`: string
- `paymentMethod`: `CASH_ON_DELIVERY` or `ONLINE`

---

## Frontend Integration Notes

- The backend is cookie-based auth. Use `credentials: 'include'` for login and protected requests.
- Use `/auth/login` to sign in, `/auth/logout` to sign out, and `GET /auth/verify` on app load to restore the session.
- After registration, login is still required to receive the `token` cookie.
- The cart endpoints work from the logged-in user's cart, so the frontend should not send user IDs directly.
- Product creation requires multipart upload with `image` as the file field (max 5MB, images only) and an ADMIN account.
- `GET /products` returns all products; `GET /products/:id` returns a single pizza product.
- `POST /user/` creates an order from the current cart and clears the cart. The frontend should allow users to choose a payment method, optionally pass a delivery `address`, and display the cart total.
- `GET /user/` returns `data: []` when there are no orders — render an empty state, not an error toast.
- Cart/order items may contain `product: null` if a product was deleted from the store — always guard against it.
- Product `image` URLs from new uploads are HTTPS Cloudinary URLs. Older records may still hold `http://` URLs — replace `http://res.cloudinary.com` with `https://res.cloudinary.com` before rendering.

---

## Folder Structure

- `src/index.js` — app entrypoint
- `src/config/` — config, database, Cloudinary setup
- `src/Router/` — Express route definitions
- `src/controlller/` — request handlers
- `src/services/` — business logic and validations
- `src/repository/` — data access layer for MongoDB
- `src/schema/` — Mongoose schema definitions
- `src/middlewares/` — middleware like file upload
- `src/utils/` — custom error classes

---

## Important Notes for AI Frontend Development

- Do not assume the frontend can read user info from local storage; auth state is stored in a cookie.
- Use login and logout endpoints exactly as defined.
- The cart API uses `POST` for add/remove operations and `DELETE` for clear.
- The backend currently expects product uploads to include an image file under the `image` field.
- All protected routes depend on `req.cookies.token`, so the frontend must preserve cookies across requests.
- The backend uses CORS for `http://localhost:5173`, so the UI should run there or the server CORS config should be updated.

---

## Example Frontend Workflow

1. Register user via `POST /users/register`
2. Login via `POST /auth/login`
3. Fetch products via `GET /products`
4. Add product to cart via `POST /user/cart/add/:productId`
5. View cart via `GET /user/cart/`
6. Create order via `POST /user/`
7. View orders via `GET /user/`
8. Logout via `POST /auth/logout`
