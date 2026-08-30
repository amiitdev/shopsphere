import type { Request, Response } from "express";
import { z } from "zod";
import * as orderService from "../services/orderService";

const cardSchema = z.object({
  number: z.string().regex(/^\d{12,19}$/),
  name: z.string().min(1),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/),
  cvv: z.string().regex(/^\d{3,4}$/),
});

const checkoutSchema = z.object({
  cartId: z.string().min(1),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(1),
  }),
  card: cardSchema,
});

export async function createOrder(req: Request, res: Response) {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.format() });
  }
  const order = await orderService.checkout({
    cartId: parsed.data.cartId,
    customer: parsed.data.customer,
    userId: req.user?.id,
    card: parsed.data.card,
  });
  res.status(201).json(order);
}

export async function getOrder(req: Request, res: Response) {
  const order = await orderService.getOrder(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
}

export async function listMyOrders(req: Request, res: Response) {
  const orders = await orderService.listForUser(req.user!.id);
  res.json(orders);
}

const statusQuerySchema = z.object({
  status: z.enum(orderService.ORDER_STATUSES).optional(),
});

export async function adminListOrders(req: Request, res: Response) {
  const parsed = statusQuerySchema.safeParse(req.query);
  const status = parsed.success ? parsed.data.status : undefined;
  const orders = await orderService.listAll(status);
  res.json(orders);
}

const statusSchema = z.object({
  status: z.enum(orderService.ORDER_STATUSES),
});

export async function adminUpdateOrderStatus(req: Request, res: Response) {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.format() });
  }
  const order = await orderService.updateStatus(req.params.id, parsed.data.status);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
}

export async function adminUpdateOrderItemStatus(req: Request, res: Response) {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.format() });
  }
  const order = await orderService.updateItemStatus(
    req.params.id,
    req.params.productId,
    parsed.data.status
  );
  if (!order) return res.status(404).json({ error: "Order or item not found" });
  res.json(order);
}
