---
name: ai-features
description: Guide for implementing AI features in ShopSphere
---

# AI Features in ShopSphere

ShopSphere uses Google Gemini 2.5 Flash for AI-powered features.

## Features

| Feature | Endpoint | Description |
|---------|----------|-------------|
| Chat | `POST /api/ai/chat` | Natural language product search |
| Search | `POST /api/ai/search` | Semantic product search |
| Sentiment | `POST /api/ai/sentiment` | Review sentiment analysis |
| Recommendations | `GET /api/ai/recommendations/:id` | Product recommendations |

## Implementation

### Backend Service

All AI logic is in `backend/src/services/aiService.ts`:

```typescript
// Chat with AI
export async function chat(message: string, history: Message[]) {
  // 1. Try Gemini API
  // 2. Fallback to keyword search if rate-limited
}

// Semantic search
export async function semanticSearch(query: string) {
  // 1. Try Gemini for understanding
  // 2. Fallback to regex matching
}

// Product recommendations
export async function getRecommendations(productId: string) {
  // 1. Try Gemini for similarity
  // 2. Fallback to random products
}
```

### Frontend Integration

Chat page: `frontend/src/pages/ChatPage.tsx`
- Full-screen chat interface
- Product cards with links to detail pages
- Chat history maintained during session

### Rate Limiting

Gemini free tier: 20 requests/minute

When rate-limited (429), the service falls back to:
- Keyword matching for chat
- Regex search for semantic search
- Random selection for recommendations

## Configuration

Environment variables:
```env
GEMINI_API_KEY=your-api-key
GEMINI_MODEL=gemini-2.5-flash
```

## Adding New AI Features

1. Add service function in `backend/src/services/aiService.ts`
2. Add controller in `backend/src/controllers/aiController.ts`
3. Add route in `backend/src/routes/ai.ts`
4. Add frontend integration in `frontend/src/api.ts` and relevant page
