import type { Request, Response } from "express";
import { z } from "zod";
import { ProductModel } from "../models/Product";
import { OrderModel } from "../models/Order";
import * as orderService from "../services/orderService";
import { HttpError } from "../middleware/errorHandler";

const imageSchema = z
  .string()
  .min(1)
  .refine(
    (value) =>
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("/images/") ||
      value.startsWith("/uploads/"),
    { message: "Image must be an http(s) URL or a local /images/ or /uploads/ path" }
  );

const productSchema = z.object({
  title: z.string().min(1).max(120),
  price: z.coerce.number().positive(),
  description: z.string().min(1),
  category: z.string().min(1),
  image: imageSchema,
  rating: z
    .object({
      rate: z.coerce.number().min(0).max(5),
      count: z.coerce.number().int().min(0),
    })
    .optional(),
});

export async function createProduct(req: Request, res: Response) {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid product data");
  }

  const top = await ProductModel.findOne().sort({ sourceId: -1 }).select("sourceId");
  const sourceId = (top?.sourceId ?? 0) + 1;

  const product = await ProductModel.create({
    ...parsed.data,
    sourceId,
    rating: parsed.data.rating ?? { rate: 0, count: 0 },
  });
  res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response) {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    throw new HttpError(400, "Invalid product data");
  }

  const product = await ProductModel.findByIdAndUpdate(
    req.params.id,
    { $set: parsed.data },
    { new: true, runValidators: true }
  );
  if (!product) throw new HttpError(404, "Product not found");
  res.json(product);
}

export async function deleteProduct(req: Request, res: Response) {
  const product = await ProductModel.findByIdAndDelete(req.params.id);
  if (!product) throw new HttpError(404, "Product not found");
  res.json({ message: "Product deleted successfully" });
}

export async function uploadProductImage(req: Request, res: Response) {
  if (!req.file || !req.file.filename) throw new HttpError(400, "No image file provided");
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
}

export async function getAllOrdersForAdmin(req: Request, res: Response) {
  const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
  res.json(orders);
}

export async function cancelOrder(req: Request, res: Response) {
  const order = await orderService.cancelOrder(req.params.id);
  if (!order) throw new HttpError(404, "Order not found");
  res.json(order);
}