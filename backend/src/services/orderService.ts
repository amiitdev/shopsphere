import crypto from "node:crypto";
import { OrderModel } from "../models/Order";
import * as cartService from "./cartService";
import { processPayment, type CardInput } from "./paymentService";
import { HttpError } from "../middleware/errorHandler";

interface Customer {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
}

export async function checkout(input: {
  cartId: string;
  customer: Customer;
  userId?: string;
  card: CardInput;
}) {
  const cart = await cartService.get(input.cartId);
  if (!cart || cart.items.length === 0) {
    throw new HttpError(400, "Cart is empty");
  }

  const subtotal = Math.round(
    cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
  ) / 100;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  const payment = processPayment({ amount: total, card: input.card });

  const orderNumber = "ORD-" + Date.now() + "-" + crypto.randomUUID().slice(0, 8);

  const order = await OrderModel.create({
    orderNumber,
    cartId: input.cartId,
    userId: input.userId ?? null,
    items: cart.items,
    subtotal,
    tax,
    shipping,
    total,
    customer: input.customer,
    payment,
    status: "pending",
  });

  await cartService.clear(input.cartId);

  return order.toObject();
}

export async function getOrder(id: string) {
  return OrderModel.findById(id).lean();
}

export async function listForUser(userId: string) {
  return OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function listAll(status?: string) {
  const query = status ? { status } : {};
  return OrderModel.find(query).sort({ createdAt: -1 }).lean();
}

export const ORDER_STATUSES = ["pending", "confirmed", "delivered", "cancelled"] as const;

export async function cancelOrder(id: string) {
  const order = await OrderModel.findById(id);
  if (!order) return null;

  if (order.status === "cancelled") {
    throw new HttpError(400, "Order is already cancelled");
  }
  if (order.status === "delivered") {
    throw new HttpError(400, "Delivered orders cannot be cancelled");
  }

  order.status = "cancelled";
  for (const item of order.items) {
    item.status = "cancelled";
  }

  await order.save();
  return order.toObject();
}

export async function updateStatus(id: string, status: string) {
  const order = await OrderModel.findById(id);
  if (!order) return null;

  order.status = status as any;
  for (const item of order.items) {
    item.status = status as any;
  }

  await order.save();
  return order.toObject();
}

export async function updateItemStatus(orderId: string, productId: string, status: string) {
  const order = await OrderModel.findById(orderId);
  if (!order) return null;

  const item = order.items.find((it) => it.productId === productId);
  if (!item) return null;

  item.status = status as any;

  // Compute the overall order status based on item statuses
  const statuses = order.items.map((it) => it.status || "pending");
  if (statuses.every((s) => s === "delivered")) {
    order.status = "delivered";
  } else if (statuses.every((s) => s === "confirmed" || s === "delivered")) {
    order.status = "confirmed";
  } else {
    order.status = "pending";
  }

  await order.save();
  return order.toObject();
}
