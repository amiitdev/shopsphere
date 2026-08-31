---
name: deployment
description: Guide for deploying ShopSphere to Vercel
---

# Deploying ShopSphere to Vercel

## Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- Logged in: `vercel login`
- Linked to project

## Project Structure

| Project | Vercel Name | URL |
|---------|-------------|-----|
| Frontend | shopsphere | https://shopsphere-phi-nine.vercel.app |
| Backend | shopsphere-api | https://shopsphere-api-two.vercel.app |

## Deployment Steps

### Backend

```bash
# 1. Swap project config
cp backend/.vercel/project.json .vercel/project.json

# 2. Remove frontend vercel.json (conflicts)
rm -f vercel.json

# 3. Deploy
vercel --prod --yes

# 4. Restore frontend config
cp frontend/.vercel/project.json .vercel/project.json
```

### Frontend

```bash
# 1. Ensure vercel.json exists
echo '{"outputDirectory": "frontend/dist", "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}' > vercel.json

# 2. Deploy
vercel --prod --yes
```

## Environment Variables

Set in Vercel dashboard or via CLI:

### Backend (shopsphere-api)
```bash
vercel env add MONGODB_URI production
vercel env add AUTH_SECRET production
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_MODEL production
vercel env add CORS_ORIGIN production
```

### Frontend (shopsphere)
```bash
vercel env add VITE_API_URL production
```

## Troubleshooting

### 404 on page refresh
- Ensure `vercel.json` has SPA rewrite: `{"source": "/(.*)", "destination": "/index.html"}`

### CORS errors
- Check `CORS_ORIGIN` matches frontend URL
- Ensure `credentials: true` in CORS config

### Build failures
- Check `npm run build` works locally
- Verify TypeScript compiles: `npm run typecheck`

### Database connection
- Verify `MONGODB_URI` is set correctly
- Check IP whitelist in MongoDB Atlas
