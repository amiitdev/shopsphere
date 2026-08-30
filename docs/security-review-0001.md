# Security Review — Product Catalog (0001)

## Reviewed by
`security-engineer`

## Controls in place
- **Input validation:** all FakeStore payloads validated with Zod before
  persistence (external data treated as untrusted). Query params validated too.
- **Transport/headers:** `helmet` enabled; HSTS + `no-referrer` in production.
- **CORS:** restricted to configured `CORS_ORIGIN` (default `*`, set in prod).
- **Rate limiting:** global `express-rate-limit` (100 req/15min prod).
- **Authz on mutation:** `POST /api/products/sync` requires `x-sync-key`
  header (header-only, so it is not leaked via URLs/logs).
- **Payload size:** JSON body capped at 1mb.
- **Secrets:** MongoDB URI and sync key come from env; `.env` git-ignored.
- **Error handling:** generic 500 responses, no stack traces leaked.

## Residual concerns / required actions
1. **Default sync key** is `change-me` — must be overridden via `SYNC_API_KEY`
   in all non-dev environments (treat as a secret).
2. **CORS default `*`** — set `CORS_ORIGIN` to the frontend origin in prod.
3. **No TLS termination enforced here** — front proxy / ingress must enforce HTTPS.
4. **Catalog is public (no auth)** — acceptable for a storefront read API, but
   confirm no sensitive data is ever added to product documents.
5. **Sync endpoint** re-fetches an external source; keep the Zod validation —
   never persist unvalidated fields.
6. **Dependency hygiene:** run `npm audit` in CI; pin/refresh periodically.

## Verdict
No blocking issues for an MVP. Items 1–2 are mandatory before production.
