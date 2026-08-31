# CLAUDE.md — ShopSphere

> **Teaching Guide**: This file is designed so anyone can learn to build a production
> e-commerce app using Claude Code. Follow the agents, prompts, and workflow below.

## What Is ShopSphere?

A full-stack e-commerce platform with AI-powered shopping assistant, built entirely
using Claude Code with a multi-agent engineering team approach.

**Live URLs:**
- Frontend: https://shopsphere-phi-nine.vercel.app
- Backend API: https://shopsphere-api-two.vercel.app

## Tech Stack (Fixed Decisions)

| Layer | Technology | Why |
|-------|-----------|-----|
| Database | MongoDB (Atlas) | Document store fits product catalog, flexible schema |
| Backend | Express + TypeScript | Fast to build, great ecosystem |
| Frontend | React + Vite + TypeScript | Modern, fast dev experience |
| Auth | JWT + httpOnly cookies + bcrypt | XSS-proof session management |
| AI | Google Gemini 2.5 Flash | Product search, chat, recommendations |
| Images | Google Flow (nano-banana-2) | AI-generated product photos |
| Hosting | Vercel (frontend + backend) | Free tier, instant deploys |

## Repository Layout

```
shopsphere/
├── CLAUDE.md                    # This file — master guide
├── README.md                    # Public-facing docs with screenshots
├── .claude/
│   ├── agents/                  # 9 specialist agents
│   │   ├── architect.md         # System design, ADRs
│   │   ├── backend-engineer.md  # APIs, MongoDB, auth
│   │   ├── frontend-engineer.md # UI, components, state
│   │   ├── database-engineer.md # Schema, indexes, seed
│   │   ├── security-engineer.md # Auth, secrets, OWASP
│   │   ├── test-engineer.md     # Test strategy, coverage
│   │   ├── devops-engineer.md   # CI/CD, deploy, infra
│   │   ├── documentation-engineer.md # Docs, ADRs
│   │   └── reviewer.md          # PR review, merge gating
│   ├── commands/                # Reusable slash commands
│   └── skills/                  # Project-specific skills
├── frontend/                    # React + Vite web app
│   ├── src/
│   │   ├── components/          # Reusable UI (ProductCard, CartDrawer, etc.)
│   │   ├── pages/               # Route pages (Catalog, ProductDetail, Chat, etc.)
│   │   ├── pages/admin/         # Admin panel pages
│   │   ├── context/             # React context (Cart, Auth, Theme)
│   │   ├── api.ts               # All API calls
│   │   ├── types.ts             # TypeScript interfaces
│   │   └── index.css            # All styles (CSS custom properties)
│   └── public/images/           # Product images (40 files)
├── backend/                     # Express API server
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── middleware/           # Auth, upload, error handling
│   │   ├── models/              # Mongoose schemas (Product, User, Order, Review, Cart)
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic (aiService, productService, etc.)
│   │   ├── seed.ts              # Database seeder (40 products)
│   │   ├── app.ts               # Express app setup
│   │   └── config.ts            # Environment configuration
│   └── src/seed-images/         # AI-generated product images (40 files)
└── docs/                        # ADRs, screenshots, security reviews
    └── screenshots/             # Website screenshots for README
```

## The 9-Agent Team

This project uses Claude Code's multi-agent approach. Each agent is a specialist:

| Agent | Role | When to Invoke |
|-------|------|----------------|
| `architect` | System design, tech choices, ADRs | Before any new feature |
| `backend-engineer` | APIs, business logic, MongoDB | Backend work |
| `frontend-engineer` | UI, components, state, routing | Frontend work |
| `database-engineer` | Schema, indexes, seed data | Database changes |
| `security-engineer` | Auth, secrets, OWASP review | Security concerns |
| `test-engineer` | Test strategy, unit/integration | Writing tests |
| `devops-engineer` | CI/CD, deploy, infrastructure | Deployment/infra |
| `documentation-engineer` | Docs, ADRs, onboarding | Documentation |
| `reviewer` | PR review, merge gating | Before merging |

## How to Build This Project (Step-by-Step)

### Phase 1: Foundation (Day 1)

**Step 1: Initialize the project**
```bash
mkdir shopsphere && cd shopsphere
git init
```

**Step 2: Ask Claude to set up the backend**
```
Prompt: "Create a production Express + TypeScript backend with:
- MongoDB connection using Mongoose
- Product, User, Order, Review, Cart models
- JWT auth with httpOnly cookies
- REST API routes for products, auth, cart, orders, reviews
- Input validation with Zod
- Error handling middleware
- Environment configuration with dotenv"
```

