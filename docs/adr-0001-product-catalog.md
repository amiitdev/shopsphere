# ADR 0001: Product Catalog

## Status
Accepted

## Context
ShopSphere needs a product catalog. Product reference data is provided by the
external FakeStore API (https://fakestoreapi.com). We must not depend on that
service at request time (availability, latency, untrusted input).

## Decision
- Backend fetches FakeStore products on startup and on a manual sync endpoint,
  validates and normalizes them, and upserts into MongoDB `products`.
- All read traffic is served from MongoDB, not proxied to FakeStore.
- Frontend is React + TypeScript + Vite, consuming backend REST endpoints.
- External FakeStore data is treated as untrusted: every field is validated
  before persistence.

## Endpoints
- `GET /api/products` — list with `category`, `search`, `page`, `limit`.
- `GET /api/products/:id` — single product.
- `GET /api/categories` — distinct categories.
- `POST /api/products/sync` — trigger re-sync from FakeStore (protected).

## Consequences
- Catalog stays available even if FakeStore is down.
- Single source of truth for product data is MongoDB.
- Sync endpoint must be access-controlled.
