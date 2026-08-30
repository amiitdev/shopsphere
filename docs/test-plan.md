# Test Plan — ShopSphere

## Scope
Full store: catalog, auth (signup/login/sessions), cart, checkout, payment, orders,
and the dark-themed React frontend.

## Strategy
- **Backend:** integration tests against the Express app + live local MongoDB using
  `supertest`, run with Node `node:test` via `tsx --test tests/*.test.ts` (npm test).
- **Frontend:** component tests with React Testing Library + Vitest (jsdom), mocking `fetch`.

## Backend (`backend/tests/`)
| File | Cases | Covers |
|------|-------|--------|
| `products.test.ts` | list, category filter, invalid query 400, id 404s, categories | catalog read paths |
| `auth.test.ts` | signup, login, /me, logout | credential + session handling |
| `cart.test.ts` | create, add, update qty, remove, clear, 404 unknown cart | cart service + routes |
| `order.test.ts` | checkout success, empty cart 400, order detail 404, /me requires auth | buy flow + authz |
| `admin.test.ts` | list orders, status filter, order confirmation/delivery, item status update, non-admin restriction | admin order management & status flow |

Run: `cd backend && npm test`  → 35 tests (runs on isolated database `shopsphere_test`)

## Frontend (`frontend/tests/`)
| File | Cases | Covers |
|------|-------|--------|
| `CatalogPage.test.tsx` | renders products, request-failure error | catalog list + add-to-cart wiring |
| `ProductCard.test.tsx` | renders details + detail link | card UI |
| `Navbar.test.tsx` | brand, theme toggle, cart badge, auth links | nav + theming |
| `CartPage.test.tsx` | empty cart state, items + order summary | cart page + totals |

Run: `cd frontend && npm test`  → 11 tests

## Data setup
`cd backend && npm run seed`  →  deletes products and reseeds the 20-product catalog
with AI-generated images (IDs 1–20, served from `/images`). The server does NOT
auto-seed. Since tests run on an isolated test database (`shopsphere_test`), running
tests will no longer clear your development catalog data in the `shopsphere` database.

## Coverage notes
- Critical read paths, input validation, the buy flow, and admin order management are covered.
- Cart totals are server-computed; client totals are display-only.
- Future: add E2E (full checkout journey + seeded auth) and load tests.
