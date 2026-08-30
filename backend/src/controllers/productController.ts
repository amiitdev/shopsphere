import type { Request, Response, RequestHandler } from "express";
import { z } from "zod";
import * as service from "../services/productService";
import { HttpError } from "../middleware/errorHandler";

const listQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const validateListQuery: RequestHandler = (req, res, next) => {
  const result = listQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new HttpError(400, "Invalid query parameters");
  }
  (req as Request & { parsedQuery: z.infer<typeof listQuerySchema> }).parsedQuery =
    result.data;
  next();
};

export async function listProducts(req: Request, res: Response) {
  const q = (req as Request & { parsedQuery: z.infer<typeof listQuerySchema> })
    .parsedQuery;
  const result = await service.listProducts(q);
  res.json(result);
}

export async function getProduct(req: Request, res: Response) {
  const product = await service.getProductById(req.params.id);
  if (!product) throw new HttpError(404, "Product not found");
  res.json(product);
}

export async function listCategories(req: Request, res: Response) {
  res.json(await service.listCategories());
}

export function makeAsync(handler: RequestHandler): RequestHandler {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}
