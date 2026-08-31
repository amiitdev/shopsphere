---
description: Generate product images using Google Flow
---

Generate AI product images using Google Flow.

## Prerequisites

- Google Flow installed: `pip install google-flow`
- Valid token in `~/.google-flow/token.json`
- Check credits: `google-flow credits`

## Usage

### Generate a single image
```bash
google-flow gen "Studio product photo of [product description], centered, soft diffused studio lighting, clean light neutral background, premium e-commerce product shot" -o backend/src/seed-images/NN-name.png -m nano-banana-2-square
```

### Copy to frontend
```bash
cp backend/src/seed-images/*.png frontend/public/images/
```

## Prompt Template

```
Studio product photo of [PRODUCT], centered, soft diffused studio lighting, clean light neutral background, premium e-commerce product shot
```

## Tips

- Use `nano-banana-2-square` model for consistent 1024x1024 images
- Free tier: 50 credits/month
- If rate limited (429), wait and retry
- Images saved to `backend/src/seed-images/` and copied to `frontend/public/images/`
