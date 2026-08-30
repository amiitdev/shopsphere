import { Router } from "express";
import {
  createOrder,
  getOrder,
  listMyOrders,
  adminListOrders,
  adminUpdateOrderStatus,
  adminUpdateOrderItemStatus,
} from "../controllers/orderController";
import { requireAuth, requireAdmin, forbidAdmin } from "../middleware/auth";

const router = Router();

function wrap(fn: (...args: any[]) => Promise<any>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.post("/", requireAuth, forbidAdmin, wrap(createOrder));
router.get("/", requireAuth, requireAdmin, wrap(adminListOrders));
router.patch("/:id/status", requireAuth, requireAdmin, wrap(adminUpdateOrderStatus));
router.patch("/:id/items/:productId/status", requireAuth, requireAdmin, wrap(adminUpdateOrderItemStatus));
router.get("/me", requireAuth, wrap(listMyOrders));
router.get("/:id", wrap(getOrder));

export default router;
