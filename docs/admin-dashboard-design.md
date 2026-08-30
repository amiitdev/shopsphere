# Design Document: Admin Dashboard

## Overview
The Admin Dashboard is a restricted area of the ShopSphere application allowing
admin accounts to manage the product catalog and fulfill/cancel orders.
Admin accounts **cannot purchase products** — the buy flow (cart mutations and
checkout) is blocked for them both in the UI and on the server.

## 1. Data Model Changes
### User Model
- `role`: String (Enum: `user`, `admin`), Default: `user`.

### Order Model
- `status`: String (Enum: `pending`, `confirmed`, `delivered`, `cancelled`).
  The same enum applies to order items.

## 2. API Specifications

### Authentication & Authorization
- **Middleware**: `requireAuth` → `requireAdmin` for all `/api/admin/*` routes.
- `requireAdmin` returns `403 Forbidden` if `req.user.role !== 'admin'`.
- `forbidAdmin` returns `403` when an admin performs a customer action
  (cart mutation or checkout).

### Product Endpoints (Admin)
Base: `/api/admin` (all require admin role)

| Method | Endpoint | Role | Description | Payload |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/admin/products` | Admin | Create product | `{ title, price, description, category, image }` |
| PUT | `/api/admin/products/:id` | Admin | Update product | Same fields (partial allowed) |
| DELETE | `/api/admin/products/:id` | Admin | Delete product | N/A |
| POST | `/api/admin/images` | Admin | Upload product image (`multipart/form-data`, field `image`) | PNG/JPEG/WebP ≤ 5MB |

- `sourceId` is auto-assigned server-side (max existing `sourceId` + 1).
- `rating` defaults to `{ rate: 0, count: 0 }` unless provided.
- `image` must be an `http(s)://` URL or a `/images/` or `/uploads/` path (XSS guard).
- Uploaded images are stored in `backend/uploads/` (gitignored) and served
  statically at `/uploads` (Vite proxies `/uploads` → backend in dev).

### Order Endpoints (Admin)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| GET | `/api/admin/orders` | Admin | List all orders across users |
| PATCH | `/api/admin/orders/:id/cancel` | Admin | Cancel a pending/confirmed order |

- Cancel is refused for already-`cancelled` (400) and `delivered` (400) orders.
- General status transitions (`pending → confirmed → delivered`) remain available
  at the existing `PATCH /api/orders/:id/status` admin endpoints.

### Customer Buy Flow (Admin-blocked)
| Endpoint | Guard |
| :--- | :--- |
| `POST /api/cart/:cartId/items`, `PATCH`/`DELETE` cart items, `DELETE /api/cart/:cartId` | `optionalAuth` + `forbidAdmin` → 403 for admins |
| `POST /api/orders` | `optionalAuth` + `forbidAdmin` → 403 for admins |

## 3. UI/UX Design
### Routing (all protected by `AdminRoute`)
- `/admin` → `AdminLayout` → `AdminDashboard` (stats summary).
- `/admin/products` → `AdminProducts` (create/edit/delete product table).
- `/admin/orders` → `AdminOrders` (list, filter, advance status, cancel order).

### Components
- `AdminRoute`: redirects non-admins to `/`.
- `AdminLayout`: responsive shell — sidebar navigation on desktop; collapsed
  hamburger menu (opens the nav) with a top bar on mobile (< 768px).
- `AdminProducts`: product form + table with Edit/Delete actions; the Image field
  supports uploading a file (client-side type/size checks, preview thumbnail) or
  pasting a URL via a picker of the seed images.
- `AdminOrders`: order cards with status badges, "Mark Confirmed/Delivered" and
  "Cancel Order" actions; filters and tables wrap/scroll on small screens.
- `AdminDashboard`: product/order counts and per-status breakdown.

## 4. Security Considerations
- **Input Validation**: all admin inputs validated with Zod.
- **Authorization**: server-side role check on every `/api/admin/*` request.
- **XSS**: product images restricted to `http(s)`, `/images/`, or `/uploads/` paths.
- **Uploads**: mime-type allow-list (PNG/JPEG/WebP), 5MB size cap, unique
  random filenames, served from the dedicated, gitignored `backend/uploads/`
  directory (`MAX_UPLOAD_BYTES`).
- **Admin purchase lockout**: enforced server-side (`forbidAdmin`); UI hides
  cart controls so it cannot be bypassed by forged requests.
- **Audit**: cancellations are reflected in order status `cancelled` per item.
- **Responsive**: admin UI is usable on mobile (hamburger nav, stacking
  forms/cards, horizontally scrollable data tables).