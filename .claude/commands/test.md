---
description: Run all tests (backend + frontend)
---

Run all tests for ShopSphere.

## Commands

### Backend tests
```bash
cd backend && npm run test
```

### Frontend tests
```bash
cd frontend && npm run test
```

### Type checking
```bash
cd backend && npm run typecheck
cd frontend && npm run typecheck
```

### All at once
```bash
cd backend && npm run test && npm run typecheck && cd ../frontend && npm run test && npm run typecheck
```
