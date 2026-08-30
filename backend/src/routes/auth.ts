import { Router } from "express";
import { signup, login, logout, me } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

function wrap(fn: (...args: any[]) => Promise<any>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.post("/signup", wrap(signup));
router.post("/login", wrap(login));
router.post("/logout", wrap(logout));
router.get("/me", requireAuth, wrap(me));

export default router;