**Step 3: Ask Claude to set up the frontend**
```
Prompt: "Create a React + Vite + TypeScript frontend with:
- React Router for routing
- Dark theme by default with light toggle
- Product catalog page with search and category filter
- Product detail page
- Shopping cart with drawer
- Auth pages (login, signup)
- Admin panel
- Responsive design"
```

### Phase 2: Product Catalog (Day 2)

**Step 4: Generate AI product images**
```bash
# Check credits first
google-flow credits

# Generate images (20 products, ~20 credits)
google-flow gen "Studio product photo of [product], centered, soft diffused studio lighting, clean light neutral background, premium e-commerce product shot" -o backend/src/seed-images/01-product.png -m nano-banana-2-square

# Copy to frontend
cp backend/src/seed-images/*.png frontend/public/images/
```

**Step 5: Seed the database**
```bash
cd backend
npm run seed
# This creates 40 products in MongoDB
```

### Phase 3: AI Features (Day 3)

**Step 6: Add AI chat and search**
```
Prompt: "Add AI-powered features:
- POST /api/ai/chat - Natural language product search
- POST /api/ai/search - Semantic product search
- POST /api/ai/sentiment - Review sentiment analysis
- GET /api/ai/recommendations/:id - Product recommendations
Use Google Gemini 2.5 Flash API. Add fallback to keyword search when API is rate-limited."
```

### Phase 4: Polish & Deploy (Day 4)

**Step 7: Add pagination, favicon, meta tags**
```
Prompt: "Add pagination to the catalog (12 per page). Add favicon and SEO meta tags."
```

**Step 8: Deploy to Vercel**
```bash
# Backend
cd backend && vercel --prod

# Frontend
cd frontend && vercel --prod
```

## Build, Run & Test Commands

### Backend (in `backend/`)
| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server on port 4000 |
| `npm run build` | Production build with typecheck |
| `npm run typecheck` | Type checking only |
| `npm run seed` | Seed database with 40 products |
| `npm run test` | Run tests (isolated test DB) |

### Frontend (in `frontend/`)
| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server on port 5173 |
| `npm run build` | Production build |
| `npm run typecheck` | Type checking only |
| `npm run test` | Run tests |

## Environment Variables

### Backend (`.env`)
```env
MONGODB_URI=mongodb://127.0.0.1:27017/shopsphere
AUTH_SECRET=your-jwt-secret-min-32-chars
GEMINI_API_KEY=your-google-ai-api-key
GEMINI_MODEL=gemini-2.5-flash
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:4000/api
```

## API Endpoints Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List (supports `?search=`, `?category=`, `?page=`, `?limit=`) |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/products/categories` | List all categories |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart` | Create cart |
| GET | `/api/cart/:id` | Get cart |
| POST | `/api/cart/:id/items` | Add item |
| PATCH | `/api/cart/:id/items/:productId` | Update quantity |
| DELETE | `/api/cart/:id/items/:productId` | Remove item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (checkout) |
| GET | `/api/orders/me` | List my orders |
| GET | `/api/orders/:id` | Get order |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/:id/reviews` | Get product reviews |
| POST | `/api/products/:id/reviews` | Submit review |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI assistant |
| POST | `/api/ai/search` | Semantic search |
| POST | `/api/ai/sentiment` | Sentiment analysis |
| GET | `/api/ai/recommendations/:id` | Get recommendations |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/orders` | List all orders |
| PATCH | `/api/admin/orders/:id/status` | Update order status |

## Standards & Conventions

- **Code**: TypeScript strict mode, functional components, async/await
- **Styling**: CSS custom properties, dark theme default, responsive (mobile-first)
- **State**: React Context for global state, local state for components
- **API**: RESTful, JSON responses, proper HTTP status codes
- **Auth**: httpOnly cookies (never localStorage), bcrypt for passwords
- **Security**: Never trust client data, recompute totals server-side
- **Images**: AI-generated via Google Flow, served from `/images`
- **Deploy**: Vercel for both frontend and backend

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@shopsphere.com` | `admin123` |

## Production Deployment

The app is deployed on Vercel with two projects:
- `shopsphere` (frontend) → https://shopsphere-phi-nine.vercel.app
- `shopsphere-api` (backend) → https://shopsphere-api-two.vercel.app

Backend requires swapping `.vercel/project.json` to point to the API project before deploy.
