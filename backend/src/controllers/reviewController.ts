import type { Request, Response } from "express";
import { z } from "zod";
import * as reviewService from "../services/reviewService";
import { RATING_VALUES } from "../models/Review";
import { HttpError } from "../middleware/errorHandler";

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().max(2000).optional(),
});

export async function createReview(req: Request, res: Response) {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid review data");
  }
  const review = await reviewService.writeReview(req.params.productId, req.user!.id, parsed.data);
  res.status(201).json(review);
}

export async function getProductReviews(req: Request, res: Response) {
  const productId = req.params.productId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const [list, summary] = await Promise.all([
    reviewService.listReviews(productId, page, limit),
    reviewService.ratingSummary(productId),
  ]);

  const payload: Record<string, unknown> = {
    items: list.items,
    total: list.total,
    page,
    limit,
    summary,
  };
  if (req.user && req.user.role === "user") {
    payload.canReview = await reviewService.hasPurchasedProductId(req.user.id, productId);
    payload.verifiedPurchase = await reviewService.isVerifiedPurchase(req.user.id, productId);
  }
  res.json(payload);
}

export async function adminListReviews(req: Request, res: Response) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await reviewService.listAllReviews(page, limit);
  res.json(result);
}

export async function adminDeleteReview(req: Request, res: Response) {
  const review = await reviewService.deleteReview(req.params.id);
  if (!review) throw new HttpError(404, "Review not found");
  res.json({ message: "Review deleted" });
}
