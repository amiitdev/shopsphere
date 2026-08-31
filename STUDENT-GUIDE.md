# ShopSphere — Student Build Guide

> **Goal**: Build a complete e-commerce app from scratch in ~2 hours using Claude Code.
> **Rule**: Copy each prompt exactly. Don't modify. Let Claude finish each step fully before moving on.

---

## Step 0: Setup (2 minutes)

```bash
mkdir shopsphere && cd shopsphere
git init
```

Open Claude Code in this directory.

---

## Step 1: Backend (10 minutes)

Copy this prompt into Claude:

```
Create a production Express + TypeScript backend in backend/ with:

1. MongoDB connection using Mongoose
2. Models: Product (sourceId, title, price, description, category, image, rating), User (name, email, passwordHash, role), Cart (userId, items), Order (userId, items, total, status, customer), Review (productId, userId, rating, title, comment)
3. JWT auth with httpOnly cookies (bcrypt for passwords)
4. Routes: /api/products (GET list with ?search, ?category, ?page, ?limit, GET /:id, GET /categories), /api/auth (POST signup, login, logout, GET me), /api/cart (POST create, GET /:id, POST /:id/items, PATCH /:id/items/:productId, DELETE /:id/items/:productId), /api/orders (POST create, GET /me, GET /:id), /api/products/:id/reviews (GET, POST)
5. Admin routes: /api/admin/products (POST, PUT /:id, DELETE /:id), /api/admin/orders (GET, PATCH /:id/status)
6. AI routes: /api/ai/chat (POST), /api/ai/search (POST), /api/ai/sentiment (POST), /api/ai/recommendations/:id (GET)
7. Input validation with Zod
8. Error handling middleware
9. Config from env: MONGODB_URI, AUTH_SECRET, GEMINI_API_KEY, GEMINI_MODEL, PORT, CORS_ORIGIN
10. Seed script: npm run seed that creates 20 products with images served from /images/

Use TypeScript strict mode. Add package.json scripts: dev, build, typecheck, seed, test.
```

**Wait for Claude to finish. Then run:**
```bash
cd backend && npm install && npm run typecheck
```

---

## Step 2: Frontend (15 minutes)

Copy this prompt into Claude:

```
Create a React + Vite + TypeScript frontend in frontend/ with:

1. React Router with routes: / (catalog), /product/:id, /chat, /checkout, /orders, /admin, /admin/products, /admin/orders
2. Dark theme by default with light toggle (CSS custom properties)
3. CatalogPage: product grid, search input, category filter dropdown, pagination (12 per page)
4. ProductDetailPage: product info, reviews, add to cart, "You Might Also Like" recommendations
5. ChatPage: full-screen AI chat with clickable product cards
6. CartDrawer: slide-out cart overlay
7. CheckoutPage: form with name, email, address, card fields
8. OrdersPage: order history list
9. Admin pages: dashboard, product management (CRUD table), order management
10. Auth: login/signup pages, context for user state
11. Navbar with logo, nav links, cart icon, theme toggle
12. API client (api.ts) with all fetch functions matching backend routes
13. Types (types.ts) for Product, User, Cart, Order, Review
14. Responsive design (mobile-first)
15. ProductCard component with image, title, price, rating

Use fetch for API calls. Include credentials: true. VITE_API_URL env var for API base.
```

**Wait for Claude to finish. Then run:**
```bash
cd frontend && npm install && npm run typecheck
```

---

## Step 3: Product Images (10 minutes)

Copy this prompt:

```
Generate 20 product images using google-flow and add them to the seed data.

Categories and products:
1. Wireless Headphones (electronics)
2. Rose Gold Watch (jewelry)
3. Ceramic Coffee Set (home)
4. Merino Wool Sweater (clothing)
5. Gold Pendant Necklace (jewelry)
6. Cotton Throw Blanket (home)
7. USB Flash Drive (electronics)
8. Glass Vase (home)
9. Silk Sleep Mask (accessories)
10. Smart Home Hub (electronics)
11. Leather Messenger Bag (accessories)
12. Bamboo Charger (electronics)
13. Cashmere Beanie (clothing)
14. Olive Wood Cutting Board (home)
15. Silver Cuff Bracelet (jewelry)
16. Gooseneck Kettle (home)
17. Denim Jacket (clothing)
18. Soy Candle Set (home)
19. Marble Desk Organizer (home)
20. Down Vest (clothing)

For each: generate image with google-flow gen "Studio product photo of [product], centered, soft diffused studio lighting, clean light neutral background, premium e-commerce product shot" -o backend/src/seed-images/NN-name.png -m nano-banana-2-square

Then copy to frontend/public/images/ and update seed.ts with all 20 products.
```

**Wait for Claude to finish.**

---

## Step 4: AI Features (10 minutes)

Copy this prompt:

```
Implement the AI features in backend:

1. aiService.ts: 
   - chat(message, history) using Google Gemini API
   - semanticSearch(query) using Gemini
   - analyzeSentiment(text) using Gemini
   - getRecommendations(productId) using Gemini
   - Add fallback to keyword search when Gemini returns 429

2. Wire up routes in routes/ai.ts:
   - POST /api/ai/chat → chat service
   - POST /api/ai/search → semanticSearch service
   - POST /api/ai/sentiment → analyzeSentiment service
   - GET /api/ai/recommendations/:id → getRecommendations service

3. Frontend: update ChatPage.tsx to call POST /api/ai/chat and display responses with clickable product cards
```

**Wait for Claude to finish.**

---

## Step 5: Seed Database (2 minutes)

```bash
cd backend
npm run seed
```

This creates 20 products in MongoDB.

---

## Step 6: Run Locally (2 minutes)

Open two terminals:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open http://localhost:5173 — the app should work.

---

## Step 7: Deploy to Vercel (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link projects (first time only)
cd backend && vercel link --project shopsphere-api
cd ../frontend && vercel link --project shopsphere

# Deploy backend
cd backend
cp .vercel/project.json ../.vercel/project.json
rm -f ../vercel.json
vercel --prod --yes

# Deploy frontend
cd ../frontend
cp .vercel/project.json ../.vercel/project.json
echo '{"outputDirectory": "dist", "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}' > ../vercel.json
vercel --prod --yes
```

---

## Step 8: Add More Products (optional)

Copy this prompt:

```
Add 20 more products to the catalog (sourceId 21-40) with:
- 5 electronics, 5 jewelry, 5 home, 5 clothing
- Generate images with google-flow
- Update seed.ts
- Run npm run seed
- Deploy to production
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Check CORS_ORIGIN env var matches frontend URL |
| 404 on refresh | Ensure vercel.json has SPA rewrite |
| Gemini 429 error | Wait 1 minute, or use keyword fallback |
| Images not showing | Check /images/ path in both frontend/public and backend/seed-images |
| Build fails | Run npm run typecheck to find errors |

---

## Default Credentials

- **Admin**: admin@shopsphere.com / admin123

## Production URLs

- **Frontend**: https://shopsphere-phi-nine.vercel.app
- **Backend**: https://shopsphere-api-two.vercel.app
