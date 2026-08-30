import crypto from "node:crypto";
import mongoose from "mongoose";
import { CartModel, type CartDocument } from "../models/Cart";
import { ProductModel } from "../models/Product";
import { HttpError } from "../middleware/errorHandler";

export async function getOrCreate(cartId?: string) {
  if (cartId) {
    const existing = await CartModel.findOne({ cartId }).lean();
    if (existing) return existing;
  }
  const id = cartId ?? crypto.randomUUID();
  const cart = await CartModel.create({ cartId: id, items: [] });
  return cart.toObject();
}

export async function get(cartId: string) {
  return CartModel.findOne({ cartId }).lean();
}

export async function addItem(cartId: string, productId: string, quantity: number) {
  const product = await ProductModel.findById(productId).lean();
  if (!product) throw new HttpError(404, "Product not found");

  const cart = await CartModel.findOne({ cartId });
  if (!cart) throw new HttpError(404, "Cart not found");

  const oid = new mongoose.Types.ObjectId(productId);
  const existing = cart.items.find((i) => i.productId.equals(oid));
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + quantity);
  } else {
    cart.items.push({
      productId: oid,
      sourceId: product.sourceId,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity,
    });
  }

  await cart.save();
  return cart.toObject();
}

export async function updateQty(cartId: string, productId: string, quantity: number) {
  const cart = await CartModel.findOne({ cartId });
  if (!cart) throw new HttpError(404, "Cart not found");

  const oid = new mongoose.Types.ObjectId(productId);
  const item = cart.items.find((i) => i.productId.equals(oid));
  if (!item) throw new HttpError(404, "Item not in cart");

  item.quantity = quantity;
  await cart.save();
  return cart.toObject();
}

export async function removeItem(cartId: string, productId: string) {
  const cart = await CartModel.findOne({ cartId });
  if (!cart) throw new HttpError(404, "Cart not found");

  const oid = new mongoose.Types.ObjectId(productId);
  cart.items = cart.items.filter((i) => !i.productId.equals(oid)) as any;
  await cart.save();
  return cart.toObject();
}

export async function clear(cartId: string) {
  const cart = await CartModel.findOne({ cartId });
  if (!cart) throw new HttpError(404, "Cart not found");

  cart.items = [] as any;
  await cart.save();
  return cart.toObject();
}
