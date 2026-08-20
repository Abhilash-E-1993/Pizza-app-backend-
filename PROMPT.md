# Pizza App — Frontend Handoff Prompt

This file contains:
1. **Part A** — Complete backend architecture + API contract (context for the frontend Cline).
2. **Part B** — The exact prompt to paste into the Cline session that has the **frontend** folder.

---

# PART A — Backend Architecture & API Contract

## Stack

- **Runtime:** Node.js + Express 4
- **DB:** MongoDB Atlas via Mongoose 8
- **Auth:** JWT in an `httpOnly` cookie named `token` (Bearer header also accepted as fallback)
- **Images:** Cloudinary (uploads via `multipart/form-data`, stored as HTTPS URLs)
- **Compression:** gzip enabled on all responses (`compression` middleware)
- **Hosting:** Render (backend) + Netlify (frontend)

## Folder Structure (backend)

```
src/
├── index.js                  # entrypoint: middleware, routes, 404 + JSON error handlers, DB-first boot
├── config/
│   ├── serverConfig.js       # env vars (PORT, DB_URL, SECRET_KEY, JWT_EXPIRY, Cloudinary)
│   ├── dbConfig.js           # mongoose.connect with pool size 10, 5s selection timeout
│   └── cloudinaryConfig.js   # cloudinary v2 config
├── Router/                   # route definitions only
│   ├── authRoute.js          # /auth
│   ├── userRouter.js         # /users
│   ├── productRoute.js       # /products
│   ├── cartRouter.js         # /user/cart
│   └── orderRoute.js         # /user
├── controller/               # req/res handling, consistent JSON shape
├── services/                 # business logic + validations (throw { reason, statuscode })
├── repository/               # data access (mongoose queries; .lean() on read paths)
├── schema/                   # mongoose models: User, product, Cart, Order
├── middlewares/
│   └── multerMiddleware.js   # disk upload to uploads/, images only, 5MB max
├── validation/
│   └── authValidation.js     # isLoggedIn + isAdmin middleware
└── utils/                    # error classes (AppError, BadRequestError, ...)
```

**Request flow:** `Router → (isLoggedIn/isAdmin) → Controller → Service → Repository → MongoDB`

## Auth Model (IMPORTANT for frontend)

- Login sets cookie `token` — `httpOnly`, 7-day expiry, `sameSite: none` + `secure` in production (cross-site Netlify → Render), `sameSite: lax` in local dev.
- **The frontend JS cannot read the cookie.** To know if the user is logged in (e.g. on page refresh), call `GET /auth/verify` with credentials.
- Every request to protected endpoints must send credentials:
  - fetch: `fetch(url, { credentials: 'include' })`
  - axios: `axios.create({ baseURL, withCredentials: true })`
