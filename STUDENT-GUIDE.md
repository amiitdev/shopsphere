# ShopSphere — Student Build Guide

> **Goal**: Build a complete e-commerce app from scratch in ~2 hours using Claude Code.
> **Rule**: Copy each prompt exactly. Don't modify. Let Claude finish each step fully before moving on.

---

## Agent Quick Reference

| Step | Primary Agent | Supporting Agents | Reference File |
|------|---------------|-------------------|----------------|
| 1. Backend | `backend-engineer` | `architect`, `database-engineer` | `.claude/agents/backend-engineer.md` |
| 2. Frontend | `frontend-engineer` | `architect` | `.claude/agents/frontend-engineer.md` |
| 3. Images | `database-engineer` | `backend-engineer` | `.claude/agents/database-engineer.md` |
| 4. AI Features | `backend-engineer` | `frontend-engineer` | `.claude/skills/ai-features.md` |
| 5. Seed DB | `database-engineer` | — | `.claude/skills/add-product.md` |
| 6. Test | `test-engineer` | `reviewer` | `.claude/agents/test-engineer.md` |
| 7. Deploy | `devops-engineer` | `security-engineer` | `.claude/skills/deployment.md` |

---

## How Agents Work

When you paste a prompt, Claude reads the relevant `.claude/agents/*.md` file to understand:
- **Role**: What that agent specializes in
- **Standards**: Code quality, conventions, patterns
- **Coordination**: Which other agents to consult

**You don't need to invoke agents manually.** Claude automatically picks the right agent based on the task. But you CAN explicitly ask:

```
@backend-engineer create a new API endpoint for product reviews
@frontend-engineer add a search filter to the catalog page
@security-engineer review my auth implementation
```

---

## Step 0: Setup (2 minutes)

```bash
mkdir shopsphere && cd shopsphere
git init
```

Open Claude Code in this directory.

**Agent**: None (setup only)
**Reference**: Read `CLAUDE.md` to understand the full project

---

## Step 1: Backend (10 minutes)

**Agent**: `backend-engineer` (primary), `architect` (design), `database-engineer` (schema)

Copy this prompt into Claude:

```
Read .claude/agents/backend-engineer.md and follow its standards.

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

**What Claude creates:**
```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/       # auth.ts, errorHandler.ts
│   ├── models/          # Product, User, Cart, Order, Review
│   ├── routes/          # All API routes
│   ├── services/        # Business logic
│   ├── app.ts           # Express setup
│   ├── config.ts        # Environment config
│   ├── seed.ts          # Database seeder
│   └── index.ts         # Server entry
├── package.json
├── tsconfig.json
└── .env
```

---

## Step 2: Frontend (15 minutes)

**Agent**: `frontend-engineer` (primary), `architect` (routing)

Copy this prompt into Claude:

```
Read .claude/agents/frontend-engineer.md and follow its standards.

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

**What Claude creates:**
```
frontend/
├── src/
│   ├── components/      # ProductCard, CartDrawer, Navbar, etc.
│   ├── pages/           # CatalogPage, ProductDetailPage, ChatPage, etc.
│   ├── pages/admin/     # AdminDashboard, AdminProducts, AdminOrders
│   ├── context/         # CartContext, AuthContext, ThemeContext
│   ├── api.ts           # All API functions
│   ├── types.ts         # TypeScript interfaces
│   ├── App.tsx          # Route definitions
│   ├── main.tsx         # Entry point
│   └── index.css        # All styles (CSS custom properties)
├── public/
│   └── images/          # Product images (added later)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Step 3: Product Images (10 minutes)

**Agent**: `database-engineer` (seed data), `backend-engineer` (image serving)

Copy this prompt:

```
Read .claude/skills/add-product.md for the workflow.

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

**Key files modified:**
- `backend/src/seed.ts` — 20 product entries added
- `backend/src/seed-images/*.png` — 20 images generated
- `frontend/public/images/*.png` — 20 images copied

---

## Step 4: AI Features (10 minutes)

**Agent**: `backend-engineer` (AI service), `frontend-engineer` (chat UI)

Copy this prompt:

