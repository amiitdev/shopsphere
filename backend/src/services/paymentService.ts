import { z } from "zod";
import crypto from "node:crypto";

const cardSchema = z.object({
  number: z.string().regex(/^\d{12,19}$/, "Card number must be 12-19 digits"),
  name: z.string().min(1, "Cardholder name is required"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be MM/YY"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3-4 digits"),
});

export type CardInput = z.infer<typeof cardSchema>;

export function processPayment(input: { amount: number; card: CardInput }) {
  const parsed = cardSchema.safeParse(input.card);
  if (!parsed.success) {
    throw new Error("Invalid card: " + parsed.error.issues.map((i) => i.message).join("; "));
  }
  return {
    provider: "mock" as const,
    status: "paid" as const,
    transactionId: crypto.randomUUID(),
    paidAt: new Date(),
    last4: input.card.number.slice(-4),
  };
}
