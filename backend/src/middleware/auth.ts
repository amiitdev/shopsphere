import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { HttpError } from "./errorHandler";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function extractToken(req: Request): string | null {
  const token = req.cookies?.[config.authTokenName];
  if (typeof token === "string") return token;
  return null;
}

function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, config.authSecret) as AuthUser;
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role ?? "user",
    };
  } catch {
    return null;
  }
}

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) return next(new HttpError(401, "Authentication required"));
  if (req.user.role !== "admin") return next(new HttpError(403, "Admin access required"));
  next();
};

export const forbidAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role === "admin") {
    return next(new HttpError(403, "Admin accounts cannot purchase products"));
  }
  next();
};

export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next(new HttpError(401, "Authentication required"));
  const user = verifyToken(token);
  if (!user) return next(new HttpError(401, "Invalid or expired token"));
  req.user = user;
  next();
};

export const optionalAuth: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (token) {
    const user = verifyToken(token);
    if (user) req.user = user;
  }
  next();
};
