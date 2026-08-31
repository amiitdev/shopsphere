import { config } from "../config";
import { ProductModel } from "../models/Product";
import { ReviewModel } from "../models/Review";
import type { ProductDocument } from "../models/Product";
import mongoose from "mongoose";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function llmChat(messages: ChatMessage[]): Promise<string> {
  if (!config.geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }

  // Convert to Gemini format
  const systemInstruction = messages.find((m) => m.role === "system")?.content ?? "";
  const conversationMessages = messages.filter((m) => m.role !== "system");

  const contents = conversationMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000 * attempt));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          topP: 0.9,
        },
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return cleanReply(text);
    }

    const errBody = await res.text();
    lastError = new Error(`Gemini API error ${res.status}: ${errBody}`);

    if (res.status !== 429 && res.status < 500) throw lastError;
  }
  throw lastError ?? new Error("Gemini API failed after retries");
}

function cleanReply(text: string): string {
  return text
    // strip closed <think>...</think> blocks
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    // strip unclosed <think> blocks (everything from <think> to end)
    .replace(/<think>[\s\S]*$/gi, "")
    // strip <thinking>...</think> variants
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<thinking>[\s\S]*$/gi, "")
    // strip markdown bold/italic
    .replace(/\*\*\*?/g, "")
    // strip markdown headers
    .replace(/^#{1,6}\s+/gm, "")
    // strip markdown horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    // strip markdown list bullets (keep the text)
    .replace(/^\s*[-*+]\s+/gm, "")
    // strip markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function productCatalogContext(products: ProductDocument[]): string {
  return products
    .map(
      (p) =>
        `- [${String(p._id)}] ${p.title} | $${p.price} | ${p.category} | rating: ${p.rating.rate}/5 (${p.rating.count} reviews) | ${p.description.slice(0, 100)}`
    )
    .join("\n");
}

