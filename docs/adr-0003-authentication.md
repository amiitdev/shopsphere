# ADR 0003: Authentication (Signup / Login / Sessions)

## Status
Accepted

## Context
ShopSphere needs user accounts so customers can sign up, log in, and have
their orders associated with them. No third-party auth provider is used.

## Decision
- **Credentials:** email + password. Passwords hashed with bcrypt (cost 12).
- **Sessions:** stateless JWT stored in an **httpOnly, Secure, SameSite=Lax**
  cookie (`ss_token`). Signed with `AUTH_SECRET` from env. No client JS access.
- **Endpoints:**
  - `POST /api/auth/signup` `{ name, email, password }` → creates user, sets cookie
  - `POST /api/auth/login` `{ email, password }` → verifies, sets cookie
  - `POST /api/auth/logout` → clears cookie
  - `GET /api/auth/me` → current user (401 if none)
- **Authorization:** catalog/cart are public. Orders may be created anonymously,
  but if a session cookie is present the order is linked to `userId`, and
  `GET /api/orders/me` returns that user's orders.
- **User model:** `{ _id, name, email (unique, indexed), passwordHash, createdAt }`.

## Consequences
- Anonymous shopping still works (cart keyed by `cartId` in localStorage).
- Orders become attributable to users, enabling order history.
- Cookie-based sessions avoid token storage on the client and are XSS-safe.
