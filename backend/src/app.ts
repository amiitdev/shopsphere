import express, { type Express } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import productsRouter from "./routes/products";
import authRouter from "./routes/auth";
import cartRouter from "./routes/cart";
import ordersRouter from "./routes/orders";
import adminRouter from "./routes/adminRoutes";
import reviewsRouter from "./routes/reviews";
import aiRouter from "./routes/ai";
import { uploadsDir } from "./middleware/upload";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { config, isProduction } from "./config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function imageUrl(file: string): string {
  return `/images/${file}`;
}

export function createApp(): Express {
  const app = express();
  app.use(
    helmet({
      hsts: isProduction()
        ? { maxAge: 31536000, includeSubDomains: true, preload: true }
        : false,
      referrerPolicy: { policy: "no-referrer" },
    })
  );
  app.use(
    cors({
      origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(","),
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction() ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  app.use(
    "/images",
    express.static(path.join(__dirname, "seed-images"), {
      maxAge: "7d",
      immutable: true,
    })
  );

  app.use(
    "/uploads",
    express.static(uploadsDir, {
      maxAge: "1d",
    })
  );

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/products", productsRouter);
  app.use("/api/products/:productId/reviews", reviewsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
