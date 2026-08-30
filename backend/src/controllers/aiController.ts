import type { Request, Response } from "express";
import { z } from "zod";
import * as aiService from "../services/aiService";
import { HttpError } from "../middleware/errorHandler";

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export async function chat(req: Request, res: Response) {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Invalid chat input");

  const { reply, products } = await aiService.chat(
    parsed.data.message,
    parsed.data.history.map((h) => ({ ...h, role: h.role as "user" | "assistant" }))
  );
  res.json({ reply, products });
}

const searchSchema = z.object({
  query: z.string().min(2).max(200),
});

export async function search(req: Request, res: Response) {
  const parsed = searchSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Invalid search query");

  const results = await aiService.semanticSearch(parsed.data.query);
  res.json({ results });
}

const sentimentSchema = z.object({
  text: z.string().min(1).max(2000),
});

export async function sentiment(req: Request, res: Response) {
  const parsed = sentimentSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Invalid text");

  const result = await aiService.analyzeSentiment(parsed.data.text);
  res.json(result);
}

const recommendSchema = z.object({
  productId: z.string().length(24),
  limit: z.number().int().min(1).max(10).optional().default(4),
});

export async function recommendations(req: Request, res: Response) {
  const parsed = recommendSchema.safeParse({
    productId: req.params.id,
    limit: Number(req.query.limit) || 4,
  });
  if (!parsed.success) throw new HttpError(400, "Invalid product ID");

  const results = await aiService.getRecommendations(
    parsed.data.productId,
    parsed.data.limit
  );
  res.json({ recommendations: results });
}
