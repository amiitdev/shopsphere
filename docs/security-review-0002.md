# Security Review — Auth, Cart, Orders, Payment (0002)

## Reviewed by
`security-engineer`

## Controls in place
- **Auth:** passwords hashed with bcrypt (cost 12). Sessions are stateless JWTs in
  an **httpOnly, SameSite=Lax, Secure(in prod)** cookie (`ss_token`) — not exposed
  to client JS, mitigating XSS token theft.
- **CSRF:** httpOnly cookie + SameSite=Lax reduces CSRF risk for state-changing
  requests from cross-site contexts.
- **Validation:** all request bodies validated with Zod (`validateBody`); card
  shape validated before payment.
- **Server-side totals:** order subtotal/tax/shipping/total are computed on the
  server, never trusted from the client.
- **Payment:** simulated provider only; no real card data or keys stored. Only
  `last4`, status, and a fake transaction id are persisted.
- **Secret handling:** `AUTH_SECRET`, `MONGODB_URI` from env; `.env` git-ignored.
- **Input integrity:** cart item prices snapshotted from the product catalog at
  add time (server-side), not from the client.
- **Static assets:** product images served with `immutable` + `maxAge`, proper
  content-type.

## Residual concerns / required for production
1. **`AUTH_SECRET` default `dev-secret-change-me`** — MUST be overridden in prod
   (this is essential; a leaked/known secret invalidates all sessions).
2. **Payment is simulated** — replace `PaymentService` with a real provider
   (Stripe) and never handle raw card numbers in-app; use their tokenized flow.
   Card number is currently transmitted in the request body — acceptable for a
   dev/simulated flow but must be replaced with a Stripe PaymentElement/token.
3. **Rate limiting** covers all routes globally; ensure login/signup have tighter
   limits to blunt credential-stuffing (currently global limit).
4. **TLS** must be terminated at ingress; Secure cookie flag then applies.
5. **Order `userId`** is optional (guest checkout); if orders must be tied to an
   account later, gate `GET /api/orders/me` (already requireAuth).
6. **Object Id / inventory:** no stock/inventory model yet — quantities are not
   decremented from inventory. Add stock management + optimistic concurrency
   before real fulfillment.
7. **Dependency audit:** run `npm audit` in CI.

## Verdict
No blocking issues for a dev/MVP build. Items 1–2 are mandatory before any
production deployment with real payment/sessions.
