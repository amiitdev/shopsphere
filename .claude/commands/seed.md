---
description: Seed the database with products
---

Seed the ShopSphere database with products.

## Usage

Local development:
```bash
cd backend && npm run seed
```

Production (requires Vercel deployment with seed endpoint):
```bash
curl -X POST https://shopsphere-api-two.vercel.app/api/_seed -H "x-seed-secret: temp-seed-2026"
```

## What it does

1. Connects to MongoDB (local or Atlas)
2. Upserts 40 products with AI-generated images
3. Creates admin user if not exists (admin@shopsphere.com / admin123)
4. Products span 5 categories: electronics, jewelry, home, clothing, accessories