```
Read .claude/skills/ai-features.md for the implementation guide.

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

**Key files created/modified:**
- `backend/src/services/aiService.ts` — AI logic with fallbacks
- `backend/src/routes/ai.ts` — Route definitions
- `frontend/src/pages/ChatPage.tsx` — Chat UI

---

## Step 5: Seed Database (2 minutes)

**Agent**: `database-engineer`

```bash
cd backend
npm run seed
```

This creates 20 products in MongoDB.

**What happens:**
1. Connects to MongoDB (local or Atlas)
2. Upserts 20 products with images
3. Creates admin user (admin@shopsphere.com / admin123)

---

## Step 6: Test Locally (2 minutes)

**Agent**: `test-engineer`

Open two terminals:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open http://localhost:5173 — the app should work.

**Test these flows:**
1. Browse catalog, search, filter by category
2. Click product → see detail page
3. Add to cart → checkout
4. Login/signup → see orders
5. Try AI chat
6. Login as admin → see admin panel

---

## Step 7: Deploy to Vercel (5 minutes)

**Agent**: `devops-engineer` (deployment), `security-engineer` (env vars)

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

**Set environment variables in Vercel dashboard:**

Backend (shopsphere-api):
- MONGODB_URI — your MongoDB Atlas connection string
- AUTH_SECRET — random 32+ character string
- GEMINI_API_KEY — your Google AI API key
- GEMINI_MODEL — gemini-2.5-flash
- CORS_ORIGIN — your frontend Vercel URL

Frontend (shopsphere):
- VITE_API_URL — your backend Vercel URL + /api

---

## Step 8: Add More Products (optional)

**Agent**: `database-engineer` (seed), `backend-engineer` (images)

Copy this prompt:

```
Read .claude/skills/add-product.md.

Add 20 more products to the catalog (sourceId 21-40) with:
- 5 electronics, 5 jewelry, 5 home, 5 clothing
- Generate images with google-flow
- Update seed.ts
- Run npm run seed
- Deploy to production
```

---

## Agent Collaboration Map

```
                    ┌─────────────┐
                    │  architect   │
                    │ (design)     │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │  backend-   │ │database- │ │ frontend-   │
     │  engineer   │ │ engineer │ │ engineer    │
     │ (API, AI)   │ │(schema)  │ │ (UI, state) │
     └──────┬──────┘ └────┬─────┘ └──────┬──────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │  security-  │ │  test-   │ │  devops-    │
     │  engineer   │ │ engineer │ │  engineer   │
     │ (auth, OWASP)│ │ (tests) │ │ (deploy)    │
     └─────────────┘ └──────────┘ └─────────────┘
```

---

## Agent Files Reference

| File | Purpose | When to Read |
|------|---------|--------------|
| `.claude/agents/architect.md` | System design, tech choices | Before starting, major features |
| `.claude/agents/backend-engineer.md` | API standards, patterns | Any backend work |
| `.claude/agents/frontend-engineer.md` | UI patterns, routing | Any frontend work |
| `.claude/agents/database-engineer.md` | Schema, seed data | Database changes |
| `.claude/agents/security-engineer.md` | Auth, secrets, OWASP | Security concerns |
| `.claude/agents/test-engineer.md` | Test strategy, coverage | Writing tests |
| `.claude/agents/devops-engineer.md` | Deploy, infra, CI/CD | Deployment |
| `.claude/agents/documentation-engineer.md` | Docs, ADRs | Documentation |
| `.claude/agents/reviewer.md` | PR review, merge gating | Before merging |
| `.claude/skills/add-product.md` | Adding new products | Product catalog changes |
| `.claude/skills/ai-features.md` | AI implementation | AI feature work |
| `.claude/skills/deployment.md` | Vercel deploy guide | Deployment |

---

## Troubleshooting

| Problem | Agent to Ask | Solution |
|---------|--------------|----------|
| CORS error | `security-engineer` | Check CORS_ORIGIN env var |
| 404 on refresh | `devops-engineer` | Ensure SPA rewrite in vercel.json |
| Gemini 429 error | `backend-engineer` | Wait 1 minute, or check fallback |
| Images not showing | `database-engineer` | Check /images/ path |
| Build fails | `test-engineer` | Run npm run typecheck |
| Auth not working | `security-engineer` | Check httpOnly cookie config |
| Slow queries | `database-engineer` | Add indexes |

---

## Credentials

- **Admin**: Register via signup page, then update role in MongoDB directly

## Production URLs

- **Frontend**: https://shopsphere-phi-nine.vercel.app
- **Backend**: https://shopsphere-api-two.vercel.app
