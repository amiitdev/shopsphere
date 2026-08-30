import { Router } from "express";
import {
  getProductReviews,
  createReview,
  adminListReviews,
  adminDeleteReview,
} from "../controllers/reviewController";
import { requireAuth, optionalAuth, requireAdmin, forbidAdmin } from "../middleware/auth";

const router = Router({ mergeParams: true });

function wrap(fn: (...args: any[]) => Promise<any>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Public: list a product's reviews + rating summary (optionally enriched for a logged-in customer).
router.get("/", optionalAuth, wrap(getProductReviews));

// Customer: add a review (must be authenticated and not an admin).
router.post("/", requireAuth, forbidAdmin, wrap(createReview));

// Admin: moderate all reviews.
router.get("/admin/all", requireAuth, requireAdmin, wrap(adminListReviews));
router.delete("/admin/:id", requireAuth, requireAdmin, wrap(adminDeleteReview));

export default router;
