---
description: Deploy both frontend and backend to Vercel production
---

Deploy ShopSphere to production on Vercel.

## Steps

1. **Deploy backend** (swap project config):
```bash
cd $ARGUMENTS
cp backend/.vercel/project.json .vercel/project.json
rm -f vercel.json
vercel --prod --yes
```

2. **Restore frontend config and deploy**:
```bash
cp frontend/.vercel/project.json .vercel/project.json
echo '{"outputDirectory": "frontend/dist", "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}' > vercel.json
vercel --prod --yes
```

3. **Verify deployment**:
- Backend: https://shopsphere-api-two.vercel.app/health
- Frontend: https://shopsphere-phi-nine.vercel.app
