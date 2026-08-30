# ADR 0002: Cart, Order, Payment & Buy Flow

## Status
Accepted

## Context
ShopSphere needs shopping capabilities: a cart, checkout, orders, and payment.
There is no user-auth yet, so shopping is anonymous and keyed by a client cart id.

## Decision
- **Cart** is a MongoDB document keyed by `cartId` (UUID from the client,
  persisted in `localStorage`). Items store a snapshot (productId, title, price,
  image, quantity) taken from the catalog at add time.
- **Order** is created from a cart at checkout and stores an immutable snapshot
  of items, computed totals (subtotal, tax @8%, shipping), customer details,
  and the payment result.
- **Payment** goes through a `PaymentService` with a simulated provider that
  validates card shape and returns a fake transaction id + `paid` status.
  The interface is designed for a future Stripe provider (no live keys here).
- **Buy flow:** `POST /api/orders` validates the cart, computes totals,
  processes payment, persists the order, and clears the cart.
- **Totals:** subtotal = Σ(price×qty); tax = 8%; shipping = free over $50 else $5.99.

## Endpoints
- `POST /api/cart` → create cart, returns `cartId`
- `GET /api/cart/:cartId` → get cart
- `POST /api/cart/:cartId/items` → add/update item
- `PATCH /api/cart/:cartId/items/:productId` → set quantity
- `DELETE /api/cart/:cartId/items/:productId` → remove item
- `DELETE /api/cart/:cartId` → clear cart
- `POST /api/orders` → checkout (cartId + customer) → order
- `GET /api/orders/:id` → order detail

## Consequences
- Anonymous cart enables quick MVP; can later be merged to a user account.
- Simulated payment keeps the build runnable without external secrets.
- Orders are the source of truth for fulfilled purchases.
