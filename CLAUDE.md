# CLAUDE.md — ShopSphere

ShopSphere is a production-quality e-commerce platform built by a multi-agent engineering team.

## Tech Stack (fixed decisions)

- **Database:** MongoDB (document store) — our own catalog, users, carts, orders.
- **Product catalog:** Our own 20 products with **AI-generated images** (Google Flow /
  `gflow`, stored in `backend/src/seed-images/` and served from `/images`). NOT FakeStore.
- **Backend:** Express + TypeScript; integrates MongoDB; serves static product images.
- **Frontend:** React + TypeScript + Vite; dark-by-default UI with light theme toggle.
- **Auth:** Email + password (bcrypt), stateless JWT in an **httpOnly cookie** session.
- **Buy flow:** Cart → Checkout (simulated payment) → Order.

## Repository Layout

```
shopsphere/
├── .claude/
│   ├── agents/      # architect, backend-engineer, frontend-engineer,
│   │                # database-engineer, security-engineer, test-engineer,
│   │                # devops-engineer, documentation-engineer, reviewer
│   ├── commands/
│   ├── hooks/
│   └── skills/
├── frontend/        # Web UI (React + Vite, dark theme, auth, cart, checkout, orders)
├── backend/         # Express API, MongoDB models, seed script, AI product images
├── docs/            # ADRs, security reviews, test plan
└── CLAUDE.md
```

## Engineering Team

The following agents collaborate on every feature. Invoke them per the workflow below:

- `architect` — system design, tech choices, ADRs
- `backend-engineer` — APIs, business logic, MongoDB integration, static image serving
- `frontend-engineer` — UI, components, state, backend API consumption, theming
- `database-engineer` — MongoDB collections, indexes, seed data, data model
- `security-engineer` — auth/sessions, secrets, validation, threat review
- `test-engineer` — test strategy, unit/integration, coverage
- `devops-engineer` — CI/CD, infra, observability
- `documentation-engineer` — docs, ADRs, onboarding
- `reviewer` — final PR review and merge gating
- `frontend-engineer` — UI, components, state, backend API consumption
- `database-engineer` — MongoDB collections, indexes, migrations, data model
- `security-engineer` — auth, secrets, threat review, untrusted-input handling
- `test-engineer` — test strategy, unit/integration/E2E, coverage
- `devops-engineer` — CI/CD, infra, observability
- `documentation-engineer` — docs, ADRs, onboarding
- `reviewer` — final PR review and merge gating

## Mandatory Build Workflow (never skip design)

For **every** feature, follow this order:

1. **Architect** designs it — produces the design and ADR.
2. **Backend engineer** implements the backend (APIs, MongoDB, static image serving, auth).
3. **Frontend engineer** implements the UI.
4. **Test engineer** writes tests.
5. **Security engineer** reviews security.
6. **Reviewer** performs the final review and merge decision.

No coding starts before step 1 is complete and the design is approved.

## Required Reporting

Every feature delivery must explicitly show:

- **Architecture decisions** — choices made and rationale (ADR in `docs/`)
- **Folder changes** — directories added/modified
- **Files created** — with purpose
- **Tests added** — what is covered and how
- **Security concerns** — risks identified and how they are mitigated

## Standards

- Production-quality code only: typed, tested, documented.
- Validate all inputs (Zod); never trust client-supplied totals or prices — always
  recompute on the server from the catalog.
- Secrets (`AUTH_SECRET`, `MONGODB_URI`) via env only — never in the repo.
- Use `npm run seed` in `backend/` to (re)populate the 20-product catalog with
  AI-generated images; the server does NOT auto-seed.
- Session cookie is httpOnly + SameSite=Lax (Secure in prod); `AUTH_SECRET` MUST be
  overridden in production.
- Keep `frontend/`, `backend/`, and `docs/` coherent and convention-compliant.
- Update `docs/` and this file when conventions change.

## Build, Run & Test Commands

### Backend (in `backend/`)
- **Run development server:** `npm run dev`
- **Production build (typecheck):** `npm run build` or `npm run typecheck`
- **Populate database with catalog/admin data:** `npm run seed` (populates `shopsphere` database)
- **Run backend tests:** `npm run test` (uses isolated test database `shopsphere_test` to prevent data loss)

### Frontend (in `frontend/`)
- **Run development server:** `npm run dev`
- **Production build:** `npm run build`
- **Run typecheck:** `npm run typecheck`
- **Run frontend tests:** `npm run test`