function localKeywordSearch(query: string, products: ProductDocument[]): ProductDocument[] {
  const tokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (tokens.length === 0) return [];
  return products
    .map((p) => {
      const haystack = `${p.title} ${p.category} ${p.description}`.toLowerCase();
      let score = 0;
      let matched = 0;
      for (const t of tokens) {
        if (haystack.includes(t)) {
          score += t.length;
          matched += 1;
        }
      }
      return { p, score, matched };
    })
    .filter((r) => r.matched > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((r) => r.p);
}

function cleanJsonReply(text: string): string {
  return text
    .replace(/ thinking[\s\S]*?<\/think>/gi, "")
    .replace(/ thinking[\s\S]*$/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<thinking>[\s\S]*$/gi, "")
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

// ─── 1. AI Chatbot ───
interface ChatProduct {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  rating: { rate: number; count: number };
}

export async function chat(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<{ reply: string; products: ChatProduct[] }> {
  const products = await ProductModel.find().limit(50).lean() as ProductDocument[];
  const catalog = productCatalogContext(products);

  const systemPrompt = `You are ShopSphere's AI shopping assistant. You ONLY answer questions about the products listed below. Nothing else.

PRODUCT CATALOG:
${catalog}

STRICT RULES:
- ONLY talk about products in the catalog above. Never mention anything else.
- If the user asks about a specific product (e.g. "headphones"), ONLY mention that product, not the entire catalog.
- When listing multiple products, use this format for EACH product: [PID:PRODUCT_ID_HERE] Product Name - $price
- When showing a single product, also use: [PID:PRODUCT_ID_HERE] Product Name - $price
- Do NOT output your thinking process. Only output the final answer.
- If the user asks about something not in the catalog, say: "I don't have that in our catalog, but I can help you find something similar!"
- Be conversational and helpful, like a friendly store employee.
- Keep responses concise.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6),
    { role: "user", content: userMessage },
  ];

  let reply: string;
  try {
    reply = await llmChat(messages);
  } catch (err) {
    const fallback = localKeywordSearch(userMessage, products);
    if (fallback.length > 0) {
      const lines = fallback
        .map((p, i) => `[PID:${String(p._id)}] ${p.title} - $${p.price}`)
        .join("\n");
      reply = `I found these matching products in our catalog:\n${lines}`;
    } else {
      reply =
        "I couldn't find an exact match in our catalog, but I can help you look around! Check out the Browse Products page.";
    }
  }

  // Extract product IDs from [PID:xxx] tags
  const pidMatches = [...reply.matchAll(/\[PID:([a-f0-9]{24})\]/g)];
  const seenIds = new Set<string>();
  const matchedProducts: ChatProduct[] = [];

  for (const m of pidMatches) {
    const id = m[1];
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    const found = products.find((p) => String(p._id) === id);
    if (found) {
      matchedProducts.push({
        _id: String(found._id),
        title: found.title,
        price: found.price,
        image: found.image,
        category: found.category,
        rating: found.rating,
      });
    }
  }

  // Clean the [PID:xxx] tags from the reply text
  const cleanReply2 = reply.replace(/\[PID:[a-f0-9]{24}\]\s*/g, "").trim();

  return { reply: cleanReply2, products: matchedProducts };
}

// ─── 2. AI Semantic Search ───
export async function semanticSearch(
  query: string
): Promise<{ productId: string; score: number; reason: string }[]> {
  const products = await ProductModel.find().limit(50).lean();
  const catalog = productCatalogContext(products as ProductDocument[]);

  const prompt = `You are a product search engine. Given a user query and a product catalog, return a JSON array of matching products ranked by relevance.

User query: "${query}"

Product catalog:
${catalog}

Return ONLY a JSON array (no markdown, no explanation) of objects with this exact shape:
[{"productId": "id_here", "score": 0.95, "reason": "why this matches"}]

Rules:
- Score from 0.0 to 1.0 (1.0 = perfect match)
- Include at most 8 results
- Only include products with score >= 0.4
- Score based on: title match, category match, price range, description relevance
- Return ONLY the JSON array, nothing else.`;

  const reply = await llmChat([{ role: "user", content: prompt }]);

  try {
    const cleaned = cleanJsonReply(reply);
    return JSON.parse(cleaned);
  } catch {
    return [];
  }
}

// ─── 3. AI Review Sentiment ───
export async function analyzeSentiment(
  text: string
): Promise<{ sentiment: "positive" | "negative" | "neutral"; confidence: number; themes: string[] }> {
  if (!text || text.trim().length < 5) {
    return { sentiment: "neutral", confidence: 0.5, themes: [] };
  }

  const prompt = `Analyze the sentiment of this product review. Return ONLY a JSON object (no markdown).

Review: "${text}"

Return exactly this shape:
{"sentiment": "positive"|"negative"|"neutral", "confidence": 0.0-1.0, "themes": ["theme1", "theme2"]}

Rules:
- confidence: how confident you are (0.0 to 1.0)
- themes: 1-3 key themes (e.g. "quality", "shipping", "price", "durability", "comfort")
- Return ONLY the JSON object, nothing else.`;

  const reply = await llmChat([{ role: "user", content: prompt }]);

  try {
    const cleaned = cleanJsonReply(reply);
    return JSON.parse(cleaned);
  } catch {
    return { sentiment: "neutral", confidence: 0.5, themes: [] };
  }
}

// ─── 4. AI Recommendations (category + price similarity via LLM) ───
export async function getRecommendations(
  productId: string,
  limit = 4
): Promise<{ productId: string; reason: string }[]> {
  const product = await ProductModel.findById(productId).lean();
  if (!product) return [];

  const others = await ProductModel.find({
    _id: { $ne: new mongoose.Types.ObjectId(productId) },
  })
    .limit(30)
    .lean();

  const catalog = others
    .map(
      (p) =>
        `- [${String(p._id)}] ${p.title} | $${p.price} | ${p.category} | rating: ${p.rating.rate}/5`
    )
    .join("\n");

  const prompt = `Given this product:
${product.title} | $${product.price} | ${product.category} | rating: ${product.rating.rate}/5

And these other products:
${catalog}

Select the ${limit} most similar/relevant products. Return ONLY a JSON array (no markdown):
[{"productId": "id_here", "reason": "short reason"}]

Rules:
- Consider: category match, complementary products, price range, rating quality
- Return ONLY the JSON array, nothing else.`;

  let reply: string;
  try {
    reply = await llmChat([{ role: "user", content: prompt }]);
  } catch {
    return others.slice(0, limit).map((p) => ({
      productId: String(p._id),
      reason: "Popular in this category",
    }));
  }

  try {
    const cleaned = cleanJsonReply(reply);
    return JSON.parse(cleaned);
  } catch {
    return others.slice(0, limit).map((p) => ({
      productId: String(p._id),
      reason: "Popular in this category",
    }));
  }
}
