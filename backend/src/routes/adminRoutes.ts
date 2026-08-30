import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrdersForAdmin,
  cancelOrder,
  uploadProductImage,
} from "../controllers/adminController";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { uploadImage } from "../middleware/upload";
import { adminListReviews, adminDeleteReview } from "../controllers/reviewController";

const router = express.Router();

function wrap(fn: (...args: any[]) => Promise<any>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
}

// All routes in this router require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

// Product Management
router.post("/products", wrap(createProduct));
router.put("/products/:id", wrap(updateProduct));
router.delete("/products/:id", wrap(deleteProduct));

// Image upload
router.post("/images", uploadImage.single("image"), wrap(uploadProductImage));

// Order Management
router.get("/orders", wrap(getAllOrdersForAdmin));
router.patch("/orders/:id/cancel", wrap(cancelOrder));

// Review Management
router.get("/reviews", wrap(adminListReviews));
router.delete("/reviews/:id", wrap(adminDeleteReview));

export default router;