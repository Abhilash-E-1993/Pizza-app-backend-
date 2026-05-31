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
JWT_EXPIRY=1d
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

The current backend allows CORS from `http://localhost:5173` and sends cookies, so the frontend should use `credentials: 'include'` for protected routes.

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
  - Clears the `token` cookie
- Success response:
  - `200 OK`
  - `{ success: true, message: 'logout successful' }`

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
  - `{ message: 'user registered successfully', user }`

- Error responses:
  - `400` if user email/mobile already exists

---

## Product Routes

### Create Product

- `POST /products/create`
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
- Behavior:
  - Generates an order from the authenticated user's cart
  - Uses the cart items and user address
  - Calculates `TotalPrice` automatically

- Success response:
  - `201 Created`
  - `{ success: true, message: 'order created successfully', data: order }`

- Important:
  - The cart is not cleared automatically after order creation by current backend logic.

### Get User Orders

- `GET /user/`
- Returns all orders for the authenticated user
- Success response:
  - `200 OK`
  - `{ success: true, message: 'orders fetched successfully', data: [ orders ] }`

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
  - `status` (string)
- Allowed status values:
  - `ORDERED`
  - `CANCELLED`
  - `DELIVERD`
  - `PROCESSING`
  - `OUT_OF_DELIVERY`
- Success response:
  - `200 OK`
  - `{ success: true, message: 'order updated successfully', data: order }`

---

## Authentication Details

- Login stores a JWT in a cookie named `token`.
- Protected routes use `isLoggedIn` middleware.
- The middleware checks `req.cookies.token` and verifies it with `SECRET_KEY`.
- If the token is missing or invalid, the request returns `401 Unauthorized`.
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
- Use `/auth/login` to sign in and `/auth/logout` to sign out.
- After registration, login is still required to receive the `token` cookie.
- The cart endpoints work from the logged-in user's cart, so the frontend should not send user IDs directly.
- Product creation requires multipart upload with `image` as the file field.
- `GET /products` returns all products; `GET /products/:id` returns a single pizza product.
- `POST /user/` creates an order from the current cart. The frontend should allow users to choose a payment method and display the cart total.
- `PATCH /user/:orderId/status` does not enforce admin-only access in current backend code, so the frontend should treat it carefully.

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
