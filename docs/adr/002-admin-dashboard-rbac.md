# ADR 002: Admin Dashboard and Role-Based Access Control (RBAC)

## Status
Accepted

## Context
The ShopSphere platform previously lacked administrative capabilities. Admins need
to manage the product catalog (CRUD) and handle order exceptions (e.g., cancelling
orders when stock is unavailable). The system had no concept of user roles, and
admins would otherwise be able to purchase products like customers.

## Decision
We will implement a Role-Based Access Control (RBAC) system and a dedicated Admin
Dashboard. Admin accounts are **shop managers, not customers**: admins manage the
catalog and orders but are blocked from the buy flow.

### 1. User Roles
- Add a `role` field to the `User` model in MongoDB.
- Roles: `user` (default), `admin`.
- The `role` is included in the JWT payload to avoid database lookups on every
  admin request.

### 2. Backend API Changes
All admin endpoints live under `/api/admin` and require `requireAuth` +
`requireAdmin`.

#### Product Management
- `POST /api/admin/products`: Create a product (server assigns `sourceId`,
  defaults `rating`).
- `PUT /api/admin/products/:id`: Update a product (partial update allowed).
- `DELETE /api/admin/products/:id`: Remove a product.
- `POST /api/admin/images`: Upload a product image (PNG/JPEG/WebP ≤ 2MB) stored in
  `backend/uploads/` and served at `/uploads` (closed loop with the Image field in
  the product form and the `/uploads/` path validation).
- `GET /api/products`: (Existing, public) List products.

#### Order Management
- `GET /api/admin/orders`: List all orders across all users.
- `PATCH /api/admin/orders/:id/cancel`: Cancel an order (order and all items set
  to `cancelled`; refused for already-cancelled or delivered orders).
- Existing admin transitions remain at `PATCH /api/orders/:id/status` and
  `PATCH /api/orders/:id/items/:productId/status`.

#### Admins Cannot Purchase
- New `forbidAdmin` middleware returns 403 when an authenticated `admin` calls:
  - cart mutations (`POST /:cartId/items`, `PATCH/DELETE` item, clear cart), or
  - `POST /api/orders` (checkout).
- Enforced server-side so the UI restriction cannot be bypassed.

### 3. Frontend Implementation
- Route `/admin` behind an `AdminRoute` guard that checks `user.role === 'admin'`.
- `AdminLayout` provides the sidebar shell with nested routes:
  - `/admin` → Dashboard (stats summary)
  - `/admin/products` → Product table (create/edit/delete)
  - `/admin/orders` → Order cards (status advance + cancel)
- The cart button, "Add to Cart", cart, and checkout pages are hidden/blocked for
  admins in the UI.

## Consequences
- **Positive**: Enables platform management without direct DB manipulation.
- **Positive**: Secure separation of concerns between customers and administrators.
- **Positive**: Admins cannot accidentally (or maliciously) place orders.
- **Negative**: Slightly increases JWT size.
- **Constraint**: Initial admin must be created via the seed script or a manual DB
  update since there is no "Register as Admin" UI (`npm run seed` creates
  `admin@shopsphere.com`).

## Validation
- Integration tests verify that `role: 'user'` receives 403 on admin endpoints.
- Integration tests verify admin product CRUD, order cancellation, and that admins
  are blocked from cart mutations and checkout while regular users/guests can order.