- JWT payload: `{ id, email, role }` — role is `USER` or `ADMIN`.
- CORS allowed origins: `FRONTEND_URL` env (https://pizzahub1993.netlify.app) + `http://localhost:5173`, `http://localhost:4173`, `http://localhost:3000`.

## Standard Response Shapes

- Success: `{ success: true, message: string, data: ... }` (register returns `user` instead of `data`)
- Error (ALL endpoints, including 404s): `{ success: false, message: string }`
- HTTP codes used: `200`, `201`, `400` (validation/business rule), `401` (not authenticated), `403` (not admin), `404` (not found), `500` (server error)


## API Endpoints (current, post-fix)

### Health
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/ping` | — | `{ success: true, message: 'pong' }` |
| GET | `/` | — | backend alive message |

### Auth
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/auth/login` | — | `{ email, password }` | `data: { role, userData: { id, email, firstName } }` + sets `token` cookie |
| POST | `/auth/logout` | — | — | clears cookie |
| GET | `/auth/verify` | ✅ | — | `data: { id, email, role }` — **use this to restore session on app load** |

### Users
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/users/register` | — | `{ firstName, lastName?, email, password, mobileNumber, address? }` | `201`, `{ success, message, user }` (no password in `user`). Client-sent `role` is **ignored** — always `USER`. 400s: missing fields, password < 6, duplicate email/mobile |

### Products
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/products` | — | — | `data: Product[]` (may be `[]`), `Cache-Control: public, max-age=60` |
| GET | `/products/:id` | — | — | `data: Product`, 400 invalid id, 404 not found |
| POST | `/products/create` | ✅ ADMIN | `multipart/form-data`: `image` (file ≤5MB, required), `productName`, `price`, `inStock`, `category`, `quantity`, `description` | `201`, `data: product` |
| DELETE | `/products/delete/:id` | ✅ ADMIN | — | `data: deletedProduct` |

### Cart (all require auth)
| Method | Path | Response |
|---|---|---|
| GET | `/user/cart/` | `data: cart` (auto-created if missing; items with deleted products filtered out) |
| POST | `/user/cart/add/:productId` | increments qty if present, else adds. 400 out of stock / qty exceeds available, 404 product missing |
| POST | `/user/cart/remove/:productId` | decrements qty, removes at 0. **Idempotent** — removing an absent item still returns 200 |
| DELETE | `/user/cart/clear` | empties the cart |

Cart shape: `{ _id, userId, items: [{ product: Product, quantity }], createdAt, updatedAt }`

### Orders (all require auth)
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/user/` | `{ paymentMethod?: 'CASH_ON_DELIVERY'\|'ONLINE', address?: string (min 10 chars) }` | `201`. Creates order from cart, **then clears the cart**. Address falls back to profile address. 400: empty cart / bad address / bad payment method |
| GET | `/user/` | — | `data: Order[]` newest first. **Empty array with 200 when no orders — NOT an error** |
| GET | `/user/details/:orderId` | — | `data: Order`. 400 invalid id, 404 not found |
| PATCH | `/user/:orderId/status` | `{ status }` | status ∈ `ORDERED, CANCELLED, DELIVERD, PROCESSING, OUT_OF_DELIVERY`. 400 invalid status, 404 unknown order |

Order shape: `{ _id, userId, items: [{ product: Product|null, quantity }], TotalPrice, status, address, paymentMethod, createdAt, updatedAt }`

⚠️ The status enum value really is `DELIVERD` (typo kept for backward compatibility with existing DB data — display it as "Delivered" in the UI).
⚠️ `product` inside cart/order items can be `null` if the product was deleted — always guard.

## Data Models

- **User:** `firstName, lastName?, email (unique), password (hashed), mobileNumber (unique), address?, role: USER|ADMIN`
- **Product:** `productName (unique, min 5), description?, image (cloudinary url), category: Veg|Non-Veg|drinks|sides, quantity, price, inStock`
- **Cart:** `userId (unique), items: [{ product → productId, quantity }]`
- **Order:** `userId, items, TotalPrice, status, address, paymentMethod`

## What the backend just fixed (so you know what changed)

1. Empty orders list now returns **200 + `[]`** (was 404 → caused error toasts on fresh accounts).
2. Cart is **cleared after placing an order** (was causing duplicate orders).
3. Cart auto-creates on first access; removing absent items is a safe no-op (200).
4. Logout now actually clears the cookie (matching `sameSite`/`secure` attributes).
5. Login cookie persists **7 days** (was session-cookie + 1h JWT → constant surprise logouts).
6. New `GET /auth/verify` endpoint for session restore.
7. Product create/delete now require **ADMIN** (401 not logged in / 403 not admin).
8. Public registration always creates `USER` (client `role` ignored) — admins are made via DB.
9. New product images are uploaded as **HTTPS + auto-optimized** (`f_auto,q_auto,w_800`). Old records may still hold `http://` URLs — upgrade them before rendering: `url.replace('http://res.cloudinary.com', 'https://res.cloudinary.com')`.
10. All errors are JSON `{ success: false, message }` — no more HTML error pages, safe to always call `.json()`.
11. Perf: gzip compression, `.lean()` DB reads, indexes on `cart.userId` / `order.userId`, connection pooling, 60s cache header on `GET /products`.

## Deployment env notes (Render dashboard)

- Set `JWT_EXPIRY=7d` (was `1h`), keep `FRONTEND_URL=https://pizzahub1993.netlify.app` (no trailing slash), `NODE_ENV=production`.
- Optional: keep the free instance warm by pinging `GET /ping` every 5–10 min (cron-job.org / UptimeRobot) to reduce cold starts.

---


# PART B — PROMPT TO PASTE INTO THE FRONTEND CLINE

> ⬇️ Copy everything below this line and paste it to the Cline that has the frontend folder ⬇️

---

You are working on the **React (Vite) frontend** of a Pizza ordering app. The backend (Express + MongoDB, already fixed and deployed separately) exposes a cookie-based REST API. Your job: **fix known bugs, kill toast spam, gate the UI behind auth, speed things up, and polish the UI — WITHOUT drastic redesigns.** Keep the current design language, colors, and layout structure; only refine.

## Backend API contract (already live — do NOT change backend calls away from this)

Base URL: `import.meta.env.VITE_API_URL` (Render URL in prod, `http://localhost:8080` locally). Create ONE shared axios instance:

```js
// src/api/axiosInstance.js
import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
export default api;
```

Auth is an **httpOnly cookie** (`token`, 7 days) — JS cannot read it. Session restore must go through the API.

Endpoints (success: `{ success: true, message, data }`, error: `{ success: false, message }`):

- `POST /auth/login` `{email,password}` → `data: { role, userData: { id, email, firstName } }`
- `POST /auth/logout` → clears cookie
- `GET /auth/verify` → `data: { id, email, role }` (401 if not logged in)
- `POST /users/register` `{firstName,lastName?,email,password,mobileNumber,address?}` → 201 `{ success, message, user }`
- `GET /products` → `data: Product[]` (can be `[]`)
- `GET /products/:id` → `data: Product`
- `POST /products/create` (ADMIN, multipart field `image` ≤5MB) / `DELETE /products/delete/:id` (ADMIN) → 401/403 if unauthorized
- `GET /user/cart/` → `data: cart` | `POST /user/cart/add/:productId` | `POST /user/cart/remove/:productId` | `DELETE /user/cart/clear`
- `POST /user/` `{paymentMethod?, address?}` → creates order from cart AND CLEARS THE CART (201)
- `GET /user/` → `data: Order[]` newest first, **`[]` with 200 when empty — not an error**
- `GET /user/details/:orderId` | `PATCH /user/:orderId/status` `{status}` with status ∈ `ORDERED|CANCELLED|DELIVERD|PROCESSING|OUT_OF_DELIVERY` (`DELIVERD` is a known backend typo — display as "Delivered")
- Product: `{ _id, productName, description, image, category: 'Veg'|'Non-Veg'|'drinks'|'sides', quantity, price, inStock }`
- Cart/Order items: `{ product: Product | null, quantity }` — **product can be null if deleted; guard every `.product.` access**


## TASK 1 — Gate the app behind auth (menu bar must NOT show before login)

1. Create an `AuthContext` that on app mount calls `GET /auth/verify` (once) and exposes `{ isAuthenticated, user, role, authLoading, login(), logout() }`.
2. While `authLoading` is true, render a small loader/splash — not the navbar.
3. **Do not render the Navbar/menu links (Menu, Cart, Orders, etc.) until `isAuthenticated === true`.** On the login/register pages show either no navbar or a minimal logo-only header.
4. Add a `ProtectedRoute` wrapper: if not authenticated → `Navigate to="/login"` (preserve the intended URL in location state and redirect back after login).
5. After successful login set context state from the response (`data.role`, `data.userData`) and navigate to the menu/home page.
6. `logout()` must call `POST /auth/logout`, clear context state, and navigate to `/login`.

## TASK 2 — Fix the toast spam (react-hot-toast)

1. Render **exactly one** `<Toaster />` in `App.jsx` (search the whole repo — delete duplicates in pages/components). Configure `toastOptions` with sensible durations (success ~2.5s, error ~3.5s).
2. **Never call `toast.*` inside a `useEffect` body that runs on mount** (React 18 StrictMode double-invokes effects in dev → duplicate toasts). Toasts belong in event handlers and mutation results only.
3. Dedupe repeating toasts with ids: `toast.error(msg, { id: 'auth-error' })`, `toast.success('Added to cart', { id: `add-${productId}` })`.
4. Add ONE axios response interceptor on the shared instance: on `401`, if the request was NOT `/auth/verify` and the user is on a protected page → clear auth state, redirect to `/login`, and show a **single** toast with `id: 'session-expired'`. Do NOT also toast in individual `.catch` blocks for the same failure — centralize.
5. Do NOT show an error toast when `GET /user/` returns `data: []` — that is an empty state, render "No orders yet" UI instead.

## TASK 3 — Performance (Render cold-start lag is accepted; fix everything else)

1. **Route-level code splitting:** `React.lazy()` + `<Suspense>` for every page (Menu, Cart, Orders, OrderDetails, Login, Register, Admin pages).
2. Fetch products ONCE and cache in a context/store — don't refetch on every navigation to the menu page. The backend sends `Cache-Control: max-age=60` and ETag, so revalidation is cheap.
3. All product `<img>` tags: `loading="lazy"` + fixed aspect-ratio container to stop layout shift. Rewrite image URLs through Cloudinary transforms for thumbnails: `url.replace('/upload/', '/upload/f_auto,q_auto,w_500/')` and upgrade any legacy `http://res.cloudinary.com` to `https://`.
4. Memoize expensive renders: `React.memo` for product cards, `useMemo` for filtered/category-grouped lists, `useCallback` for handlers passed to memoized children.
5. Cart +/- buttons: disable while the mutation request is in flight (prevents double-clicks and quantity desync). Update cart state from the response (the API returns the full updated cart) — no extra refetch needed.
6. Remove all stray `console.log`s. Ensure the production build is used on Netlify (`npm run build`).
7. Optional warm-up: fire `api.get('/ping')` once on app load so a cold Render instance wakes while the user is still on the login screen.


## TASK 4 — Small bug fixes & UX polish (no redesign)

1. Guard `item.product === null` in cart + order rendering (show "Item unavailable" row, exclude from totals).
2. After "Place Order" succeeds: cart context must be emptied (backend clears it) → redirect to orders page with one success toast.
3. Format prices consistently (₹ with `toLocaleString('en-IN')`). Show order status as colored chips. Show cart item-count badge on the navbar (only when logged in).
4. Add skeleton cards (or a simple shimmer) while products load; proper empty states with an icon/emoji for empty cart and empty orders.
5. Buttons that submit forms disable + show a spinner/`...` while pending; inline field errors under inputs using backend `message` (e.g. "user with this email already exists", "password must be at least 6 characters").
6. Checkout: let the user pick `paymentMethod` (`CASH_ON_DELIVERY` default or `ONLINE`) and optionally edit the delivery `address` (send it in the `POST /user/` body; if omitted the profile address is used; backend requires ≥ 10 chars).
7. Admin product create/delete: send the shared axios instance (cookie goes automatically). Handle 401/403 with a single toast + redirect. Only render admin links when `role === 'ADMIN'` from `/auth/verify`/login response.
8. Navbar: mobile hamburger must close on navigation and on logout; it must never render for logged-out users.
9. Fix any key warnings, missing `alt`s, and uncontrolled→controlled input warnings in the console.

## Ground rules

- Use ONLY libraries already in the frontend `package.json` (React, react-router-dom, axios/fetch, react-hot-toast, tailwind/css — whatever is present). No new UI frameworks.
- Keep the existing visual identity: same palette, fonts, spacing scale. Refine, don't redesign.
- Every API error message shown to the user should come from `error.response?.data?.message` with a generic fallback.
- Verify at the end: run the dev server, walk through register → login → menu → add to cart → order → orders → logout, and confirm zero duplicate toasts and no navbar before login.

---

