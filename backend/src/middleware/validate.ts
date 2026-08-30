import type { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema } from "zod";

export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: result.error.format(),
      });
    }
    req.query = result.data as Request["query"];
    next();
  };
}

export function validateBody(schema: ZodSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.format(),
      });
    }
    req.body = result.data;
    next();
  };
}
