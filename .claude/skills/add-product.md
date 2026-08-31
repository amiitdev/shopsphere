---
name: add-product
description: Add a new product to ShopSphere catalog
---

# Adding a New Product

Follow these steps to add a new product to the ShopSphere catalog.

## Step 1: Generate Product Image

```bash
google-flow gen "Studio product photo of [PRODUCT DESCRIPTION], centered, soft diffused studio lighting, clean light neutral background, premium e-commerce product shot" -o backend/src/seed-images/NN-name.png -m nano-banana-2-square

cp backend/src/seed-images/NN-name.png frontend/public/images/
```

## Step 2: Add to Seed Data

Edit `backend/src/seed.ts` and add a new entry to the `products` array:

```typescript
{
  sourceId: 41,  // Next available ID
  title: "Product Name",
  price: 99.99,
  description: "Product description here.",
  category: "electronics",  // electronics, jewelry, home, clothing, accessories
  image: imageUrl("41-name.png"),
  rating: { rate: 4.5, count: 100 },
},
```

## Step 3: Seed Database

### Local
```bash
cd backend && npm run seed
```

### Production
Use the seed endpoint or update via admin panel.

## Step 4: Verify

1. Check local: http://localhost:5173
2. Check production: https://shopsphere-phi-nine.vercel.app

## Image Naming Convention

Format: `NN-product-name.png`
- NN = sourceId (01-99)
- product-name = kebab-case description

Examples:
- `21-earbuds.png`
- `22-speaker.png`
- `41-smartwatch.png`
