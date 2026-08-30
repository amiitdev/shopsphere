import type { Request, Response } from "express";
import { z } from "zod";
import * as cartService from "../services/cartService";

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive().max(99).default(1),
});

const updateQtySchema = z.object({
  quantity: z.coerce.number().int().positive().max(99),
});

export async function createCart(_req: Request, res: Response) {
  const cart = await cartService.getOrCreate();
  res.json({ cartId: cart.cartId, items: cart.items });
}

export async function getCart(req: Request, res: Response) {
  const cart = await cartService.get(req.params.cartId);
  if (!cart) return res.status(404).json({ error: "Cart not found" });
  res.json(cart);
}

export async function addItem(req: Request, res: Response) {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.format() });
  }
  const cart = await cartService.addItem(req.params.cartId, parsed.data.productId, parsed.data.quantity);
  res.json(cart);
}

export async function updateItem(req: Request, res: Response) {
  const parsed = updateQtySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Validation failed", details: parsed.error.format() });
  }
  const cart = await cartService.updateQty(req.params.cartId, req.params.productId, parsed.data.quantity);
  res.json(cart);
}

export async function removeItem(req: Request, res: Response) {
  const cart = await cartService.removeItem(req.params.cartId, req.params.productId);
  res.json(cart);
}

export async function clearCart(req: Request, res: Response) {
  const cart = await cartService.clear(req.params.cartId);
  res.json(cart);
}
