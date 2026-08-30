# ADR 0004: Own Catalog with AI-Generated Images

## Status
Accepted (supersedes the FakeStore-based approach in ADR-0001)

## Context
The initial catalog pulled reference products from the external FakeStore API. We
decided to build our own store with a fixed, curated catalog and our own images.

## Decision
- **Remove FakeStore integration** (service, sync endpoint, env vars).
- **Ship a fixed 20-product catalog** seeded to MongoDB via `npm run seed`
  (`backend/src/seed.ts`), spanning electronics, clothing, home, jewelry, accessories.
- **Images are AI-generated** with Google Flow (`gflow "prompt" -o output.png` /
  `google-flow gen "prompt" -o file.png -m nano-banana-2-square`) and stored at
  `backend/src/seed-images/*.png`. They are served statically from `/images` with
  immutable caching. Products reference them by relative path.
- The server **does not auto-seed** on start; run `npm run seed` to (re)populate.

## Consequences
- Full control over catalog content, prices, and imagery (no external dependency).
- Images are local, so the app is fully self-contained and works offline.
- Product image capacity is bounded by the Google Flow free tier (50 credits/mo);
  regenerate/refresh images via `gflow`.
