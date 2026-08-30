import { Router } from "express";
import { createCart, getCart, addItem, updateItem, removeItem, clearCart } from "../controllers/cartController";
import { optionalAuth, forbidAdmin } from "../middleware/auth";

const router = Router();

function wrap(fn: (...args: any[]) => Promise<any>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.post("/", wrap(createCart));
router.get("/:cartId", wrap(getCart));
router.post("/:cartId/items", optionalAuth, forbidAdmin, wrap(addItem));
router.patch("/:cartId/items/:productId", optionalAuth, forbidAdmin, wrap(updateItem));
router.delete("/:cartId/items/:productId", optionalAuth, forbidAdmin, wrap(removeItem));
router.delete("/:cartId", optionalAuth, forbidAdmin, wrap(clearCart));

export default router;
