import { Router } from "express";
import { chat, search, sentiment, recommendations } from "../controllers/aiController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

function wrap(fn: (...args: any[]) => Promise<any>) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
}

// All AI routes use optional auth (works for guests too)
router.use(optionalAuth);

router.post("/chat", wrap(chat));
router.post("/search", wrap(search));
router.post("/sentiment", wrap(sentiment));
router.get("/recommendations/:id", wrap(recommendations));

export default router;
